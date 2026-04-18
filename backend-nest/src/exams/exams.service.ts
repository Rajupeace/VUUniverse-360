import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exam, ExamDocument } from '../schemas/exam.schema';
import { ExamResult, ExamResultDocument } from '../schemas/exam-result.schema';
import { Exam as ExamEntity, ExamResult as ExamResultEntity } from '../entities/exam.entity';

@Injectable()
export class ExamsService {
  constructor(
    @InjectModel(Exam.name) private examModel: Model<ExamDocument>,
    @InjectModel(ExamResult.name) private examResultModel: Model<ExamResultDocument>,
    @InjectRepository(ExamEntity) private examRepo: Repository<ExamEntity>,
    @InjectRepository(ExamResultEntity) private examResultRepo: Repository<ExamResultEntity>,
    @InjectConnection() private readonly connection: Connection,
  ) { }

  async findAll(query: any): Promise<any[]> {
    const sanitizedQuery: any = {};
    if (query.subject) sanitizedQuery.subject = query.subject;
    if (query.year) sanitizedQuery.year = String(query.year);
    if (query.branch) sanitizedQuery.branch = query.branch;
    if (query.section && query.section.toUpperCase() !== 'ALL') sanitizedQuery.section = query.section;

    try {
      const sqlExams = await this.examRepo.find({ 
        where: sanitizedQuery, 
        order: { createdAt: 'DESC' } 
      });
      if (sqlExams.length > 0) return sqlExams.map(e => ({ ...e, id: e.id, source: 'mysql' }));
    } catch (e) {
      console.warn(`MySQL Exam Find Error: ${e.message}`);
    }

    if (this.connection.readyState !== 1) return [];
    
    // For MongoDB, we sanitize similarly
    const mongoQuery: any = {};
    if (query.year) mongoQuery.year = String(query.year);
    if (query.branch) mongoQuery.branch = query.branch;
    if (query.section && query.section.toUpperCase() !== 'ALL') mongoQuery.section = query.section;
    if (query.subject) mongoQuery.subject = query.subject;

    return this.examModel.find(mongoQuery).sort({ createdAt: -1 }).lean();
  }

  async findOne(id: string): Promise<any> {
    if (!isNaN(Number(id))) {
      const sqlE = await this.examRepo.findOneBy({ id: Number(id) });
      if (sqlE) return { ...sqlE, source: 'mysql' };
    }

    if (this.connection.readyState === 1) {
      const exam = await this.examModel.findById(id).lean();
      if (exam) return { ...exam, source: 'mongodb' };
    }

    throw new NotFoundException('Exam not found');
  }

  async create(data: any): Promise<any> {
    // MySQL
    try {
      const sqlExam = this.examRepo.create({
        title: data.title,
        description: data.description,
        subject: data.subject,
        examDate: data.date || data.examDate || new Date().toISOString(),
        totalMarks: Number(data.totalMarks || data.maxMarks || 100),
        year: String(data.year || '1'),
        branch: data.branch,
        section: data.section,
        duration: Number(data.duration || 60),
      });
      await this.examRepo.save(sqlExam);
    } catch (e) {
      console.warn(`MySQL Exam Create Error: ${e.message}`);
    }

    // MongoDB
    const exam = new this.examModel(data);
    return exam.save();
  }

  async submitResult(data: any): Promise<any> {
    // MySQL
    try {
      const sqlResult = this.examResultRepo.create({
        examId: String(data.examId),
        studentId: String(data.studentId),
        marksObtained: Number(data.marksObtained),
        maxMarks: Number(data.totalMarks || data.maxMarks || 100),
        grade: data.grade,
        remarks: data.remarks,
        examTitle: data.examTitle,
        subject: data.subject,
      });
      await this.examResultRepo.save(sqlResult);
    } catch (e) { console.warn(`MySQL ExamResult Submit Error: ${e.message}`); }

    // MongoDB
    const result = new this.examResultModel(data);
    return result.save();
  }

  async getResultsByStudent(studentId: string): Promise<any[]> {
    const sqlResults = await this.examResultRepo.find({ where: { studentId }, order: { createdAt: 'DESC' } });
    if (sqlResults.length > 0) return sqlResults;

    if (this.connection.readyState !== 1) return [];
    return this.examResultModel.find({ studentId }).sort({ date: -1 }).lean();
  }

  async getResultsByExam(examTitle: string): Promise<any[]> {
    const sqlResults = await this.examResultRepo.find({ where: { examTitle }, order: { marksObtained: 'DESC' } });
    if (sqlResults.length > 0) return sqlResults;

    if (this.connection.readyState !== 1) return [];
    return this.examResultModel.find({ examTitle }).sort({ marksObtained: -1 }).lean();
  }
}
