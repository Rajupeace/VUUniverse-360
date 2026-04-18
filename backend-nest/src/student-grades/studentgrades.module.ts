import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentGradesController } from './studentgrades.controller';
import { StudentGradesService } from './studentgrades.service';
import { StudentGrades, StudentGradesSchema } from '../schemas/student-grades.schema';
import { StudentGrade as GradeEntity } from '../entities/student-grade.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: StudentGrades.name, schema: StudentGradesSchema }]),
    TypeOrmModule.forFeature([GradeEntity]),
  ],
  controllers: [StudentGradesController],
  providers: [StudentGradesService],
  exports: [StudentGradesService, MongooseModule, TypeOrmModule],
})
export class StudentGradesModule { }
