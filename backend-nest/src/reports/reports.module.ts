import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Attendance, AttendanceSchema } from '../schemas/attendance.schema';
import { Mark, MarkSchema } from '../schemas/mark.schema';
import { Student, StudentSchema } from '../schemas/student.schema';
import { ExamResult, ExamResultSchema } from '../schemas/exam-result.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attendance.name, schema: AttendanceSchema },
      { name: Mark.name, schema: MarkSchema },
      { name: Student.name, schema: StudentSchema },
      { name: ExamResult.name, schema: ExamResultSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule { }
