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

        // Try Admin
        if (!user && (role === 'admin' || !role)) {
            // SQL
            user = await this.adminRepo.findOne({ where: { adminId: id } });
            // MongoDB
            if (!user) {
                try {
                    user = await this.adminModel.findOne({ $or: [{ adminId: id }, ...(id.length === 24 ? [{ _id: id }] : [])] }).lean();
                } catch (e) {
                    user = await this.adminModel.findOne({ adminId: id }).lean();
                }
            }
            if (user) user.role = user.role || 'admin';
        }

        // Try Faculty
        if (!user && (role === 'faculty' || !role)) {
            // SQL
            user = await this.facultyRepo.findOne({ where: { facultyId: id } });
            // MongoDB
            if (!user) {
                try {
                    user = await this.facultyModel.findOne({ $or: [{ facultyId: id }, ...(id.length === 24 ? [{ _id: id }] : [])] }).lean();
                } catch (e) {
                    user = await this.facultyModel.findOne({ facultyId: id }).lean();
                }
            }
            if (user) user.userType = 'faculty';
        }

        // Try Student
        if (!user && (role === 'student' || !role)) {
            // SQL
            user = await this.studentRepo.findOne({ where: { sid: id } });
            // MongoDB
            if (!user) {
                try {
                    user = await this.studentModel.findOne({ $or: [{ sid: id }, ...(id.length === 24 ? [{ _id: id }] : [])] }).lean();
                } catch (e) {
                    user = await this.studentModel.findOne({ sid: id }).lean();
                }
            }
            if (user) user.userType = 'student';
        }

        if (!user) {
            throw new UnauthorizedException('Not authorized: User not found or session expired');
        }

        return user;
    }
}
