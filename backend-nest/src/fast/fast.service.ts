import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Fast, FastDocument } from '../schemas/fast.schema';
import { Assignment as AssignmentEntity } from '../entities/assignment.entity';
import { SseService } from '../sse/sse.service';

@Injectable()
export class FastService {
  constructor(
    @InjectModel(Fast.name) private fastModel: Model<FastDocument>,
    @InjectRepository(AssignmentEntity) private assignmentRepo: Repository<AssignmentEntity>,
    @InjectConnection() private readonly connection: Connection,
    private sseService: SseService,
  ) { }

  async findAll(query: any): Promise<any[]> {
    const sqlAssignments = await this.assignmentRepo.find({ order: { dueDate: 'ASC' } });
    if (sqlAssignments.length > 0) return sqlAssignments.map(a => ({ ...a, id: a.id.toString(), source: 'mysql' }));

    if (this.connection.readyState !== 1) return [];
    return this.fastModel.find(query).sort({ dueDate: 1 }).lean();
  }

  async findOne(id: string): Promise<any> {
    if (!isNaN(Number(id))) {
      const sqlA = await this.assignmentRepo.findOneBy({ id: Number(id) });
      if (sqlA) return { ...sqlA, source: 'mysql' };
    }

    if (this.connection.readyState === 1) {
      const entry = await this.fastModel.findById(id).lean();
      if (entry) return { ...entry, source: 'mongodb' };
    }

    throw new NotFoundException('Assignment tracking not found');
  }

  async create(data: any): Promise<any> {
    // MySQL
    try {
      const sqlAsgn = this.assignmentRepo.create({
        title: data.title,
        description: data.description,
        facultyId: data.facultyId,
        subject: data.subject,
        branch: data.branch,
        year: String(data.year || '1'),
        section: String(data.section || 'All'),
        dueDate: data.dueDate ? new Date(data.dueDate) : new Date(),
        isActive: true,
      });
      await this.assignmentRepo.save(sqlAsgn);
    } catch (e) { console.warn(`MySQL Assignment Create Error: ${e.message}`); }

    // MongoDB
    const entry = new this.fastModel(data);
    const saved = await entry.save();
    this.sseService.broadcast({ resource: 'assignments', action: 'create', data: saved });
    return saved;
  }

  async findByStudent(params: { branch: string; year: string; section: string }): Promise<any[]> {
    const sqlItems = await this.assignmentRepo.find({
      where: { ...params, isActive: true, dueDate: MoreThanOrEqual(new Date()) },
      order: { dueDate: 'ASC' }
    });
    if (sqlItems.length > 0) return sqlItems;

    if (this.connection.readyState !== 1) return [];
    return this.fastModel.find({
      ...params,
      isActive: true,
      dueDate: { $gte: new Date() }
    }).sort({ dueDate: 1 }).lean();
  }

  async findByFaculty(facultyId: string): Promise<any[]> {
    const sqlItems = await this.assignmentRepo.find({ where: { facultyId }, order: { createdAt: 'DESC' } });
    if (sqlItems.length > 0) return sqlItems;

    if (this.connection.readyState !== 1) return [];
    return this.fastModel.find({ facultyId }).sort({ createdAt: -1 }).lean();
  }

  async delete(id: string): Promise<any> {
    let deleted = false;
    if (!isNaN(Number(id))) {
      const res = await this.assignmentRepo.delete(Number(id));
      if (res.affected > 0) deleted = true;
    }
    if (this.connection.readyState === 1) {
      const res = await this.fastModel.findByIdAndDelete(id);
      if (res) deleted = true;
    }
    if (!deleted) throw new NotFoundException('Assignment tracking not found');
    this.sseService.broadcast({ resource: 'assignments', action: 'delete', data: { id } });
    return { success: true };
  }
}
