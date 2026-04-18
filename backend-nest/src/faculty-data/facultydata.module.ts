import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacultyDataController } from './facultydata.controller';
import { FacultyDataService } from './facultydata.service';
import { Faculty, FacultySchema } from '../schemas/faculty.schema';
import { Material, MaterialSchema } from '../schemas/material.schema';
import { Message, MessageSchema } from '../schemas/message.schema';
import { Faculty as FacultyEntity } from '../entities/faculty.entity';
import { Attendance as AttendanceEntity } from '../entities/attendance.entity';
import { Course as CourseEntity } from '../entities/course.entity';
import { Student, StudentSchema } from '../schemas/student.schema';
import { Student as StudentEntity } from '../entities/student.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Faculty.name, schema: FacultySchema },
      { name: Student.name, schema: StudentSchema },
      { name: Material.name, schema: MaterialSchema },
      { name: Message.name, schema: MessageSchema }
    ]),
    TypeOrmModule.forFeature([FacultyEntity, AttendanceEntity, CourseEntity, StudentEntity]),
  ],
  controllers: [FacultyDataController],
  providers: [FacultyDataService],
  exports: [FacultyDataService],
})
export class FacultyDataModule { }
