import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { Admin as AdminEntity } from './entities/admin.entity';
import { Student as StudentEntity } from './entities/student.entity';
import { Faculty as FacultyEntity } from './entities/faculty.entity';

import { Admin, AdminDocument } from './schemas/admin.schema';
import { Student, StudentDocument } from './schemas/student.schema';
import { Faculty, FacultyDocument } from './schemas/faculty.schema';

@Injectable()
export class SeedService implements OnModuleInit {
    constructor(
        @InjectRepository(AdminEntity) private adminRepo: Repository<AdminEntity>,
        @InjectRepository(StudentEntity) private studentRepo: Repository<StudentEntity>,
        @InjectRepository(FacultyEntity) private facultyRepo: Repository<FacultyEntity>,
        @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
        @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
        @InjectModel(Faculty.name) private facultyModel: Model<FacultyDocument>,
    ) {}

    async onModuleInit() {
        console.log('[SEED] Checking database seed status...');
        try {
            await this.seedAdmin();
            await this.seedStudent();
            await this.seedFaculty();
            console.log('[SEED] Database seeding complete!');
        } catch (err) {
            console.warn('[SEED] Seeding failed (non-fatal):', err.message);
            console.log('[SEED] Server will continue without seed data.');
        }
    }

    private async seedAdmin() {
        try {
            const mongoCount = await this.adminModel.countDocuments();
            if (mongoCount === 0) {
                console.log('[SEED] Creating default admin...');
                const hashedPassword = await bcrypt.hash('admin123', 10);
                await this.adminModel.create({
                    adminId: 'admin',
                    name: 'Master Administrator',
                    email: 'admin@vignan.ac.in',
                    password: hashedPassword,
                    role: 'admin',
                });
                try { await this.adminRepo.save(this.adminRepo.create({ adminId: 'admin', name: 'Master Administrator', password: hashedPassword, role: 'admin', isAdmin: true })); } catch(e) { /* TypeORM optional */ }
                console.log('[SEED] Admin created: admin / admin123');
            }
        } catch(err) { console.warn('[SEED] Admin seed error:', err.message); }
    }

    private async seedStudent() {
        try {
            const mongoCount = await this.studentModel.countDocuments();
            if (mongoCount === 0) {
                console.log('[SEED] Creating default student...');
                const hashedPassword = await bcrypt.hash('student123', 10);
                await this.studentModel.create({
                    sid: '231fa04A17',
                    studentName: 'Test Student',
                    email: 'student@test.com',
                    password: hashedPassword,
                    branch: 'CSE',
                    year: 3,
                    section: 13,
                    stats: { streak: 0, lastLogin: new Date() },
                });
                try { await this.studentRepo.save(this.studentRepo.create({ sid: '231fa04A17', studentName: 'Test Student', email: 'student@test.com', password: hashedPassword, branch: 'CSE', year: '3', section: '13' })); } catch(e) { /* TypeORM optional */ }
                console.log('[SEED] Student created: 231fa04A17 / student123');
            }
        } catch(err) { console.warn('[SEED] Student seed error:', err.message); }
    }

    private async seedFaculty() {
        try {
            const mongoCount = await this.facultyModel.countDocuments();
            if (mongoCount === 0) {
                console.log('[SEED] Creating default faculty...');
                const hashedPassword = await bcrypt.hash('faculty123', 10);
                await this.facultyModel.create({
                    facultyId: 'FAC001',
                    name: 'Test Faculty',
                    email: 'faculty@test.com',
                    password: hashedPassword,
                    department: 'CSE',
                    designation: 'Assistant Professor',
                });
                try { await this.facultyRepo.save(this.facultyRepo.create({ facultyId: 'FAC001', facultyName: 'Test Faculty', email: 'faculty@test.com', password: hashedPassword, department: 'CSE', designation: 'Assistant Professor' })); } catch(e) { /* TypeORM optional */ }
                console.log('[SEED] Faculty created: FAC001 / faculty123');
            }
        } catch(err) { console.warn('[SEED] Faculty seed error:', err.message); }
    }
}
