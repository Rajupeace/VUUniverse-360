import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicPulse, AcademicPulseDocument } from '../schemas/academic-pulse.schema';
import { AcademicPulse as PulseEntity } from '../entities/academic-pulse.entity';

@Injectable()
export class AcademicPulseService {
  constructor(
    @InjectModel(AcademicPulse.name) private pulseModel: Model<AcademicPulseDocument>,
    @InjectRepository(PulseEntity) private pulseRepo: Repository<PulseEntity>,
    @InjectConnection() private readonly connection: Connection,
  ) { }

  async findAll(): Promise<any[]> {
    // Try SQL first
    const sqlItems = await this.pulseRepo.find({ where: { isActive: true }, order: { createdAt: 'DESC' } });
    if (sqlItems.length > 0) return sqlItems.map(i => ({ ...i, id: i.id.toString(), source: 'mysql' }));

    if (this.connection.readyState !== 1) return [];
    return this.pulseModel.find({ active: true }).sort({ publishDate: -1 }).limit(10).lean();
  }

  async create(data: any): Promise<any> {
    // Write to MySQL
    try {
      const sqlPulse = this.pulseRepo.create({
        title: data.title || 'Academic Update',
        content: data.content || data.message || data.description,
        type: data.type || 'update',
        priority: data.priority || 'medium',
        isActive: data.active !== undefined ? data.active : true,
        postedBy: data.postedBy || 'System',
      });
      await this.pulseRepo.save(sqlPulse);
    } catch (e) { console.warn(`MySQL Pulse Create Error: ${e.message}`); }

    // Write to MongoDB
    const entry = new this.pulseModel(data);
    return entry.save();
  }

  async delete(id: string): Promise<any> {
    let deleted = false;
    if (!isNaN(Number(id))) {
      const res = await this.pulseRepo.delete(Number(id));
      if (res.affected > 0) deleted = true;
    }
    if (this.connection.readyState === 1) {
      const res = await this.pulseModel.findByIdAndDelete(id);
      if (res) deleted = true;
    }
    if (!deleted) throw new NotFoundException('Pulse entry not found');
    return { success: true };
  }
}
