import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamsController } from './exams.controller';
import { ExamsService } from './exams.service';
import { Exam, ExamSchema } from '../schemas/exam.schema';
import { ExamResult, ExamResultSchema } from '../schemas/exam-result.schema';
import { Exam as ExamEntity, ExamResult as ExamResultEntity } from '../entities/exam.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exam.name, schema: ExamSchema },
      { name: ExamResult.name, schema: ExamResultSchema },
    ]),
    TypeOrmModule.forFeature([ExamEntity, ExamResultEntity]),
  ],
  controllers: [ExamsController],
  providers: [ExamsService],
  exports: [ExamsService, MongooseModule, TypeOrmModule],
})
export class ExamsModule { }
