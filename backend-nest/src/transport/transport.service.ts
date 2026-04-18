import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transport, TransportDocument } from '../schemas/transport.schema';
import { Transport as TransportEntity } from '../entities/transport.entity';
import { SseService } from '../sse/sse.service';

@Injectable()
export class TransportService {
  constructor(
    @InjectModel(Transport.name) private transportModel: Model<TransportDocument>,
    @InjectRepository(TransportEntity) private transportRepo: Repository<TransportEntity>,
    @InjectConnection() private readonly connection: Connection,
    private sseService: SseService,
  ) { }

  async findAll(query: any): Promise<any[]> {
    const sqlTransports = await this.transportRepo.find({ order: { routeName: 'ASC' } });
    if (sqlTransports.length > 0) return sqlTransports.map(t => ({ ...t, id: t.id.toString(), source: 'mysql' }));

    if (this.connection.readyState !== 1) return [];
    return this.transportModel.find(query).sort({ route: 1 }).lean();
  }

  async findOne(id: string): Promise<any> {
    if (!isNaN(Number(id))) {
      const sqlT = await this.transportRepo.findOneBy({ id: Number(id) });
      if (sqlT) return { ...sqlT, source: 'mysql' };
    }

    if (this.connection.readyState === 1) {
      const entry = await this.transportModel.findById(id).lean();
      if (entry) return { ...entry, source: 'mongodb' };
    }

    throw new NotFoundException('Transport record not found');
  }

  async findByStudent(rollNumber: string): Promise<any> {
    const sqlT = await this.transportRepo.findOneBy({ studentId: rollNumber });
    if (sqlT) return sqlT;

    if (this.connection.readyState !== 1) return null;
    return this.transportModel.findOne({ rollNumber }).lean();
  }

  async create(data: any): Promise<any> {
    // MySQL
    try {
      const sqlTrans = this.transportRepo.create({
        studentId: data.rollNumber || data.studentId,
        studentName: data.studentName,
        routeName: data.route || data.routeName,
        pickupPoint: data.pickupPoint,
        dropPoint: data.dropPoint,
        pickupTime: data.pickupTime,
        fee: Number(data.fee || 0),
        status: data.status || 'Active',
      });
      await this.transportRepo.save(sqlTrans);
    } catch (e) { console.warn(`MySQL Transport Create Error: ${e.message}`); }

    // MongoDB
    const entry = new this.transportModel(data);
    const saved = await entry.save();
    this.sseService.broadcast({ resource: 'transport', action: 'create', data: { id: saved._id } });
    return saved;
  }

  async update(id: string, data: any): Promise<any> {
    // 1. MySQL
    if (!isNaN(Number(id))) {
      await this.transportRepo.update(Number(id), data);
    }

    if (this.connection.readyState === 1) {
      const result = await this.transportModel.findByIdAndUpdate(id, { $set: data }, { new: true });
      if (result) {
        this.sseService.broadcast({ resource: 'transport', action: 'update', data: { id } });
        return result;
      }
    }

    if (!isNaN(Number(id))) {
      const sqlEntry = await this.transportRepo.findOneBy({ id: Number(id) });
      if (sqlEntry) {
        this.sseService.broadcast({ resource: 'transport', action: 'update', data: { id } });
        return sqlEntry;
      }
    }

    throw new NotFoundException('Transport record not found');
  }

  async delete(id: string): Promise<any> {
    let deleted = false;
    if (!isNaN(Number(id))) {
      const res = await this.transportRepo.delete(Number(id));
      if (res.affected > 0) deleted = true;
    }
    if (this.connection.readyState === 1) {
      const res = await this.transportModel.findByIdAndDelete(id);
      if (res) deleted = true;
    }
    if (!deleted) throw new NotFoundException('Transport record not found');
    this.sseService.broadcast({ resource: 'transport', action: 'delete', data: { id } });
    return { success: true };
  }

  async getRouteInfo(route: string): Promise<any[]> {
    const sqlItems = await this.transportRepo.find({ where: { routeName: route, status: 'Active' }, order: { pickupTime: 'ASC' } });
    if (sqlItems.length > 0) return sqlItems;

    if (this.connection.readyState !== 1) return [];
    return this.transportModel.find({ route, status: 'Active' }).sort({ pickupTime: 1 }).lean();
  }
}
