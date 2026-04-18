import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement, AchievementDocument } from '../schemas/achievement.schema';
import { Student, StudentDocument } from '../schemas/student.schema';
import { Achievement as AchievementEntity } from '../entities/achievement.entity';
import { Student as StudentEntity } from '../entities/student.entity';
import { SseService } from '../sse/sse.service';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectModel(Achievement.name) private achievementModel: Model<AchievementDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectRepository(AchievementEntity) private achievementRepo: Repository<AchievementEntity>,
    @InjectRepository(StudentEntity) private studentRepo: Repository<StudentEntity>,
    private sseService: SseService,
  ) { }

  async findAll(query: any): Promise<any[]> {
    const sqlAchievements = await this.achievementRepo.find({ where: query, order: { createdAt: 'DESC' } });
    if (sqlAchievements.length > 0) {
      return sqlAchievements.map(a => ({ ...a, id: a.id, source: 'mysql' }));
    }
    return this.achievementModel.find(query).sort({ submittedAt: -1 }).lean();
  }

  async findOne(id: string): Promise<any> {
    // SQL first
    if (!isNaN(Number(id))) {
      const sqlA = await this.achievementRepo.findOneBy({ id: Number(id) });
      if (sqlA) return { ...sqlA, source: 'mysql' };
    }

    if (Types.ObjectId.isValid(id)) {
      const mongoA = await this.achievementModel.findById(id).lean();
      if (mongoA) return { ...mongoA, source: 'mongodb' };
    }

    throw new NotFoundException('Achievement not found');
  }

  async findByStudent(studentId: string): Promise<any[]> {
    // SQL first
    const sqlAchievements = await this.achievementRepo.find({
      where: [
        { studentId: studentId },
        { rollNumber: studentId }
      ],
      order: { achievementDate: 'DESC' }
    });

    if (sqlAchievements.length > 0) return sqlAchievements;

    const query = Types.ObjectId.isValid(studentId)
      ? { studentId: new Types.ObjectId(studentId) }
      : { rollNumber: studentId };
    return this.achievementModel.find(query).sort({ achievementDate: -1 }).lean();
  }

  async create(data: any): Promise<any> {
    const sid = data.rollNumber || data.sid;

    // Find student in MySQL first
    const sqlStudent = await this.studentRepo.findOne({ where: { sid } });
    if (sqlStudent) {
      data.studentId = sqlStudent.sid;
      data.studentName = sqlStudent.studentName;
      data.department = sqlStudent.branch;
      data.year = sqlStudent.year;
      data.section = sqlStudent.section;
    } else {
      // Fallback to Mongo student
      const mStudent = await this.studentModel.findOne({ sid });
      if (mStudent) {
        data.studentId = mStudent.sid;
        data.studentName = mStudent.studentName;
        data.department = mStudent.branch;
        data.year = mStudent.year;
        data.section = mStudent.section;
      }
    }

    // Write to MySQL
    try {
      const sqlAchievement = this.achievementRepo.create({
        studentId: String(data.studentId || sid),
        studentName: data.studentName,
        rollNumber: sid,
        year: String(data.year),
        section: data.section,
        department: data.department,
        title: data.title,
        category: data.category,
        level: data.level,
        position: data.position,
        eventName: data.eventName,
        description: data.description,
        achievementDate: data.achievementDate ? new Date(data.achievementDate) : null,
        status: data.status || 'Pending',
        documents: data.documents || [],
      });
      await this.achievementRepo.save(sqlAchievement);
    } catch (e) { console.warn(`MySQL Achievement Create Error: ${e.message}`); }

    // Write to MongoDB
    const achievement = new this.achievementModel(data);
    const result = await achievement.save();

    this.sseService.broadcast({
      resource: 'achievements',
      action: 'create',
      data: { id: result._id, studentId: data.studentId }
    });

    return result;
  }

  async updateStatus(id: string, status: string, approvedBy: string, approvedByType: string): Promise<any> {
    // Update MySQL
    if (!isNaN(Number(id))) {
      await this.achievementRepo.update(Number(id), { status });
    }

    // Update MongoDB
    const achievement = await this.achievementModel.findByIdAndUpdate(
      id,
      {
        $set: {
          status,
          approvedBy,
          approvedByType,
          approvalDate: new Date()
        }
      },
      { new: true }
    );

    if (!achievement && isNaN(Number(id))) throw new NotFoundException('Achievement not found');

    this.sseService.broadcast({
      resource: 'achievements',
      action: 'statusUpdate',
      data: { id, status, studentId: achievement?.studentId }
    });

    return achievement || { success: true, status };
  }

  async delete(id: string): Promise<any> {
    let deleted = false;

    if (!isNaN(Number(id))) {
      const res = await this.achievementRepo.delete(Number(id));
      if (res.affected > 0) deleted = true;
    }

    if (Types.ObjectId.isValid(id)) {
      const result = await this.achievementModel.findByIdAndDelete(id);
      if (result) deleted = true;
    }

    if (!deleted) throw new NotFoundException('Achievement not found');
    return { success: true };
  }
}
