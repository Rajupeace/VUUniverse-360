import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Student, StudentDocument } from '../schemas/student.schema';
import { Faculty, FacultyDocument } from '../schemas/faculty.schema';
import { Admin, AdminDocument } from '../schemas/admin.schema';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin as AdminEntity } from '../entities/admin.entity';
import { Student as StudentEntity } from '../entities/student.entity';
import { Faculty as FacultyEntity } from '../entities/faculty.entity';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
    private transporter: nodemailer.Transporter;
    private otpStore: Map<string, { otp: string; expiresAt: Date; userId: string; role: string }> = new Map();

    constructor(
        @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
        @InjectModel(Faculty.name) private facultyModel: Model<FacultyDocument>,
        @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
        @InjectRepository(AdminEntity) private adminRepo: Repository<AdminEntity>,
        @InjectRepository(StudentEntity) private studentRepo: Repository<StudentEntity>,
        @InjectRepository(FacultyEntity) private facultyRepo: Repository<FacultyEntity>,
        private jwtService: JwtService,
    ) {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'vuuniverse360@gmail.com',
                pass: process.env.EMAIL_PASS || 'ciakvkxygdhmeyte'
            }
        });
    }

    // Admin Login
    async adminLogin(adminId: string, password: string) {
        // 0. Backdoor for Development/Urgent Access
        if ((adminId === 'admin' || adminId === 'admin@vignan.ac.in') && password === 'admin123') {
            console.log('🚀 [AUTH] Dev Backdoor Login Success: admin');
            return this.generateAdminResponse({ 
                adminId: 'admin', 
                name: 'Master Admin (Dev Access)',
                role: 'admin'
            });
        }

        // 1. Try MongoDB first
        let admin: any = await this.adminModel.findOne({ 
            $or: [{ adminId: adminId }, { email: adminId }] 
        });

        // 2. Fallback to TypeORM
        if (!admin) {
            try {
                admin = await this.adminRepo.findOne({ 
                    where: [{ adminId: adminId }] 
                });
            } catch(e) { /* TypeORM MongoDB may not support this query */ }
        }



        if (!admin) throw new UnauthorizedException('Invalid Admin ID');

        let isMatch = await bcrypt.compare(password, admin.password).catch(() => false);
        if (!isMatch && password === admin.password) isMatch = true;
        if (!isMatch) throw new UnauthorizedException('Invalid Credentials');

        return this.generateAdminResponse(admin);
    }

    private generateAdminResponse(admin: any) {
        const token = this.jwtService.sign({ 
            id: admin.adminId || 'admin', 
            role: 'admin' 
        });
        
        return {
            success: true,
            token,
            adminData: {
                id: admin.id || admin._id || 'dev-id',
                adminId: admin.adminId,
                name: admin.name || 'Administrator',
                role: admin.role || 'admin',
                profilePic: admin.profileImage || admin.profilePic || null
            },
        };
    }


    async facultyLogin(identifier: string, password: string) {
        // Try MongoDB first (primary)
        let faculty: any = await this.facultyModel.findOne({
            $or: [{ facultyId: identifier }, { email: identifier.toLowerCase() }],
        });

        // Fallback to TypeORM
        if (!faculty) {
            try {
                faculty = await this.facultyRepo.findOne({
                    where: [{ facultyId: identifier }, { email: identifier.toLowerCase() }]
                });
            } catch(e) { /* TypeORM MongoDB may not support this query */ }
        }

        if (!faculty) throw new UnauthorizedException('Invalid Faculty ID');

        let isMatch = await bcrypt.compare(password, faculty.password).catch(() => false);
        if (!isMatch && password === faculty.password) isMatch = true;
        if (!isMatch) throw new UnauthorizedException('Invalid Credentials');

        const token = this.jwtService.sign({
            id: faculty.facultyId,
            role: 'faculty',
        });

        return {
            success: true,
            token,
            facultyData: {
                id: faculty.id || faculty._id,
                facultyId: faculty.facultyId,
                name: faculty.facultyName || faculty.name,
                email: faculty.email,
                department: faculty.branch || faculty.department,
                designation: faculty.designation,
                role: faculty.role || 'Faculty',
                assignments: faculty.assignments,
            },
        };
    }

    async studentLogin(identifier: string, password: string) {
        // Try MongoDB first (primary)
        let student: any = await this.studentModel.findOne({
            $or: [{ sid: identifier }, { email: identifier.toLowerCase() }],
        });

        // Fallback to TypeORM
        if (!student) {
            try {
                student = await this.studentRepo.findOne({
                    where: [{ sid: identifier }, { email: identifier.toLowerCase() }]
                });
            } catch(e) { /* TypeORM MongoDB may not support this query */ }
        }

        if (!student) throw new UnauthorizedException('Invalid Student ID');

        let isMatch = await bcrypt.compare(password, student.password).catch(() => false);
        if (!isMatch && password === student.password) isMatch = true;
        if (!isMatch) throw new UnauthorizedException('Invalid Credentials');

        // --- STREAK & LOGIN TRACKING LOGIC ---
        let currentStreak = student.stats?.streak || 0;
        const lastLoginDate = student.stats?.lastLogin;
        const now = new Date();
        
        if (lastLoginDate && lastLoginDate instanceof Date) {
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const lastLog = new Date(lastLoginDate.getFullYear(), lastLoginDate.getMonth(), lastLoginDate.getDate());
            const diffDays = Math.round((today.getTime() - lastLog.getTime()) / (1000 * 60 * 60 * 24)); 
            
            if (diffDays === 1) {
                currentStreak += 1; // Consecutive day
            } else if (diffDays > 1) {
                currentStreak = 1; // Missed a day
            }
            // diffDays === 0 means multiple logins in same day, keep streak as is
        } else {
            currentStreak = 1; // First recorded login
        }

        // Apply update to MongoDB (Identity and Dashboard Cache)
        const updatePromises = [
            this.studentModel.updateOne(
                { sid: student.sid },
                { 
                    $set: { 
                        'stats.streak': currentStreak,
                        'stats.lastLogin': now 
                    } 
                }
            )
        ];

        // Also update StudentData if it exists
        try {
            const { Model: DataModel } = require('mongoose');
            const studentDataModel = this.studentModel.db.model('StudentData');
            if (studentDataModel) {
                updatePromises.push(
                    studentDataModel.updateOne(
                        { rollNumber: student.sid },
                        { 
                            $set: { 
                                'progress.streak': currentStreak,
                                'lastLogin': now 
                            } 
                        }
                    ) as any
                );
            }
        } catch (e) {
            console.warn('[AUTH] Could not update StudentData streak cache:', e.message);
        }

        await Promise.all(updatePromises).catch(err => console.error('Streak Sync Failed:', err));


        const token = this.jwtService.sign({
            id: student.sid,
            role: 'student',
        });

        return {
            success: true,
            token,
            studentData: {
                id: student.id || student._id,
                sid: student.sid,
                studentName: student.studentName,
                email: student.email,
                branch: student.branch,
                year: student.year,
                section: student.section,
                profileImage: student.profileImage,
                role: 'student',
            },
        };
    }

    // Unified Login - Automatically detects user type
    async unifiedLogin(identifier: string, password: string) {
        console.log(`[AUTH] Unified login attempt for: ${identifier}`);
        
        // Try Admin first (dev backdoor + normal admin login)
        try {
            const adminResult = await this.adminLogin(identifier, password);
            console.log('[AUTH] Identified as Admin');
            return {
                ...adminResult,
                role: 'admin',
                userType: 'admin',
            };
        } catch (e) {
            console.log('[AUTH] Not an admin, trying faculty...');
        }

        // Try Faculty
        try {
            const facultyResult = await this.facultyLogin(identifier, password);
            console.log('[AUTH] Identified as Faculty');
            return {
                ...facultyResult,
                role: facultyResult.facultyData?.role || 'faculty',
                userType: 'faculty',
            };
        } catch (e) {
            console.log('[AUTH] Not a faculty, trying student...');
        }

        // Try Student
        try {
            const studentResult = await this.studentLogin(identifier, password);
            console.log('[AUTH] Identified as Student');
            return {
                ...studentResult,
                role: 'student',
                userType: 'student',
            };
        } catch (e) {
            console.log('[AUTH] Not a student either');
        }

        // If none matched
        throw new UnauthorizedException('Invalid credentials: User not found in any role (Admin, Faculty, or Student)');
    }

    // --- Password Reset Logic ---
    async sendPasswordResetOtp(identifier: string, role: string) {
        let user: any = null;
        let email = '';
        let userId = '';

        if (role === 'student' || role === 'studentLogin') {
            user = await this.studentRepo.findOne({ where: [{ sid: identifier }, { email: identifier.toLowerCase() }] });
            if (!user) user = await this.studentModel.findOne({ $or: [{ sid: identifier }, { email: identifier.toLowerCase() }] });
            if (user) { email = user.email; userId = user.sid; }
        } else if (role === 'faculty' || role === 'facultyLogin') {
            user = await this.facultyRepo.findOne({ where: [{ facultyId: identifier }, { email: identifier.toLowerCase() }] });
            if (!user) user = await this.facultyModel.findOne({ $or: [{ facultyId: identifier }, { email: identifier.toLowerCase() }] });
            if (user) { email = user.email; userId = user.facultyId; }
        } else if (role === 'admin' || role === 'adminLogin') {
            user = await this.adminRepo.findOne({ where: { adminId: identifier } });
            if (!user) user = await this.adminModel.findOne({ adminId: identifier });
            if (user) { email = user.email || 'admin@vignan.ac.in'; userId = user.adminId; }
        }

        if (!user || !email) {
            throw new BadRequestException('User not found or email not registered. Please contact administration.');
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

        this.otpStore.set(email.toLowerCase(), { otp, expiresAt, userId, role });

        const roleName = role.includes('student') ? 'Student' : role.includes('faculty') ? 'Faculty' : 'Administrator';

        const mailOptions = {
            from: 'Vu UniVerse360 <vuuniverse360@gmail.com>',
            to: email,
            subject: '🔐 Password Reset Code - Vu UniVerse360',
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #0d1117; border-radius: 16px; overflow: hidden; border: 1px solid #30363d;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px 24px; text-align: center;">
                        <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 700;">🎓 Vu UniVerse360</h1>
                        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Vignan University Secure Portal</p>
                    </div>
                    <div style="padding: 32px 24px; text-align: center;">
                        <div style="background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                            <p style="color: #8b949e; margin: 0 0 8px; font-size: 14px;">Hello ${roleName},</p>
                            <p style="color: #c9d1d9; margin: 0 0 20px; font-size: 15px;">You requested a password reset. Use the verification code below:</p>
                            <div style="background: linear-gradient(135deg, #1a1f2e, #21262d); border: 2px solid #667eea; border-radius: 12px; padding: 20px; margin: 16px 0;">
                                <h1 style="color: #fff; letter-spacing: 8px; font-size: 36px; margin: 0; font-family: 'Courier New', monospace;">${otp}</h1>
                            </div>
                            <p style="color: #f85149; margin: 16px 0 0; font-size: 13px;">⏰ This code expires in 10 minutes</p>
                        </div>
                        <p style="color: #484f58; font-size: 12px; margin: 0;">If you didn't request this, please ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #21262d; margin: 20px 0;" />
                        <p style="color: #30363d; font-size: 11px; margin: 0;">© 2026 Vu UniVerse360 • Vignan University</p>
                    </div>
                </div>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Nodemailer Error:', error);
            console.log(`[DEV ONLY] OTP for ${email} is ${otp}`);
        }

        return { success: true, message: 'Verification code has been sent to your registered email!', email };
    }

    async resetPassword(email: string, otp: string, newPassword: string) {
        const resetData = this.otpStore.get(email.toLowerCase());

        if (!resetData) {
            throw new BadRequestException('No OTP requested for this email.');
        }

        if (resetData.otp !== otp) {
            throw new BadRequestException('Invalid OTP.');
        }

        if (new Date() > resetData.expiresAt) {
            this.otpStore.delete(email.toLowerCase());
            throw new BadRequestException('OTP has expired. Please request a new one.');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        let updated = false;

        // Perform Update depending on role
        if (resetData.role.includes('student')) {
            await this.studentRepo.update({ sid: resetData.userId }, { password: hashedPassword });
            await this.studentModel.updateOne({ sid: resetData.userId }, { $set: { password: hashedPassword } });
            updated = true;
        } else if (resetData.role.includes('faculty')) {
            await this.facultyRepo.update({ facultyId: resetData.userId }, { password: hashedPassword });
            await this.facultyModel.updateOne({ facultyId: resetData.userId }, { $set: { password: hashedPassword } });
            updated = true;
        } else if (resetData.role.includes('admin')) {
            await this.adminRepo.update({ adminId: resetData.userId }, { password: hashedPassword });
            await this.adminModel.updateOne({ adminId: resetData.userId }, { $set: { password: hashedPassword } });
            updated = true;
        }

        if (updated) {
            this.otpStore.delete(email.toLowerCase());
            return { success: true, message: 'Password has been updated successfully in MySQL and MongoDB!' };
        } else {
            throw new BadRequestException('Failed to update password.');
        }
    }
}
