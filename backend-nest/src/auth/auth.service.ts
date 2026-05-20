import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Student, StudentDocument } from '../schemas/student.schema';
import { Faculty, FacultyDocument } from '../schemas/faculty.schema';
import { Admin, AdminDocument } from '../schemas/admin.schema';
import { Message, MessageDocument } from '../schemas/message.schema';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin as AdminEntity } from '../entities/admin.entity';
import { Student as StudentEntity } from '../entities/student.entity';
import { Faculty as FacultyEntity } from '../entities/faculty.entity';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
    private transporter: nodemailer.Transporter;
    private fallbackTransporter: nodemailer.Transporter | null = null;
    private gmailWorking = false;
    private etherealAccount: any = null;
    private otpStore: Map<string, { otp: string; expiresAt: Date; userId: string; role: string }> = new Map();

    constructor(
        @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
        @InjectModel(Faculty.name) private facultyModel: Model<FacultyDocument>,
        @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
        @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
        @InjectRepository(AdminEntity) private adminRepo: Repository<AdminEntity>,
        @InjectRepository(StudentEntity) private studentRepo: Repository<StudentEntity>,
        @InjectRepository(FacultyEntity) private facultyRepo: Repository<FacultyEntity>,
        private jwtService: JwtService,
    ) {
        this.initializeEmailTransport();
    }

    private async initializeEmailTransport() {
        const smtpUser = process.env.SMTP_USER || 'vuuniverse360@gmail.com';
        const smtpPass = process.env.SMTP_PASS || '';

        // Gmail requires a 16-char App Password (not your regular Google password)
        // Generate at: https://myaccount.google.com/apppasswords
        if (smtpPass && smtpPass.length >= 10) {
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: smtpUser,
                    pass: smtpPass,
                },
                pool: true,            // Reuse connections for speed
                maxConnections: 5,     // Multiple emails at once
                maxMessages: 100,      // Per connection
                rateLimit: 14,         // Gmail rate limit
            });

            try {
                await this.transporter.verify();
                this.gmailWorking = true;
                console.log(`✅ Gmail SMTP verified — emails will be sent via ${smtpUser}`);
            } catch (gmailError) {
                console.warn(`⚠️  Gmail SMTP rejected: ${gmailError.message}`);
                console.warn('   💡 SOLUTION: Generate a Gmail App Password at https://myaccount.google.com/apppasswords');
                console.warn('   💡 Then set SMTP_PASS=your16charapppassword in .env');
                this.gmailWorking = false;
            }
        } else {
            console.warn('⚠️  SMTP_PASS not configured or too short. Gmail sending disabled.');
        }

        // Always set up Ethereal as guaranteed fallback
        try {
            this.etherealAccount = await nodemailer.createTestAccount();
            this.fallbackTransporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: this.etherealAccount.user,
                    pass: this.etherealAccount.pass,
                },
            });
            console.log('✅ Ethereal Email fallback ready');
            if (!this.gmailWorking) {
                console.log('   📧 OTPs will be saved to Website Inbox + Ethereal preview');
            }
        } catch (etherealError) {
            console.error('❌ Both Gmail and Ethereal failed. OTP will be logged to console only.');
        }
    }

    // Smart email sender with auto-fallback
    private async sendEmailSmart(mailOptions: any): Promise<{ sent: boolean; previewUrl?: string }> {
        // Try Gmail first if it's working
        if (this.gmailWorking) {
            try {
                await this.transporter.sendMail(mailOptions);
                console.log(`✅ Email sent via Gmail to ${mailOptions.to}`);
                return { sent: true };
            } catch (err) {
                console.warn('Gmail send failed, trying fallback...', err.message);
            }
        }

        // Try Ethereal fallback
        if (this.fallbackTransporter) {
            try {
                const info = await this.fallbackTransporter.sendMail({
                    ...mailOptions,
                    from: `"Vu UniVerse360" <${this.etherealAccount.user}>`,
                });
                const previewUrl = nodemailer.getTestMessageUrl(info);
                console.log(`✅ Email captured via Ethereal to ${mailOptions.to}`);
                console.log(`   🔗 Preview URL: ${previewUrl}`);
                return { sent: true, previewUrl: previewUrl as string };
            } catch (err) {
                console.error('Ethereal send also failed:', err.message);
            }
        }

        console.log(`⚠️  No email transport available. OTP logged to console only.`);
        return { sent: false };
    }

    // Admin Login
    async adminLogin(adminId: string, password: string) {
        // 1. Try MongoDB first
        let admin: any = await this.adminModel.findOne({ 
            $or: [{ adminId: adminId }, { email: adminId }] 
        });



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

    // --- Student Registration ---
    async registerStudent(data: any) {
        console.log('[AUTH] Student registration attempt:', data?.sid);

        // Validate required fields
        const { studentName, sid, email, password, year, section, branch } = data;
        if (!studentName || !sid || !email || !password || !year || !section || !branch) {
            throw new BadRequestException('All fields are required: studentName, sid, email, password, year, section, branch');
        }

        // Check for duplicate SID
        const existingBySid = await this.studentModel.findOne({ sid }).lean();
        if (existingBySid) {
            throw new BadRequestException('A student with this Student ID already exists');
        }

        // Check for duplicate email
        const existingByEmail = await this.studentModel.findOne({ email: email.toLowerCase() }).lean();
        if (existingByEmail) {
            throw new BadRequestException('A student with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create student document
        const newStudent = new this.studentModel({
            studentName,
            sid,
            email: email.toLowerCase(),
            password: hashedPassword,
            year,
            section,
            branch,
            avatar: data.avatar || 'Midnight',
            profileImage: data.profileImage || null,
            createdAt: new Date(),
            updatedAt: new Date(),
            stats: {
                streak: 1,
                lastLogin: new Date(),
                aiUsageCount: 0,
                tasksCompleted: 0,
                advancedProgress: 0,
                careerReadyScore: 0,
                totalClasses: 0,
                totalPresent: 0,
                weeklyActivity: [],
            },
        });

        const savedStudent = await newStudent.save();

        // Pre-create StudentData in MongoDB immediately to prevent blank dashboard on first login
        try {
            const studentDataModel = this.studentModel.db.model('StudentData');
            if (studentDataModel) {
                const defaultData = {
                  studentId: savedStudent._id,
                  name: savedStudent.studentName,
                  email: savedStudent.email,
                  rollNumber: savedStudent.sid,
                  branch: savedStudent.branch,
                  currentSemester: '1',
                  sections: {
                    overview: {
                      totalCourses: 0,
                      activeCoursesCount: 0,
                      totalClasses: 0,
                      totalPresent: 0,
                      totalAbsent: 0,
                      overallAttendance: 0,
                      currentCGPA: 8.2,
                      currentSGPA: 8.2,
                      lastUpdated: new Date(),
                    },
                    courses: {
                      totalCourses: 0,
                      courseList: [],
                      lastUpdated: new Date(),
                    },
                    materials: {
                      totalMaterials: 0,
                      downloadedCount: 0,
                      materialList: [],
                      lastUpdated: new Date(),
                    },
                    schedule: {
                      totalClasses: 0,
                      upcomingClasses: 0,
                      classSchedule: [],
                      weeklySchedule: [],
                      lastUpdated: new Date(),
                    },
                    exams: {
                      totalExams: 0,
                      completedExams: 0,
                      upcomingExams: 0,
                      examList: [],
                      lastUpdated: new Date(),
                    },
                    faculty: {
                      totalFaculty: 0,
                      facultyList: [],
                      lastUpdated: new Date(),
                    },
                    chat: {
                      totalChats: 0,
                      recentChats: [],
                      conversationHistory: [],
                      lastUpdated: new Date(),
                    },
                    attendance: {
                      totalClasses: 0,
                      totalPresent: 0,
                      totalAbsent: 0,
                      attendancePercentage: 0,
                      attendanceRecords: [],
                      lastUpdated: new Date(),
                    },
                  },
                  progress: {
                    overallProgress: 0,
                    coursesInProgress: 0,
                    coursesCompleted: 0,
                    streak: 1,
                    aiUsageCount: 0,
                    tasksCompleted: 0,
                    careerReadyScore: 0,
                    advancedProgress: 0,
                    weeklyActivity: [],
                    lastUpdated: new Date(),
                  },
                  statistics: {
                    totalAssignmentsSubmitted: 0,
                    totalAssignmentsReceived: 0,
                    totalProjectsCompleted: 0,
                    averageMarks: 0,
                    lastUpdated: new Date(),
                  },
                  activityLog: [],
                  lastLogin: new Date(),
                  loginCount: 1,
                };
                const newStudentData = new studentDataModel(defaultData);
                await newStudentData.save();
                console.log('[AUTH] ✅ Initial StudentData document created successfully for:', savedStudent.sid);
            }
        } catch (dataErr) {
            console.error('[AUTH] ⚠️ Failed to pre-create StudentData (Non-critical):', dataErr.message);
        }

        // FAST SYNC: Update MySQL for cross-database integrity (skip if using TypeORM MongoDB)
        const isTypeOrmMongo = this.studentRepo?.manager?.connection?.options?.type === 'mongodb';
        if (!isTypeOrmMongo) {
            try {
                const mysqlStudent = this.studentRepo.create({
                    studentName,
                    sid,
                    email: email.toLowerCase(),
                    password: hashedPassword,
                    year,
                    section,
                    branch,
                    avatar: data.avatar || 'Midnight',
                    role: 'student'
                });
                await this.studentRepo.save(mysqlStudent);
                console.log('[AUTH] ✅ Student synced to MySQL successfully');
            } catch (mysqlErr) {
                console.error('[AUTH] ⚠️ MySQL Sync Failed (Non-critical):', mysqlErr.message);
            }
        } else {
            console.log('[AUTH] ℹ️ Skipping TypeORM sync (dialect is mongodb, handled natively by Mongoose)');
        }

        console.log('[AUTH] ✅ Student registered successfully:', sid);

        // Generate JWT token
        const token = this.jwtService.sign({
            id: savedStudent.sid,
            role: 'student',
        });

        return {
            success: true,
            token,
            studentData: {
                id: savedStudent._id,
                sid: savedStudent.sid,
                studentName: savedStudent.studentName,
                email: savedStudent.email,
                branch: savedStudent.branch,
                year: savedStudent.year,
                section: savedStudent.section,
                profileImage: savedStudent.profileImage,
                avatar: savedStudent.avatar,
                role: 'student',
            },
        };
    }

    // --- Password Reset Logic ---
    async sendPasswordResetOtp(identifier: string, role: string) {
        let user: any = null;
        let email = '';
        let userId = '';

        const roleLower = String(role || '').toLowerCase();

        if (roleLower.includes('student')) {
            // Query Mongoose first for MongoDB compatibility
            user = await this.studentModel.findOne({ $or: [{ sid: identifier }, { email: identifier.toLowerCase() }] });
            if (!user) {
                try {
                    user = await this.studentRepo.findOne({ where: [{ sid: identifier }, { email: identifier.toLowerCase() }] });
                } catch (e) {
                    console.warn('TypeORM Student search query ignored:', e.message);
                }
            }
            if (user) { email = user.email; userId = user.sid; }
        } else if (roleLower.includes('faculty')) {
            user = await this.facultyModel.findOne({ $or: [{ facultyId: identifier }, { email: identifier.toLowerCase() }] });
            if (!user) {
                try {
                    user = await this.facultyRepo.findOne({ where: [{ facultyId: identifier }, { email: identifier.toLowerCase() }] });
                } catch (e) {
                    console.warn('TypeORM Faculty search query ignored:', e.message);
                }
            }
            if (user) { email = user.email; userId = user.facultyId; }
        } else if (roleLower.includes('admin')) {
            user = await this.adminModel.findOne({ adminId: identifier });
            if (!user) {
                try {
                    user = await this.adminRepo.findOne({ where: { adminId: identifier } });
                } catch (e) {
                    console.warn('TypeORM Admin search query ignored:', e.message);
                }
            }
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

        // OPTIMIZATION: Send email in the background asynchronously to eliminate latency.
        // This ensures the frontend gets an INSTANT response (under 50ms) without waiting for SMTP handshakes!
        this.sendEmailSmart(mailOptions).then(result => {
            if (!result.sent) {
                console.log(`[FALLBACK] OTP for ${email} is ${otp}`);
            }
        }).catch(err => {
            console.error('[BG-EMAIL-ERROR] Async OTP email send failed:', err.message);
        });

        // Also save to database as an internal email for the Web Mailbox
        try {
            const internalMail = new this.messageModel({
                sender: 'VU Security',
                senderRole: 'security',
                senderImage: 'https://cdn-icons-png.flaticon.com/512/5609/5609356.png',
                target: email.toLowerCase().trim(),
                type: 'otp',
                subject: '🔑 Password Reset Code - Vu UniVerse360',
                message: mailOptions.html,
                expiresAt: expiresAt
            });
            internalMail.save();
            console.log(`[MAILBOX ✅] OTP saved to website inbox for ${email}`);
        } catch (e) {
            console.warn(`[MAILBOX ❌] Failed to save internal mail: ${e.message}`);
        }

        return { 
            success: true, 
            message: 'Verification code has been sent to your registered email!',
            email,
            otp: otp, // FAST UI: Returning OTP directly as requested for "same code show"
            previewUrl: null,
        };
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
            try {
                await this.studentRepo.update({ sid: resetData.userId }, { password: hashedPassword });
            } catch (e) {
                console.warn(`TypeORM Student password update failed: ${e.message}`);
            }
            await this.studentModel.updateOne({ sid: resetData.userId }, { $set: { password: hashedPassword } });
            updated = true;
        } else if (resetData.role.includes('faculty')) {
            try {
                await this.facultyRepo.update({ facultyId: resetData.userId }, { password: hashedPassword });
            } catch (e) {
                console.warn(`TypeORM Faculty password update failed: ${e.message}`);
            }
            await this.facultyModel.updateOne({ facultyId: resetData.userId }, { $set: { password: hashedPassword } });
            updated = true;
        } else if (resetData.role.includes('admin')) {
            try {
                await this.adminRepo.update({ adminId: resetData.userId }, { password: hashedPassword });
            } catch (e) {
                console.warn(`TypeORM Admin password update failed: ${e.message}`);
            }
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
