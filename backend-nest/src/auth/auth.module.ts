import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard, AdminGuard, FacultyGuard, StudentGuard, StaffGuard } from './guards';
import { Student, StudentSchema } from '../schemas/student.schema';
import { Faculty, FacultySchema } from '../schemas/faculty.schema';
import { Admin, AdminSchema } from '../schemas/admin.schema';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin as AdminEntity } from '../entities/admin.entity';
import { Student as StudentEntity } from '../entities/student.entity';
import { Faculty as FacultyEntity } from '../entities/faculty.entity';

@Global()
@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'your_jwt_secret',
            signOptions: { expiresIn: '30d' },
        }),
        MongooseModule.forFeature([
            { name: Student.name, schema: StudentSchema },
            { name: Faculty.name, schema: FacultySchema },
            { name: Admin.name, schema: AdminSchema },
        ]),
        TypeOrmModule.forFeature([AdminEntity, StudentEntity, FacultyEntity]),
    ],
    controllers: [AuthController],
    providers: [
        JwtStrategy,
        JwtAuthGuard,
        AdminGuard,
        FacultyGuard,
        StudentGuard,
        StaffGuard,
        AuthService,
    ],
    exports: [
        JwtModule,
        PassportModule,
        JwtAuthGuard,
        AdminGuard,
        FacultyGuard,
        StudentGuard,
        StaffGuard,
        AuthService,
        MongooseModule,
    ],
})
export class AuthModule { }
