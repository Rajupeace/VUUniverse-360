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
        await this.seedAdmin();
        await this.seedStudent();
        await this.seedFaculty();
        console.log('[SEED] Database seeding complete!');
    }

    private async seedAdmin() {
        const count = await this.adminRepo.count();
        if (count === 0) {
            console.log('[SEED] Creating default admin...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            const admin = this.adminRepo.create({
                adminId: 'admin',
                name: 'Master Administrator',
                password: hashedPassword,
                role: 'admin',
                isAdmin: true,
            });
            await this.adminRepo.save(admin);
            
            // Also add to MongoDB
            await this.adminModel.create({
                adminId: 'admin',
                name: 'Master Administrator',
                email: 'admin@vignan.ac.in',
                password: hashedPassword,
                role: 'admin',
            });
            
            console.log('[SEED] Admin created: admin / admin123');
        }
    }

    private async seedStudent() {
        const count = await this.studentRepo.count();
        if (count === 0) {
            console.log('[SEED] Creating default student...');
            const hashedPassword = await bcrypt.hash('student123', 10);
            
            const student = this.studentRepo.create({
                sid: '231fa04A17',
                studentName: 'Test Student',
                email: 'student@test.com',
                password: hashedPassword,
                branch: 'CSE',
                year: '3',
                section: '13',
            });
            await this.studentRepo.save(student);
            
            // Also add to MongoDB
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
            
            console.log('[SEED] Student created: 231fa04A17 / student123');
        }
    }

    private async seedFaculty() {
        const count = await this.facultyRepo.count();
        if (count === 0) {
            console.log('[SEED] Creating default faculty...');
            const hashedPassword = await bcrypt.hash('faculty123', 10);
            
            const faculty = this.facultyRepo.create({
                facultyId: 'FAC001',
                facultyName: 'Test Faculty',
                email: 'faculty@test.com',
                password: hashedPassword,
                department: 'CSE',
                designation: 'Assistant Professor',
            });
            await this.facultyRepo.save(faculty);
            
            // Also add to MongoDB (uses 'name' not 'facultyName')
            await this.facultyModel.create({
                facultyId: 'FAC001',
                name: 'Test Faculty',
                email: 'faculty@test.com',
                password: hashedPassword,
                department: 'CSE',
                designation: 'Assistant Professor',
            });
            
            console.log('[SEED] Faculty created: FAC001 / faculty123');
        }
    }
}
