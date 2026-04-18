import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventDocument } from '../schemas/event.schema';
import { Event as EventEntity } from '../entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectRepository(EventEntity) private eventRepo: Repository<EventEntity>,
    @InjectConnection() private readonly connection: Connection,
  ) { }

  async findAll(query: any): Promise<any[]> {
    // Try SQL first
    const sqlEvents = await this.eventRepo.find({ where: { status: 'upcoming' }, order: { eventDate: 'ASC' } });
    if (sqlEvents.length > 0) {
      return sqlEvents.map(e => ({ ...e, id: e.id, source: 'mysql' }));
    }

    if (this.connection.readyState !== 1) return [];
    return this.eventModel.find({ ...query }).sort({ date: 1 }).lean();
  }

  async findOne(id: string): Promise<any> {
    // SQL first
    if (!isNaN(Number(id))) {
      const sqlEvent = await this.eventRepo.findOneBy({ id: Number(id) });
      if (sqlEvent) return { ...sqlEvent, source: 'mysql' };
    }

    if (this.connection.readyState === 1) {
      const event = await this.eventModel.findById(id).lean();
      if (event) return { ...event, source: 'mongodb' };
    }

    throw new NotFoundException('Event not found');
  }

  async create(data: any): Promise<any> {
    // Write to MySQL
    try {
      const sqlEvent = this.eventRepo.create({
        title: data.title,
        description: data.description,
        eventDate: data.date || data.eventDate || new Date().toISOString(),
        location: data.location || data.venue,
        category: data.category || data.type || 'General',
        organizer: data.organizer,
        status: data.status || 'upcoming',
        year: data.year,
        branch: data.branch,
        imageUrl: data.imageUrl,
      });
      await this.eventRepo.save(sqlEvent);
    } catch (e) {
      console.warn(`MySQL Event Create Error: ${e.message}`);
    }

    // Write to MongoDB
    const event = new this.eventModel(data);
    return event.save();
  }

  async update(id: string, data: any): Promise<any> {
    // 1. Try MySQL
    if (!isNaN(Number(id))) {
      const updateData: any = { ...data };
      if (data.date) updateData.eventDate = data.date;
      if (data.type) updateData.category = data.type;
      await this.eventRepo.update(Number(id), updateData);
    }

    // 2. Try MongoDB
    if (this.connection.readyState === 1) {
      const result = await this.eventModel.findByIdAndUpdate(id, { $set: data }, { new: true });
      if (result) return result;
    }

    if (!isNaN(Number(id))) {
      return this.eventRepo.findOneBy({ id: Number(id) });
    }

    throw new NotFoundException('Event not found');
  }

  async delete(id: string): Promise<any> {
    let deleted = false;

    if (!isNaN(Number(id))) {
      const res = await this.eventRepo.delete(Number(id));
      if (res.affected > 0) deleted = true;
    }

    if (this.connection.readyState === 1) {
      const result = await this.eventModel.findByIdAndDelete(id);
      if (result) deleted = true;
    }

    if (!deleted) throw new NotFoundException('Event not found');
    return { success: true };
  }

  async getUpcoming(): Promise<any[]> {
    // SQL first
    const sqlUpcoming = await this.eventRepo.find({
      where: { status: 'upcoming' },
      order: { eventDate: 'ASC' },
      take: 10
    });

    if (sqlUpcoming.length > 0) {
      return sqlUpcoming.map(e => ({ ...e, id: e.id, source: 'mysql' }));
    }

    if (this.connection.readyState !== 1) return [];
    return this.eventModel.find({
      date: { $gte: new Date() }
    }).sort({ date: 1 }).limit(10).lean();
  }
}
