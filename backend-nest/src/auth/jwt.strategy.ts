import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student, StudentDocument } from '../schemas/student.schema';
import { Faculty, FacultyDocument } from '../schemas/faculty.schema';
import { Admin, AdminDocument } from '../schemas/admin.schema';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin as AdminEntity } from '../entities/admin.entity';
import { Student as StudentEntity } from '../entities/student.entity';
import { Faculty as FacultyEntity } from '../entities/faculty.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
        @InjectModel(Faculty.name) private facultyModel: Model<FacultyDocument>,
        @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
        @InjectRepository(AdminEntity) private adminRepo: Repository<AdminEntity>,
        @InjectRepository(StudentEntity) private studentRepo: Repository<StudentEntity>,
        @InjectRepository(FacultyEntity) private facultyRepo: Repository<FacultyEntity>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                ExtractJwt.fromAuthHeaderAsBearerToken(),
                (req) => req?.headers?.['x-admin-token'] || req?.headers?.['x-faculty-token'] || req?.headers?.['x-student-token'] || null,
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret',
        });
    }

    async validate(payload: any) {
        const { id, role } = payload;
        let user: any = null;

        console.log(`[JWT] Validating token for id: ${id}, role: ${role}`);

        // Try Admin
        if (!user && (role === 'admin' || !role)) {
            try {
                user = await this.adminRepo.findOne({ where: { adminId: id } });
                console.log(`[JWT] Admin SQL lookup: ${user ? 'found' : 'not found'}`);
            } catch (e) {
                console.warn(`[JWT] Admin SQL error:`, e.message);
            }
            if (!user) {
                try {
                    user = await this.adminModel.findOne({ adminId: id }).lean();
                    console.log(`[JWT] Admin Mongo lookup: ${user ? 'found' : 'not found'}`);
                } catch (e) {
                    console.warn(`[JWT] Admin Mongo error:`, e.message);
                }
            }
            if (user) user.role = user.role || 'admin';
        }

        // Try Faculty
        if (!user && (role === 'faculty' || !role)) {
            try {
                user = await this.facultyRepo.findOne({ where: { facultyId: id } });
                console.log(`[JWT] Faculty SQL lookup: ${user ? 'found' : 'not found'}`);
            } catch (e) {
                console.warn(`[JWT] Faculty SQL error:`, e.message);
            }
            if (!user) {
                try {
                    user = await this.facultyModel.findOne({ facultyId: id }).lean();
                    console.log(`[JWT] Faculty Mongo lookup: ${user ? 'found' : 'not found'}`);
                } catch (e) {
                    console.warn(`[JWT] Faculty Mongo error:`, e.message);
                }
            }
            if (user) user.userType = 'faculty';
        }

        // Try Student
        if (!user && (role === 'student' || !role)) {
            try {
                user = await this.studentRepo.findOne({ where: { sid: id } });
                console.log(`[JWT] Student SQL lookup: ${user ? 'found' : 'not found'}`);
            } catch (e) {
                console.warn(`[JWT] Student SQL error:`, e.message);
            }
            if (!user) {
                try {
                    user = await this.studentModel.findOne({ sid: id }).lean();
                    console.log(`[JWT] Student Mongo lookup: ${user ? 'found' : 'not found'}`);
                } catch (e) {
                    console.warn(`[JWT] Student Mongo error:`, e.message);
                }
            }
            if (user) user.userType = 'student';
        }

        if (!user) {
            console.error(`[JWT] User not found for id: ${id}, role: ${role}`);
            throw new UnauthorizedException('Not authorized: User not found or session expired');
        }

        console.log(`[JWT] Token validated for ${user.userType || user.role}: ${id}`);
        return user;
    }
}
