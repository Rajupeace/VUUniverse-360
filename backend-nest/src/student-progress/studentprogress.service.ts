import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student, StudentDocument } from '../schemas/student.schema';

@Injectable()
export class StudentProgressService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
  ) {}

  async getProgress(sid: string): Promise<any> {
    const student = await this.studentModel.findOne({ sid }).select('stats roadmapProgress').lean();
    if (!student) return { error: 'Student not found' };
    return {
        stats: (student as any).stats || {},
        roadmapProgress: (student as any).roadmapProgress || {}
    };
  }
}
