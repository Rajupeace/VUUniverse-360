import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentGrades, StudentGradesDocument } from '../schemas/student-grades.schema';
import { StudentGrade as GradeEntity } from '../entities/student-grade.entity';

@Injectable()
export class StudentGradesService {
  constructor(
    @InjectModel(StudentGrades.name) private gradesModel: Model<StudentGradesDocument>,
    @InjectRepository(GradeEntity) private gradeRepo: Repository<GradeEntity>,
    @InjectConnection() private readonly connection: Connection,
  ) { }

  async findByStudent(rollNumber: string): Promise<any> {
    const sqlGrade = await this.gradeRepo.findOneBy({ studentId: rollNumber });
    if (sqlGrade) return { ...sqlGrade, source: 'mysql' };

    if (this.connection.readyState === 1) {
      const entry = await this.gradesModel.findOne({ rollNumber }).lean();
      if (entry) return { ...entry, source: 'mongodb' };
    }
    return null;
  }

  async updateGrades(rollNumber: string, data: any): Promise<any> {
    // MySQL
    try {
      let sqlGrade = await this.gradeRepo.findOneBy({ studentId: rollNumber });
      if (!sqlGrade) {
        sqlGrade = this.gradeRepo.create({
          studentId: rollNumber,
          cgpa: Number(data.cgpa || 0),
          sgpa: Number(data.sgpa || 0),
          totalCredits: Number(data.totalCredits || 0),
          rank: data.rank,
          standing: data.standing || 'Good',
        });
      } else {
        if (data.cgpa !== undefined) sqlGrade.cgpa = Number(data.cgpa);
        if (data.sgpa !== undefined) sqlGrade.sgpa = Number(data.sgpa);
        if (data.rank !== undefined) sqlGrade.rank = data.rank;
      }
      await this.gradeRepo.save(sqlGrade);
    } catch (e) { console.warn(`MySQL Grade Update Error: ${e.message}`); }

    // MongoDB
    return this.gradesModel.findOneAndUpdate(
      { rollNumber },
      { $set: data },
      { new: true, upsert: true }
    );
  }

  async addSemester(rollNumber: string, semesterData: any): Promise<any> {
    // MySQL (Simplified mapping to transcript or update current standing)
    try {
      const sqlGrade = await this.gradeRepo.findOneBy({ studentId: rollNumber });
      if (sqlGrade) {
        // Update latest SGPA from semesterData if available
        if (semesterData.sgpa) sqlGrade.sgpa = Number(semesterData.sgpa);
        await this.gradeRepo.save(sqlGrade);
      }
    } catch (e) { }

    // MongoDB
    return this.gradesModel.findOneAndUpdate(
      { rollNumber },
      { $push: { semesters: semesterData } },
      { new: true, upsert: true }
    );
  }
}
