import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentData, StudentDataDocument } from '../schemas/student-data.schema';
import { Material, MaterialDocument } from '../schemas/material.schema';
import { Student as StudentEntity } from '../entities/student.entity';
import { Attendance as AttendanceEntity } from '../entities/attendance.entity';
import { Mark as MarkEntity } from '../entities/mark.entity';
import { Course as CourseEntity } from '../entities/course.entity';

@Injectable()
export class StudentDataService {
    constructor(
        @InjectModel(StudentData.name) private studentDataModel: Model<StudentDataDocument>,
        @InjectModel(Material.name) private materialModel: Model<MaterialDocument>,
        @InjectRepository(StudentEntity) private studentRepo: Repository<StudentEntity>,
        @InjectRepository(AttendanceEntity) private attendanceRepo: Repository<AttendanceEntity>,
        @InjectRepository(MarkEntity) private markRepo: Repository<MarkEntity>,
        @InjectRepository(CourseEntity) private courseRepo: Repository<CourseEntity>,
    ) { }

  private cache = new Map<string, { data: any, timestamp: number }>();
  private CACHE_TTL = 1000; // 1s for real-time fetching without double-render spam

  private getCached(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) return cached.data;
    return null;
  }

  private setCache(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
    if (this.cache.size > 1000) {
        const now = Date.now();
        for (const [k, v] of this.cache.entries()) {
            if (now - v.timestamp > this.CACHE_TTL * 5) this.cache.delete(k);
        }
    }
  }

  async findByStudent(rollNumber: string): Promise<any> {
    const data = await this.studentDataModel.findOne({ rollNumber }).lean();
    if (!data) return null;

    // Try to get updated info from SQL
    const student = await this.studentRepo.findOne({ where: { sid: rollNumber } });
    if (student) {
      data.name = student.studentName;
      data.email = student.email;
      data.branch = student.branch;
      (data as any).role = student.role;
      (data as any).source = 'mysql_merged';
    }

    return data;
  }

  async getDashboard(rollNumber: string): Promise<any> {
    const cached = this.getCached(`dashboard_${rollNumber}`);
    if (cached) return cached;
    
    // FETCH ALL DATA IN PARALLEL FOR MAXIMUM PERFORMANCE
    const [student, attendance, marks, mongoData] = await Promise.all([
        this.studentRepo.findOne({ where: { sid: rollNumber } }),
        this.attendanceRepo.find({ where: { studentId: rollNumber } }),
        this.markRepo.find({ where: { studentId: rollNumber } }),
        this.studentDataModel.findOne({ rollNumber }).lean()
    ]);

    let totalClasses = attendance?.length || 0;
    let presentClasses = attendance?.filter(a => a.status === 'Present').length || 0;

    // Get courses from MySQL - Filter by Year and Branch for performance
    let studentCourses = [];
    if (student) {
        studentCourses = await this.courseRepo.find({
            where: [
                { year: String(student.year), branch: student.branch },
                { year: String(student.year), branch: 'All' },
                { year: String(student.year), branch: 'Common' }
            ]
        });
    }

    const materialQuery: any = {
      year: String(student?.year || '1'),
      $or: [
        { section: student?.section || 'All' },
        { section: 'All' }
      ]
    };

    if (student?.branch) {
      materialQuery.branch = { $in: [student.branch, 'All', 'Common'] };
    }

    const materials = await this.materialModel.find(materialQuery)
      .sort('-createdAt')
      .lean();

    const result = {
      profile: student || mongoData || {},
      student: student || mongoData || {},
      attendance: {
        total: totalClasses,
        present: presentClasses,
        percentage: totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0,
        records: attendance.slice(0, 50), // last 50 records
      },
      marks: marks,
      courses: studentCourses.map(c => ({ 
          id: c.id,
          code: c.code || c.courseCode, 
          name: c.name || c.courseName,
          courseCode: c.courseCode || c.code,
          courseName: c.courseName || c.name,
          semester: c.semester,
          year: c.year,
          section: c.section,
          modules: c.modules || []
      })),
      overview: {
        ...(mongoData || {}),
        activity: {
          streak: (mongoData as any)?.progress?.streak || student?.stats?.streak || 0,
          aiUsage: (mongoData as any)?.progress?.aiUsageCount || student?.stats?.aiUsageCount || 0,
          careerReadyScore: (mongoData as any)?.progress?.careerReadyScore || student?.stats?.careerReadyScore || 0,
          cgpa: student?.stats?.cgpa || (mongoData as any)?.sections?.overview?.currentCGPA || 8.2
        },
        attendance: {
          total: totalClasses,
          present: presentClasses,
          percentage: totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0,
        }
      },
      materials: materials.map(m => {
        const rawType = m.type || 'notes';
        let normalizedType = rawType.toLowerCase();
        if (normalizedType === 'video') normalizedType = 'videos';
        if (normalizedType === 'note') normalizedType = 'notes';
        if (normalizedType === 'model_paper' || normalizedType === 'modelpaper') normalizedType = 'modelPapers';

        return {
          id: m._id.toString(),
          _id: m._id.toString(),
          title: m.title,
          description: m.description,
          url: m.fileUrl || m.url,
          type: normalizedType,
          semester: m.semester,
          subject: m.subject,
          year: m.year,
          section: m.section,
          module: m.module,
          unit: m.unit,
          topic: m.topic,
          videoAnalysis: m.videoAnalysis,
          uploadedAt: (m as any).uploadedAt || (m as any).createdAt,
          uploaderName: (m as any).uploadedBy?.name || m.uploadedBy || m.facultyName || 'Faculty'
        };
      }),
      faculties: mongoData?.sections?.faculty?.facultyList || [],
      source: 'mysql',
    };
    this.setCache(`dashboard_${rollNumber}`, result);
    return result;
  }

  async updateData(rollNumber: string, data: any): Promise<any> {
    return this.studentDataModel.findOneAndUpdate(
      { rollNumber },
      { $set: data },
      { new: true, upsert: true }
    );
  }
}
