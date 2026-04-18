import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Faculty, FacultyDocument } from '../schemas/faculty.schema';
import { Student, StudentDocument } from '../schemas/student.schema';
import { Material, MaterialDocument } from '../schemas/material.schema';
import { Message, MessageDocument } from '../schemas/message.schema';
import { Faculty as FacultyEntity } from '../entities/faculty.entity';
import { Student as StudentEntity } from '../entities/student.entity';
import { Attendance as AttendanceEntity } from '../entities/attendance.entity';
import { Course as CourseEntity } from '../entities/course.entity';

@Injectable()
export class FacultyDataService {
  constructor(
    @InjectModel(Faculty.name) private facultyModel: Model<FacultyDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Material.name) private materialModel: Model<MaterialDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectRepository(FacultyEntity) private facultyRepo: Repository<FacultyEntity>,
    @InjectRepository(AttendanceEntity) private attendanceRepo: Repository<AttendanceEntity>,
    @InjectRepository(CourseEntity) private courseRepo: Repository<CourseEntity>,
    @InjectRepository(StudentEntity) private studentRepo: Repository<StudentEntity>,
  ) { }

  async getDashboard(facultyId: string): Promise<any> {
    const faculty = await this.facultyRepo.findOne({ where: { facultyId } });
    let mongoFac: any = null;

    if (!faculty) {
      mongoFac = await this.facultyModel.findOne({ facultyId }).lean();
      if (!mongoFac) return { error: 'Faculty not found' };
    }

    const currentFac = faculty || mongoFac;
    const assignments = currentFac.assignments || [];

    // --- Fetch Students for Assigned Sections ---
    let students = [];
    if (assignments.length > 0) {
      const filters = assignments.map(a => ({
        year: String(a.year),
        section: String(a.section).toUpperCase(),
        branch: a.branch
      }));

      // In Mongo
      students = await this.studentModel.find({
        $or: filters
      }).select('sid studentName email branch year section profileImage').lean();

      // Fallback/Merge with MySQL if Mongo is empty or as needed
      if (students.length === 0) {
        // Simple fallback to fetching by branches if complex filter fails
        const branches = [...new Set(assignments.map(a => String(a.branch)))] as string[];
        students = await this.studentRepo.find({
          where: branches.map(b => ({ branch: b } as any))
        });
      }
    }

    const attendance = await this.attendanceRepo.find({ where: { facultyId } });
    const courses = await this.courseRepo.find();
    
    // Fetch relevant materials
    const assignedSubjects = [...new Set(assignments.map(a => a.subject))];
    const materials = await this.materialModel.find({
      subject: { $in: assignedSubjects }
    }).limit(50).sort({ createdAt: -1 }).lean();

    // Fetch relevant messages (sent by this faculty or generally to faculty)
    const messages = await this.messageModel.find({
        $or: [
            { facultyId },
            { target: 'faculty' },
            { target: 'all' }
        ]
    }).limit(20).sort({ createdAt: -1 }).lean();

    const uniqueSubjects = [...new Set(attendance.map(a => a.subject))];
    const uniqueDates = [...new Set(attendance.map(a => a.date))];

    return {
      faculty: {
        facultyId: currentFac.facultyId,
        facultyName: currentFac.facultyName || currentFac.name,
        email: currentFac.email,
        department: (currentFac as any).branch || (currentFac as any).department,
        designation: currentFac.designation,
        role: currentFac.role,
        assignments: assignments,
        image: currentFac.image || currentFac.profilePic || currentFac.profileImage
      },
      stats: {
        totalAttendanceMarked: attendance.length,
        uniqueSubjects: uniqueSubjects.length,
        uniqueDates: uniqueDates.length,
        subjects: uniqueSubjects,
      },
      students,
      materials,
      messages,
      courses: courses.slice(0, 20).map(c => ({ code: c.code || c.courseCode, name: c.name || c.courseName })),
      source: faculty ? 'mysql' : 'mongodb',
    };
  }

  async getByBranch(branch: string): Promise<any[]> {
    const fromSql = await this.facultyRepo.find({ where: { branch } });
    if (fromSql.length > 0) return fromSql.map(f => ({ ...f, source: 'mysql' }));
    return this.facultyModel.find({ branch }).lean();
  }

  async getByExpertise(expertise: string): Promise<any[]> {
    const fromSql = await this.facultyRepo.find({
      where: { expertise: Like(`%${expertise}%`) }
    });
    if (fromSql.length > 0) return fromSql.map(f => ({ ...f, source: 'mysql' }));
    return this.facultyModel.find({ expertise: { $regex: expertise, $options: 'i' } }).lean();
  }
}
