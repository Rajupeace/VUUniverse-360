import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarksController } from './marks.controller';
import { MarksService } from './marks.service';
import { Mark, MarkSchema } from '../schemas/mark.schema';
import { Student, StudentSchema } from '../schemas/student.schema';
import { Faculty, FacultySchema } from '../schemas/faculty.schema';
import { StudentData, StudentDataSchema } from '../schemas/student-data.schema';
import { Mark as MarkEntity } from '../entities/mark.entity';
import { StudentsModule } from '../students/students.module';
import { SseModule } from '../sse/sse.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Mark.name, schema: MarkSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Faculty.name, schema: FacultySchema },
      { name: StudentData.name, schema: StudentDataSchema },
    ]),
    TypeOrmModule.forFeature([MarkEntity]),
    StudentsModule,
    SseModule,
  ],
  controllers: [MarksController],
  providers: [MarksService],
  exports: [MarksService],
})
export class MarksModule { }
