import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { Attendance, AttendanceSchema } from '../schemas/attendance.schema';
import { Student, StudentSchema } from '../schemas/student.schema';
import { Course, CourseSchema } from '../schemas/course.schema';
import { StudentData, StudentDataSchema } from '../schemas/student-data.schema';
import { Enrollment, EnrollmentSchema } from '../schemas/enrollment.schema';
import { Attendance as AttendanceEntity } from '../entities/attendance.entity';
import { Student as StudentEntity } from '../entities/student.entity';
import { SseModule } from '../sse/sse.module';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attendance.name, schema: AttendanceSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Course.name, schema: CourseSchema },
      { name: StudentData.name, schema: StudentDataSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
    ]),
    TypeOrmModule.forFeature([AttendanceEntity, StudentEntity]),
    SseModule,
    StudentsModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule { }
