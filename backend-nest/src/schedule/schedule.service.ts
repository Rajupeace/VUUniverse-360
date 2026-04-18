import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule, ScheduleDocument } from '../schemas/schedule.schema';
import { Schedule as ScheduleEntity } from '../entities/schedule.entity';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>,
    @InjectRepository(ScheduleEntity) private scheduleRepo: Repository<ScheduleEntity>,
    @InjectConnection() private readonly connection: Connection,
  ) { }

  async findAll(query: any): Promise<any[]> {
    const sqlSchedules = await this.scheduleRepo.find({ order: { day: 'ASC', startTime: 'ASC' } });
    if (sqlSchedules.length > 0) return sqlSchedules.map(s => ({ ...s, id: s.id.toString(), source: 'mysql' }));

    if (this.connection.readyState !== 1) return [];
    return this.scheduleModel.find(query).sort({ day: 1, startTime: 1 }).lean();
  }

  async findOne(id: string): Promise<any> {
    if (!isNaN(Number(id))) {
      const sqlS = await this.scheduleRepo.findOneBy({ id: Number(id) });
      if (sqlS) return { ...sqlS, source: 'mysql' };
    }

    if (this.connection.readyState === 1) {
      const schedule = await this.scheduleModel.findById(id).lean();
      if (schedule) return { ...schedule, source: 'mongodb' };
    }

    throw new NotFoundException('Schedule entry not found');
  }

  async findByStudent(params: { branch: string; year: string; section: string }): Promise<any[]> {
    const sqlS = await this.scheduleRepo.find({ where: params, order: { day: 'ASC', startTime: 'ASC' } });
    if (sqlS.length > 0) return sqlS;

    if (this.connection.readyState !== 1) return [];
    return this.scheduleModel.find(params).sort({ day: 1, startTime: 1 }).lean();
  }

  async findByFaculty(facultyIdOrName: string): Promise<any[]> {
    const sqlS = await this.scheduleRepo.find({
      where: [
        { facultyId: facultyIdOrName },
        { facultyName: facultyIdOrName }
      ],
      order: { day: 'ASC', startTime: 'ASC' }
    });
    if (sqlS.length > 0) return sqlS;

    if (this.connection.readyState !== 1) return [];
    return this.scheduleModel.find({
      $or: [
        { facultyId: facultyIdOrName },
        { facultyName: facultyIdOrName }
      ]
    }).sort({ day: 1, startTime: 1 }).lean();
  }

  async create(data: any): Promise<any> {
    // MySQL
    try {
      const sqlSched = this.scheduleRepo.create({
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        subject: data.subject,
        facultyId: data.facultyId,
        facultyName: data.facultyName,
        roomNumber: data.roomName || data.roomNumber,
        year: String(data.year || '1'),
        branch: data.branch,
        section: String(data.section || 'All'),
      });
      await this.scheduleRepo.save(sqlSched);
    } catch (e) { console.warn(`MySQL Schedule Create Error: ${e.message}`); }

    // MongoDB
    const schedule = new this.scheduleModel(data);
    return schedule.save();
  }

  async update(id: string, data: any): Promise<any> {
    // 1. MySQL
    if (!isNaN(Number(id))) {
      await this.scheduleRepo.update(Number(id), data);
    }

    // 2. MongoDB
    if (this.connection.readyState === 1) {
      const result = await this.scheduleModel.findByIdAndUpdate(id, { $set: data }, { new: true });
      if (result) return result;
    }

    if (!isNaN(Number(id))) {
      return this.scheduleRepo.findOneBy({ id: Number(id) });
    }

    throw new NotFoundException('Schedule entry not found');
  }

  async delete(id: string): Promise<any> {
    let deleted = false;
    if (!isNaN(Number(id))) {
      const res = await this.scheduleRepo.delete(Number(id));
      if (res.affected > 0) deleted = true;
    }
    if (this.connection.readyState === 1) {
      const res = await this.scheduleModel.findByIdAndDelete(id);
      if (res) deleted = true;
    }
    if (!deleted) throw new NotFoundException('Schedule entry not found');
    return { success: true };
  }
}
