import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Student, StudentSchema } from '../schemas/student.schema';
import { Faculty, FacultySchema } from '../schemas/faculty.schema';
import { Enrollment, EnrollmentSchema } from '../schemas/enrollment.schema';
import { Attendance, AttendanceSchema } from '../schemas/attendance.schema';
import { StudentData, StudentDataSchema } from '../schemas/student-data.schema';
import { Exam, ExamSchema } from '../schemas/exam.schema';
import { Material, MaterialSchema } from '../schemas/material.schema';
import { Todo, TodoSchema } from '../schemas/todo.schema';
import { Message, MessageSchema } from '../schemas/message.schema';
import { Course, CourseSchema } from '../schemas/course.schema';

import { Admin as AdminEntity } from '../entities/admin.entity';
import { Student as StudentEntity } from '../entities/student.entity';
import { Faculty as FacultyEntity } from '../entities/faculty.entity';
import { Course as CourseEntity } from '../entities/course.entity';
import { Attendance as AttendanceEntity } from '../entities/attendance.entity';

import { StudentsModule } from '../students/students.module';
import { MarksModule } from '../marks/marks.module';
import { SseModule } from '../sse/sse.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema },
      { name: Faculty.name, schema: FacultySchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: Attendance.name, schema: AttendanceSchema },
      { name: StudentData.name, schema: StudentDataSchema },
      { name: Exam.name, schema: ExamSchema },
      { name: Material.name, schema: MaterialSchema },
      { name: Todo.name, schema: TodoSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
    TypeOrmModule.forFeature([
      AdminEntity,
      StudentEntity,
      FacultyEntity,
      CourseEntity,
      AttendanceEntity
    ]),
    StudentsModule,
    MarksModule,
    SseModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService, TypeOrmModule],
})
export class AdminModule { }
