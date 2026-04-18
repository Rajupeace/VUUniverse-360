import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Attendance, AttendanceSchema } from '../schemas/attendance.schema';
import { Faculty, FacultySchema } from '../schemas/faculty.schema';
import { Student, StudentSchema } from '../schemas/student.schema';
import { Attendance as AttendanceEntity } from '../entities/attendance.entity';
import { Faculty as FacultyEntity } from '../entities/faculty.entity';
import { Student as StudentEntity } from '../entities/student.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attendance.name, schema: AttendanceSchema },
      { name: Faculty.name, schema: FacultySchema },
      { name: Student.name, schema: StudentSchema },
    ]),
    TypeOrmModule.forFeature([
      AttendanceEntity,
      FacultyEntity,
      StudentEntity,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule { }
