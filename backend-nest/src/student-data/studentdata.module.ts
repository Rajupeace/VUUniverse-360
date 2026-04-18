import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentDataController } from './studentdata.controller';
import { StudentDataService } from './studentdata.service';
import { StudentData, StudentDataSchema } from '../schemas/student-data.schema';
import { Material, MaterialSchema } from '../schemas/material.schema';
import { Student as StudentEntity } from '../entities/student.entity';
import { Attendance as AttendanceEntity } from '../entities/attendance.entity';
import { Mark as MarkEntity } from '../entities/mark.entity';
import { Course as CourseEntity } from '../entities/course.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StudentData.name, schema: StudentDataSchema },
      { name: Material.name, schema: MaterialSchema }
    ]),
    TypeOrmModule.forFeature([StudentEntity, AttendanceEntity, MarkEntity, CourseEntity]),
  ],
  controllers: [StudentDataController],
  providers: [StudentDataService],
  exports: [StudentDataService],
})
export class StudentDataModule { }
