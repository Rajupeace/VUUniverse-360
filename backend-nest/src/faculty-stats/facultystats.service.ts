import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faculty, FacultyDocument } from '../schemas/faculty.schema';
import { Student, StudentDocument } from '../schemas/student.schema';
import { Material, MaterialDocument } from '../schemas/material.schema';
import { Faculty as FacultyEntity } from '../entities/faculty.entity';
import { Student as StudentEntity } from '../entities/student.entity';

@Injectable()
export class FacultyStatsService {
  constructor(
    @InjectModel(Faculty.name) private facultyModel: Model<FacultyDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Material.name) private materialModel: Model<MaterialDocument>,
    @InjectRepository(FacultyEntity) private facultyRepo: Repository<FacultyEntity>,
    @InjectRepository(StudentEntity) private studentRepo: Repository<StudentEntity>,
  ) { }

  async getFacultyStudents(facultyId: string): Promise<any[]> {
    const faculty = await this.facultyRepo.findOne({ where: { facultyId } });
    let mongoFac: any = null;

    if (!faculty) {
      mongoFac = await this.facultyModel.findOne({ facultyId }).lean();
    }

    const currentFac = faculty || mongoFac;
    if (!currentFac) return [];

    const assignments = currentFac.assignments || [];
    if (assignments.length === 0) return [];

    const filters = assignments.map(a => ({
      year: String(a.year),
      section: String(a.section).toUpperCase(),
      branch: a.branch
    }));

    const students = await this.studentModel.find({
      $or: filters
    }).select('sid studentName email branch year section profileImage').lean();

    if (students.length === 0) {
        const branches = [...new Set(assignments.map(a => String(a.branch)))] as string[];
        const sqlStudents = await this.studentRepo.find({
          where: branches.map(b => ({ branch: b } as any))
        });
        return sqlStudents.map(s => ({ ...s, source: 'mysql' }));
    }

    return students.map(s => ({ ...s, source: 'mongodb' }));
  }

  async getMaterialsDownloads(facultyId: string): Promise<any[]> {
    // In our system, materials are often linked by facultyName or uploadedBy (facultyId)
    const faculty = await this.facultyRepo.findOne({ where: { facultyId } });
    const facultyName = faculty?.facultyName || (faculty as any)?.name;

    const materials = await this.materialModel.find({
      $or: [
        { uploadedBy: facultyId },
        { facultyName: facultyName }
      ]
    }).select('title downloads subject type createdAt').lean();

    return materials;
  }
}
