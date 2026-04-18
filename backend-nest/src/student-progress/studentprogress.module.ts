import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentProgressController } from './studentprogress.controller';
import { StudentProgressService } from './studentprogress.service';
import { Student, StudentSchema } from '../schemas/student.schema';
import { StudentProgress, StudentProgressSchema } from '../schemas/student-progress.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StudentProgress.name, schema: StudentProgressSchema },
      { name: Student.name, schema: StudentSchema }
    ]),
  ],
  controllers: [StudentProgressController],
  providers: [StudentProgressService],
  exports: [StudentProgressService],
})
export class StudentProgressModule { }
