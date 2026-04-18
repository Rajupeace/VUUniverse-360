import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacultyStatsController } from './facultystats.controller';
import { FacultyStatsService } from './facultystats.service';
import { Faculty, FacultySchema } from '../schemas/faculty.schema';
import { Student, StudentSchema } from '../schemas/student.schema';
import { Material, MaterialSchema } from '../schemas/material.schema';
import { Faculty as FacultyEntity } from '../entities/faculty.entity';
import { Student as StudentEntity } from '../entities/student.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Faculty.name, schema: FacultySchema },
      { name: Student.name, schema: StudentSchema },
      { name: Material.name, schema: MaterialSchema },
    ]),
    TypeOrmModule.forFeature([FacultyEntity, StudentEntity]),
  ],
  controllers: [FacultyStatsController],
  providers: [FacultyStatsService],
  exports: [FacultyStatsService],
})
export class FacultyStatsModule { }
