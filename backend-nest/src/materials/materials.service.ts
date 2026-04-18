import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material, MaterialDocument } from '../schemas/material.schema';
import { Course, CourseDocument } from '../schemas/course.schema';
import { Faculty, FacultyDocument } from '../schemas/faculty.schema';
import { Message, MessageDocument } from '../schemas/message.schema';
import { Material as MaterialEntity } from '../entities/material.entity';
import { Course as CourseEntity } from '../entities/course.entity';
import { Faculty as FacultyEntity } from '../entities/faculty.entity';
import { SseService } from '../sse/sse.service';
import * as path from 'path';
import * as fs from 'fs';

import { DEMO_MATERIALS } from './demo-materials';

@Injectable()
export class MaterialsService {
  private readonly uploadsDir = path.join(process.cwd(), '..', 'uploads');

  constructor(
    @InjectModel(Material.name) private materialModel: Model<MaterialDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Faculty.name) private facultyModel: Model<FacultyDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,

    @InjectRepository(MaterialEntity) private materialRepo: Repository<MaterialEntity>,
    @InjectRepository(CourseEntity) private courseRepo: Repository<CourseEntity>,
    @InjectRepository(FacultyEntity) private facultyRepo: Repository<FacultyEntity>,

    @InjectConnection() private readonly connection: Connection,
    private sseService: SseService,
  ) {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async findAll(queryParams: any): Promise<any[]> {
    const { subject, year, semester, module, unit, topic, type, section, branch } = queryParams;

    // ... existing sql logic ...
    const sqlQuery: any = {};
    if (subject) sqlQuery.subject = subject;
    if (year) sqlQuery.year = String(year);
    if (semester) sqlQuery.semester = String(semester);
    if (module) sqlQuery.module = String(module);
    if (unit) sqlQuery.unit = String(unit);
    if (topic) sqlQuery.topic = String(topic);
    if (type) sqlQuery.type = String(type);
    if (section) sqlQuery.section = section;
    if (branch) sqlQuery.branch = branch;

    try {
      // 1. Primary: MySQL Strategy
      if (this.materialRepo) {
        const sqlMaterials = await this.materialRepo.find({
          where: Object.keys(sqlQuery).length > 0 ? sqlQuery : {},
          order: { createdAt: 'DESC' },
          take: 100 // Cap results for performance
        });

        if (sqlMaterials && sqlMaterials.length > 0) {
          return sqlMaterials.map(m => ({
            ...m,
            id: m.id.toString(),
            _id: m.id.toString(),
            url: m.fileUrl,
            uploadedAt: (m as any).createdAt || (m as any).updatedAt || new Date(),
            createdAt: (m as any).createdAt || new Date(),
            uploaderName: m.facultyName || 'Faculty',
            source: 'mysql'
          }));
        }
      }
    } catch (e) {
      console.warn('⚠️ [MATERIALS] MySQL Fetch unavailable:', e.message);
    }


    let results = [];
    
    // 2. Secondary: MongoDB Strategy (Real-time storage)
    if (this.connection && this.connection.readyState === 1 && this.materialModel) {
      try {
        const query: any = {};
        if (subject) query.subject = subject;
        if (year) query.year = String(year);
        if (semester) query.semester = String(semester);
        if (module) query.module = String(module);
        if (unit) query.unit = String(unit);
        if (topic) query.topic = String(topic);
        if (type) query.type = String(type);
        if (section) query.section = String(section);
        if (branch) query.branch = branch;

        const materials = await this.materialModel.find(query)
          .select('-videoAnalysis -imageData')
          .sort('-createdAt')
          .limit(100)
          .lean();

        if (materials && materials.length > 0) {
          results = materials.map(m => ({
            id: m._id.toString(),
            _id: m._id.toString(),
            title: m.title,
            description: m.description,
            url: m.fileUrl || m.url,
            type: m.type,
            semester: m.semester,
            subject: m.subject,
            year: m.year,
            section: m.section,
            module: m.module,
            unit: m.unit,
            topic: m.topic,
            videoAnalysis: (m as any).videoAnalysis || "Analysis currently being processed...",
            uploadedAt: (m as any).createdAt || new Date(),
            uploaderName: (m as any).facultyName || 'Faculty',
            source: 'mongodb'
          }));
        }
      } catch (err) {
        console.error('⚠️ [MATERIALS] MongoDB Fetch Error:', err.message);
      }
    }

    // 3. Final Fallback: Zero-Latency Demo Assets
    if (!results || results.length === 0) {
      const demoData = Array.isArray(DEMO_MATERIALS) ? DEMO_MATERIALS : [];
      return demoData.filter(m => {
        if (type && m.type !== type) return false;
        if (year && String(m.year) !== String(year)) return false;
        return true;
      });
    }

    return results;

  }

  async findOne(id: string): Promise<any> {
    if (!isNaN(Number(id))) {
      const sqlM = await this.materialRepo.findOneBy({ id: Number(id) });
      if (sqlM) return { ...sqlM, source: 'mysql' };
    }

    if (this.connection.readyState !== 1) throw new NotFoundException('Material not found');

    const material = await this.materialModel.findById(id)
      .populate('course', 'name code')
      .populate({ path: 'uploadedBy', model: 'Faculty', select: 'name email' })
      .lean();

    if (!material) throw new NotFoundException('Material not found');
    return material;
  }

  async uploadMaterial(body: any, file: any, user: any): Promise<any> {
    const {
      title, description, year, section, subject, type,
      module, semester
    } = body;

    const providedUrl = body.url || body.link || body.fileUrl;
    if (!file && !providedUrl) throw new BadRequestException('Provide file or URL');

    let fileUrl = providedUrl;
    let fileType = type || 'link';
    let fileName = title || 'Untitled';

    if (file && file.path) {
      const relPath = path.relative(this.uploadsDir, file.path);
      fileUrl = `/uploads/${relPath}`.replace(/\\/g, '/');
      fileType = file.mimetype;
      fileName = file.originalname;
    }

    // Write to MySQL
    try {
      const sqlMaterial = this.materialRepo.create({
        title: title || fileName,
        description,
        fileUrl,
        fileType,
        fileName: fileName,
        year: String(year || '1'),
        subject: subject || 'General',
        branch: body.branch || 'Common',
        section: section || 'All',
        uploadedBy: user.facultyId || user.sid || 'system',
        facultyName: user.name || 'Faculty',
        unit: String(module || '1'),
        tags: body.tags ? (Array.isArray(body.tags) ? body.tags.join(',') : String(body.tags)) : ''
      });
      await this.materialRepo.save(sqlMaterial);
    } catch (e) { console.warn(`MySQL Material Upload Error: ${e.message}`); }

    // Write to MongoDB
    if (this.connection.readyState === 1) {
      const material = new this.materialModel({
        title, description, fileUrl, fileType,
        year: year || '1', semester: semester || '1', section: section || 'All',
        subject: subject || 'General', type: type || 'notes',
        module: module || '1', createdAt: new Date()
      });
      await material.save();
      this.sseService.broadcast({ resource: 'materials', action: 'create', data: { id: material._id.toString() } });
      return material;
    }

    return { success: true };
  }

  async update(id: string, body: any, file: any, user: any): Promise<any> {
    // 1. MySQL
    if (!isNaN(Number(id))) {
      const updatePayload: any = { ...body };
      if (file) {
        const relPath = path.relative(this.uploadsDir, file.path);
        updatePayload.fileUrl = `/uploads/${relPath}`.replace(/\\/g, '/');
        updatePayload.fileName = file.originalname;
        updatePayload.fileType = file.mimetype;
      }
      await this.materialRepo.update(Number(id), updatePayload);
    }

    // 2. MongoDB
    if (this.connection.readyState === 1) {
      const result = await this.materialModel.findByIdAndUpdate(id, { $set: body }, { new: true });
      if (result) return result;
    }

    return { success: true };
  }

  async remove(id: string, user?: any): Promise<any> {
    let deleted = false;
    if (!isNaN(Number(id))) {
      const res = await this.materialRepo.delete(Number(id));
      if (res.affected > 0) deleted = true;
    }
    if (this.connection.readyState === 1) {
      const res = await this.materialModel.findByIdAndDelete(id);
      if (res) deleted = true;
    }
    if (!deleted) throw new NotFoundException('Material not found');
    return { success: true };
  }

  async like(id: string): Promise<any> {
    // Placeholder for like functionality
    return { success: true, count: 1 };
  }
}
