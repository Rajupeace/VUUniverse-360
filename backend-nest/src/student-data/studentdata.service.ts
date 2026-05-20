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
import { Attendance, AttendanceDocument } from '../schemas/attendance.schema';
import { Mark, MarkDocument } from '../schemas/mark.schema';

@Injectable()
export class StudentDataService {
    constructor(
        @InjectModel(StudentData.name) private studentDataModel: Model<StudentDataDocument>,
        @InjectModel(Material.name) private materialModel: Model<MaterialDocument>,
        @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
        @InjectModel(Mark.name) private markModel: Model<MarkDocument>,
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

  async createDefaultStudentData(student: any): Promise<any> {
    const defaultData = {
      studentId: student._id || student.id,
      name: student.studentName || student.name,
      email: student.email,
      rollNumber: student.sid,
      branch: student.branch,
      currentSemester: '1',
      sections: {
        overview: {
          totalCourses: 0,
          activeCoursesCount: 0,
          totalClasses: student.stats?.totalClasses || 0,
          totalPresent: student.stats?.totalPresent || 0,
          totalAbsent: 0,
          overallAttendance: student.stats?.totalClasses > 0 ? Math.round((student.stats?.totalPresent / student.stats?.totalClasses) * 100) : 0,
          currentCGPA: student.stats?.cgpa || 8.2,
          currentSGPA: 8.2,
          lastUpdated: new Date(),
        },
        courses: {
          totalCourses: 0,
          courseList: [],
          lastUpdated: new Date(),
        },
        materials: {
          totalMaterials: 0,
          downloadedCount: 0,
          materialList: [],
          lastUpdated: new Date(),
        },
        schedule: {
          totalClasses: 0,
          upcomingClasses: 0,
          classSchedule: [],
          weeklySchedule: [],
          lastUpdated: new Date(),
        },
        exams: {
          totalExams: 0,
          completedExams: 0,
          upcomingExams: 0,
          examList: [],
          lastUpdated: new Date(),
        },
        faculty: {
          totalFaculty: 0,
          facultyList: [],
          lastUpdated: new Date(),
        },
        chat: {
          totalChats: 0,
          recentChats: [],
          conversationHistory: [],
          lastUpdated: new Date(),
        },
        attendance: {
          totalClasses: student.stats?.totalClasses || 0,
          totalPresent: student.stats?.totalPresent || 0,
          totalAbsent: 0,
          attendancePercentage: student.stats?.totalClasses > 0 ? Math.round((student.stats?.totalPresent / student.stats?.totalClasses) * 100) : 0,
          attendanceRecords: [],
          lastUpdated: new Date(),
        },
      },
      progress: {
        overallProgress: 0,
        coursesInProgress: 0,
        coursesCompleted: 0,
        streak: student.stats?.streak || 1,
        aiUsageCount: student.stats?.aiUsageCount || 0,
        tasksCompleted: student.stats?.tasksCompleted || 0,
        careerReadyScore: student.stats?.careerReadyScore || 0,
        advancedProgress: student.stats?.advancedProgress || 0,
        weeklyActivity: student.stats?.weeklyActivity || [],
        lastUpdated: new Date(),
      },
      statistics: {
        totalAssignmentsSubmitted: 0,
        totalAssignmentsReceived: 0,
        totalProjectsCompleted: 0,
        averageMarks: 0,
        lastUpdated: new Date(),
      },
      activityLog: [],
      lastLogin: student.stats?.lastLogin || new Date(),
      loginCount: 1,
    };

    const newStudentData = new this.studentDataModel(defaultData);
    return newStudentData.save().catch(err => {
      console.error(`[STUDENT-DATA] Failed to create default StudentData: ${err.message}`);
      return defaultData;
    });
  }

  async findByStudent(rollNumber: string): Promise<any> {
    let data = await this.studentDataModel.findOne({ rollNumber }).lean().catch(err => {
      console.warn(`[STUDENT-DATA] studentDataModel findOne failed: ${err.message}`);
      return null;
    });

    if (!data) {
      // Self-heal: Try to find student in Mongoose and create StudentData
      try {
        const studentModel = this.studentDataModel.db.model('Student');
        if (studentModel) {
          const student = await studentModel.findOne({ sid: rollNumber }).lean().catch(() => null);
          if (student) {
            const savedData = await this.createDefaultStudentData(student);
            data = JSON.parse(JSON.stringify(savedData));
          }
        }
      } catch (err) {
        console.warn(`[STUDENT-DATA] Self-healing model resolution failed: ${err.message}`);
      }
    }

    if (!data) return null;

    // Try to get updated info from Mongoose (primary) or SQL (fallback)
    let student = null;
    try {
      const studentModel = this.studentDataModel.db.model('Student');
      if (studentModel) {
        student = await studentModel.findOne({ sid: rollNumber }).lean().catch(() => null);
      }
    } catch (err) {}

    if (!student) {
      student = await this.studentRepo.findOne({ where: { sid: rollNumber } }).catch(err => {
        console.warn(`[STUDENT-DATA] studentRepo findOne failed: ${err.message}`);
        return null;
      });
    }

    if (student) {
      data.name = student.studentName || student.name;
      data.email = student.email;
      data.branch = student.branch;
      (data as any).role = student.role || 'student';
      (data as any).source = 'mongoose_merged';
    }

    return data;
  }

  async getDashboard(rollNumber: string): Promise<any> {
    const cached = this.getCached(`dashboard_${rollNumber}`);
    if (cached) return cached;
    
    // FETCH ALL DATA IN PARALLEL FOR MAXIMUM PERFORMANCE
    let studentMongoose = null;
    try {
      const studentModel = this.studentDataModel.db.model('Student');
      if (studentModel) {
        studentMongoose = await studentModel.findOne({ sid: rollNumber }).lean().catch(() => null);
      }
    } catch (e) {
      console.warn(`[DASHBOARD] Mongoose student lookup error: ${e.message}`);
    }

    const [attendance, marks, mongoData] = await Promise.all([
        this.attendanceModel.find({ studentId: rollNumber }).lean().catch(err => {
            console.warn(`[DASHBOARD] attendanceModel find failed: ${err.message}`);
            return [];
        }),
        this.markModel.find({ studentId: rollNumber }).lean().catch(err => {
            console.warn(`[DASHBOARD] markModel find failed: ${err.message}`);
            return [];
        }),
        this.studentDataModel.findOne({ rollNumber }).lean().catch(err => {
            console.warn(`[DASHBOARD] studentDataModel findOne failed: ${err.message}`);
            return null;
        })
    ]);

    // Fallback to TypeORM student repo if Mongoose failed
    let student = studentMongoose;
    if (!student) {
        student = await this.studentRepo.findOne({ where: { sid: rollNumber } }).catch(err => {
            console.warn(`[DASHBOARD] studentRepo findOne failed: ${err.message}`);
            return null;
        });
    }

    // Self-healing: if student exists but has no dashboard cache document, create it
    let dbMongoData = mongoData;
    if (!dbMongoData && student) {
        const savedData = await this.createDefaultStudentData(student);
        dbMongoData = JSON.parse(JSON.stringify(savedData));
    }

    let totalClasses = attendance?.length || 0;
    let presentClasses = attendance?.filter(a => a.status === 'Present').length || 0;

    // Get courses from Mongoose (Primary) or TypeORM (Fallback)
    let studentCourses = [];
    if (student) {
        // Try Mongoose first (Primary)
        try {
            const courseModel = this.studentDataModel.db.model('Course');
            if (courseModel) {
                studentCourses = await courseModel.find({
                    year: String(student.year),
                    branch: { $in: [student.branch, 'All', 'Common'] }
                }).lean().catch(() => []);
            }
        } catch (mongooseCourseErr) {
            console.warn(`[COURSE] Mongoose course query failed: ${mongooseCourseErr.message}. Trying TypeORM.`);
        }

        // Fallback to TypeORM courseRepo
        if (!studentCourses || studentCourses.length === 0) {
            try {
                studentCourses = await this.courseRepo.find({
                    where: { year: String(student.year), branch: student.branch }
                });
                if (studentCourses.length === 0) {
                    studentCourses = await this.courseRepo.find({
                        where: { year: String(student.year), branch: 'All' }
                    });
                }
                if (studentCourses.length === 0) {
                    studentCourses = await this.courseRepo.find({
                        where: { year: String(student.year), branch: 'Common' }
                    });
                }
            } catch (courseErr) {
                console.warn(`[COURSE] TypeORM course query failed: ${courseErr.message}. Bypassing.`);
                studentCourses = [];
            }
        }
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
      .lean()
      .catch(err => {
        console.warn(`[DASHBOARD] materialModel find failed: ${err.message}`);
        return [];
      });

    const result = {
      profile: student || dbMongoData || {},
      student: student || dbMongoData || {},
      attendance: {
        total: totalClasses,
        present: presentClasses,
        percentage: totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0,
        records: attendance.slice(0, 50), // last 50 records
      },
      marks: marks,
      courses: studentCourses.map(c => ({ 
          id: c.id || c._id?.toString(),
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
        ...(dbMongoData || {}),
        activity: {
          streak: (dbMongoData as any)?.progress?.streak || student?.stats?.streak || 0,
          aiUsage: (dbMongoData as any)?.progress?.aiUsageCount || student?.stats?.aiUsageCount || 0,
          careerReadyScore: (dbMongoData as any)?.progress?.careerReadyScore || student?.stats?.careerReadyScore || 0,
          cgpa: student?.stats?.cgpa || (dbMongoData as any)?.sections?.overview?.currentCGPA || 8.2
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
      faculties: dbMongoData?.sections?.faculty?.facultyList || [],
      source: 'mongodb',
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
