import { Injectable, BadRequestException, ServiceUnavailableException, InternalServerErrorException, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Mark as MarkSchema, MarkDocument } from '../schemas/mark.schema';
import { Student, StudentDocument } from '../schemas/student.schema';
import { Faculty, FacultyDocument } from '../schemas/faculty.schema';
import { StudentData, StudentDataDocument } from '../schemas/student-data.schema';
import { Mark as MarkEntity } from '../entities/mark.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentsService } from '../students/students.service';
import { SseService } from '../sse/sse.service';

@Injectable()
export class MarksService {
  constructor(
    @InjectModel(MarkSchema.name) private markModel: Model<MarkDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Faculty.name) private facultyModel: Model<FacultyDocument>,
    @InjectModel(StudentData.name) private studentDataModel: Model<StudentDataDocument>,
    @InjectRepository(MarkEntity) private markRepo: Repository<MarkEntity>,
    @InjectConnection() private readonly connection: Connection,
    private studentsService: StudentsService,
    private sseService: SseService,
  ) { }

  private checkDb() {
    if (this.connection.readyState !== 1) {
      throw new ServiceUnavailableException('Database not connected');
    }
  }

  private getMaxMarks(assessmentType: string): number {
    const t = String(assessmentType).toLowerCase();
    if (t.startsWith('cla')) return 20;
    if (t.startsWith('m1') || t.startsWith('m2')) return 10;
    return 100;
  }

  async getMarksBySubject(subject: string): Promise<any[]> {
    const sqlMarks = await this.markRepo.find({ where: { subject } });
    if (sqlMarks.length > 0) return sqlMarks;
    return this.markModel.find({ subject }).lean();
  }

  async bulkSaveMarks(marks: any[]): Promise<any> {
    this.checkDb();
    if (!marks || !Array.isArray(marks)) {
      throw new BadRequestException('Invalid marks data');
    }

    try {
      // ── Write to MySQL (primary) ──
      for (const mark of marks) {
        try {
          const filter = {
            studentId: String(mark.studentId),
            subject: mark.subject,
            assessmentType: mark.assessmentType
          };
          
          let existing = await this.markRepo.findOne({ where: filter });
          if (existing) {
            existing.marks = Number(mark.marks);
            existing.maxMarks = this.getMaxMarks(mark.assessmentType);
            existing.updatedBy = mark.updatedBy || 'system';
            await this.markRepo.save(existing);
          } else {
            const entity = this.markRepo.create({
              ...filter,
              marks: Number(mark.marks),
              maxMarks: this.getMaxMarks(mark.assessmentType),
              updatedBy: mark.updatedBy || 'system',
            });
            await this.markRepo.save(entity);
          }
        } catch (e) {
          console.warn(`MySQL Mark Save Error: ${e.message}`);
        }
      }

      const operations = marks.map(mark => ({
        updateOne: {
          filter: {
            studentId: String(mark.studentId),
            subject: mark.subject,
            assessmentType: mark.assessmentType
          },
          update: {
            $set: {
              marks: Number(mark.marks),
              maxMarks: this.getMaxMarks(mark.assessmentType),
              updatedAt: new Date()
            }
          },
          upsert: true
        }
      }));

      const result = await this.markModel.bulkWrite(operations);

      setImmediate(async () => {
        try {
          const uniqueSids = [...new Set(marks.map(m => String(m.studentId)))];
          await Promise.all(uniqueSids.map(sid => this.studentsService.syncStudentOverview(sid)));

          this.sseService.broadcast({
            resource: 'marks',
            action: 'bulk-save',
            data: { subject: marks[0]?.subject, count: marks.length }
          });

          this.sseService.broadcast({
            resource: 'overview',
            action: 'update',
            data: { sids: uniqueSids }
          });
        } catch (err) {
          console.error('Background marks sync error:', err);
        }
      });

      return {
        success: true,
        message: `Successfully saved marks for ${marks.length} nodes`,
        modified: result.modifiedCount,
        inserted: result.upsertedCount
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getStudentMarksBySubject(studentId: string): Promise<any[]> {
    let marks: any[] = await this.markRepo.find({ where: { studentId } });
    if (marks.length === 0) {
      marks = await this.markModel.find({ studentId }).lean();
    }
    const bySubject: any = {};
    marks.forEach(mark => {
      const subName = mark.subject;
      const type = (mark.assessmentType || '').toLowerCase().trim();

      if (!bySubject[subName]) {
        bySubject[subName] = { subject: subName, assessments: {} };
      }

      bySubject[subName].assessments[type] = {
        type,
        score: Number(mark.marks) || 0,
        max: Number(mark.maxMarks) || (type.startsWith('cla') ? 20 : (type.startsWith('m') ? 10 : 100))
      };
      if (bySubject[subName].assessments[type].max === 0) {
        bySubject[subName].assessments[type].max = 100;
      }
    });

    return Object.values(bySubject).map((subj: any) => {
      const result: any = {
        subject: subj.subject,
        cla: [],
        module1: [],
        module2: [],
        overall: { total: 0, max: 0, percentage: 0 }
      };

      Object.values(subj.assessments).forEach((asm: any) => {
        const { type, score, max } = asm;

        if (type.startsWith('cla')) {
          const testNum = parseInt(type.replace(/[^0-9]/g, '')) || 0;
          result.cla.push({ test: testNum, scored: score, total: max });
        } else if (type.startsWith('m1')) {
          const rawSuffix = type.replace('m1', '');
          const targetNum = rawSuffix.includes('pre') ? 0 : (parseInt(rawSuffix.replace(/[^0-9]/g, '')) || 0);
          result.module1.push({ type, scored: score, total: max, target: targetNum });
        } else if (type.startsWith('m2')) {
          const rawSuffix = type.replace('m2', '');
          const targetNum = rawSuffix.includes('pre') ? 0 : (parseInt(rawSuffix.replace(/[^0-9]/g, '')) || 0);
          result.module2.push({ type, scored: score, total: max, target: targetNum });
        }

        result.overall.total += score;
        result.overall.max += max;
      });

      if (result.overall.max > 0) {
        result.overall.percentage = Math.round((result.overall.total / result.overall.max) * 100);
      }

      result.cla.sort((a: any, b: any) => a.test - b.test);
      result.module1.sort((a: any, b: any) => a.target - b.target);
      result.module2.sort((a: any, b: any) => a.target - b.target);

      return result;
    });
  }

  async getAdminOverview(queryParams: any): Promise<any> {
    this.checkDb();
    const { year, section, subject } = queryParams;

    const studentFilter: any = {};
    if (year) studentFilter.year = String(year);
    if (section) studentFilter.section = section;

    const studentsList = await this.studentModel.find(studentFilter).lean();
    const studentIds = studentsList.map(s => s.sid);

    // 1. Unified Marks Collection (Syncing SQL and Mongo for absolute analytics)
    const marksFilter: any = {};
    if (subject) marksFilter.subject = subject;
    if (studentIds.length > 0) marksFilter.studentId = { $in: studentIds };

    const sqlFilter: any = {};
    if (subject) sqlFilter.subject = subject;
    // Note: implementing complex IN filters in TypeORM requires more care, but simple subject filter is a start

    const [mongoMarks, sqlMarks] = await Promise.all([
      this.connection.readyState === 1 ? this.markModel.find(marksFilter).lean() : [],
      this.markRepo.find({ where: sqlFilter })
    ]);

    const marks = [...mongoMarks, ...sqlMarks.map(m => ({ ...m, marks: Number(m.marks), maxMarks: Number(m.maxMarks) }))];

    const stats: any = {
      totalStudents: studentsList.length,
      subjectsAnalyzed: [...new Set(marks.map(m => m.subject))],
      averagesBySubject: {},
      overallAverage: 0,
      topPerformers: []
    };

    const bySubject: any = {};
    marks.forEach(mark => {
      if (!bySubject[mark.subject]) {
        bySubject[mark.subject] = { total: 0, max: 0, count: 0 };
      }
      bySubject[mark.subject].total += mark.marks;
      bySubject[mark.subject].max += mark.maxMarks || 100;
      bySubject[mark.subject].count++;
    });

    Object.keys(bySubject).forEach(subj => {
      const data = bySubject[subj];
      stats.averagesBySubject[subj] = {
        percentage: data.max > 0 ? Math.round((data.total / data.max) * 100) : 0,
        totalMarks: data.total,
        maxMarks: data.max
      };
    });

    const totalScored = marks.reduce((sum, m) => sum + m.marks, 0);
    const totalMax = marks.reduce((sum, m) => sum + (m.maxMarks || 100), 0);
    stats.overallAverage = totalMax > 0 ? Math.round((totalScored / totalMax) * 100) : 0;

    return stats;
  }

  async getFacultyStudents(facultyId: string): Promise<any[]> {
    this.checkDb();
    const faculty = await this.facultyModel.findOne({ facultyId }).lean();
    if (!faculty) {
      throw new NotFoundException('Faculty not found');
    }

    const query: any = {};
    if ((faculty as any).year) query.year = (faculty as any).year;
    if ((faculty as any).section) query.section = (faculty as any).section;

    return this.studentModel.find(query).lean();
  }
}
