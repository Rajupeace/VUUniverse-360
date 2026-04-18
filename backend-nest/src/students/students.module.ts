import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { Student, StudentSchema } from '../schemas/student.schema';
import { Course, CourseSchema } from '../schemas/course.schema';
import { Attendance, AttendanceSchema } from '../schemas/attendance.schema';
import { Mark, MarkSchema } from '../schemas/mark.schema';
import { ExamResult, ExamResultSchema } from '../schemas/exam-result.schema';
import { Chat, ChatSchema } from '../schemas/chat.schema';
import { Achievement, AchievementSchema } from '../schemas/achievement.schema';
import { StudentData, StudentDataSchema } from '../schemas/student-data.schema';
import { Enrollment, EnrollmentSchema } from '../schemas/enrollment.schema';
import { Message, MessageSchema } from '../schemas/message.schema';
import { Faculty, FacultySchema } from '../schemas/faculty.schema';

import { Student as StudentEntity } from '../entities/student.entity';
import { Course as CourseEntity } from '../entities/course.entity';
import { Attendance as AttendanceEntity } from '../entities/attendance.entity';
import { Mark as MarkEntity } from '../entities/mark.entity';
import { Achievement as AchievementEntity } from '../entities/achievement.entity';
import { Enrollment as EnrollmentEntity } from '../entities/enrollment.entity';
import { ExamResult as ExamResultEntity } from '../entities/exam.entity';
import { Faculty as FacultyEntity } from '../entities/faculty.entity';

import { SseModule } from '../sse/sse.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Student.name, schema: StudentSchema },
            { name: Course.name, schema: CourseSchema },
            { name: Attendance.name, schema: AttendanceSchema },
            { name: Mark.name, schema: MarkSchema },
            { name: ExamResult.name, schema: ExamResultSchema },
            { name: Chat.name, schema: ChatSchema },
            { name: Achievement.name, schema: AchievementSchema },
            { name: StudentData.name, schema: StudentDataSchema },
            { name: Enrollment.name, schema: EnrollmentSchema },
            { name: Message.name, schema: MessageSchema },
            { name: Faculty.name, schema: FacultySchema },
        ]),
        TypeOrmModule.forFeature([
            StudentEntity,
            CourseEntity,
            AttendanceEntity,
            MarkEntity,
            AchievementEntity,
            EnrollmentEntity,
            ExamResultEntity,
            FacultyEntity
        ]),
        SseModule,
    ],
    controllers: [StudentsController],
    providers: [StudentsService],
    exports: [StudentsService, MongooseModule, TypeOrmModule],
})
export class StudentsModule { }
