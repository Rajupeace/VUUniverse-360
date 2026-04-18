import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hostel, HostelDocument } from '../schemas/hostel.schema';
import { Hostel as HostelEntity } from '../entities/hostel.entity';
import { SseService } from '../sse/sse.service';

@Injectable()
export class HostelService {
  constructor(
    @InjectModel(Hostel.name) private hostelModel: Model<HostelDocument>,
    @InjectRepository(HostelEntity) private hostelRepo: Repository<HostelEntity>,
    @InjectConnection() private readonly connection: Connection,
    private sseService: SseService,
  ) { }

  async findAll(query: any): Promise<any[]> {
    const sqlHostels = await this.hostelRepo.find({ order: { admissionDate: 'DESC' } });
    if (sqlHostels.length > 0) return sqlHostels.map(h => ({ ...h, id: h.id.toString(), source: 'mysql' }));

    if (this.connection.readyState !== 1) return [];
    return this.hostelModel.find(query).sort({ admissionDate: -1 }).lean();
  }

  async findOne(id: string): Promise<any> {
    if (!isNaN(Number(id))) {
      const sqlH = await this.hostelRepo.findOneBy({ id: Number(id) });
      if (sqlH) return { ...sqlH, source: 'mysql' };
    }

    if (this.connection.readyState === 1) {
      const hostel = await this.hostelModel.findById(id).lean();
      if (hostel) return { ...hostel, source: 'mongodb' };
    }

    throw new NotFoundException('Hostel record not found');
  }

  async findByStudent(rollNumber: string): Promise<any> {
    const sqlH = await this.hostelRepo.findOneBy({ studentId: rollNumber });
    if (sqlH) return sqlH;

    if (this.connection.readyState !== 1) return null;
    return this.hostelModel.findOne({ rollNumber }).lean();
  }

  async create(data: any): Promise<any> {
    // MySQL
    try {
      const sqlHostel = this.hostelRepo.create({
        studentId: data.rollNumber || data.studentId,
        studentName: data.studentName,
        blockName: data.blockName,
        roomNumber: data.roomNumber,
        roomType: data.roomType,
        admissionDate: data.admissionDate ? String(data.admissionDate) : new Date().toISOString(),
        feePaid: Number(data.feePaid || 0),
        status: data.status || 'Allocated',
      });
      await this.hostelRepo.save(sqlHostel);
    } catch (e) { console.warn(`MySQL Hostel Create Error: ${e.message}`); }

    // MongoDB
    const hostel = new this.hostelModel(data);
    const saved = await hostel.save();
    this.sseService.broadcast({ resource: 'hostel', action: 'create', data: { id: saved._id } });
    return saved;
  }

  async update(id: string, data: any): Promise<any> {
    // 1. MySQL
    if (!isNaN(Number(id))) {
      await this.hostelRepo.update(Number(id), data);
    }

    // 2. MongoDB
    if (this.connection.readyState === 1) {
      const result = await this.hostelModel.findByIdAndUpdate(id, { $set: data }, { new: true });
      if (result) {
        this.sseService.broadcast({ resource: 'hostel', action: 'update', data: { id } });
        return result;
      }
    }

    if (!isNaN(Number(id))) {
      const sqlRes = await this.hostelRepo.findOneBy({ id: Number(id) });
      if (sqlRes) {
        this.sseService.broadcast({ resource: 'hostel', action: 'update', data: { id } });
        return sqlRes;
      }
    }

    throw new NotFoundException('Hostel record not found');
  }

  async delete(id: string): Promise<any> {
    let deleted = false;
    if (!isNaN(Number(id))) {
      const res = await this.hostelRepo.delete(Number(id));
      if (res.affected > 0) deleted = true;
    }
    if (this.connection.readyState === 1) {
      const res = await this.hostelModel.findByIdAndDelete(id);
      if (res) deleted = true;
    }
    if (!deleted) throw new NotFoundException('Hostel record not found');
    this.sseService.broadcast({ resource: 'hostel', action: 'delete', data: { id } });
    return { success: true };
  }

  async changeStatus(id: string, status: string): Promise<any> {
    return this.update(id, { status, vacatingDate: status === 'Vacated' ? new Date().toISOString() : undefined });
  }
}
