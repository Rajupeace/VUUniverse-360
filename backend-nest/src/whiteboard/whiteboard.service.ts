import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Whiteboard, WhiteboardDocument } from '../schemas/whiteboard.schema';
import { Whiteboard as WhiteboardEntity } from '../entities/whiteboard.entity';

@Injectable()
export class WhiteboardService {
  constructor(
    @InjectModel(Whiteboard.name) private whiteboardModel: Model<WhiteboardDocument>,
    @InjectRepository(WhiteboardEntity) private whiteboardRepo: Repository<WhiteboardEntity>,
    @InjectConnection() private readonly connection: Connection,
  ) { }

  async findAll(userId: string): Promise<any[]> {
    // Try SQL first
    const sqlSessions = await this.whiteboardRepo.find({
      where: { createdBy: userId },
      order: { updatedAt: 'DESC' }
    });

    if (sqlSessions.length > 0) {
      return sqlSessions.map(s => ({ ...s, id: s.id.toString(), source: 'mysql' }));
    }

    if (this.connection.readyState !== 1) return [];
    return this.whiteboardModel.find({
      $or: [
        { createdBy: userId },
        { sharedWith: userId }
      ]
    }).sort({ updatedAt: -1 }).lean();
  }

  async findOne(id: string): Promise<any> {
    if (!isNaN(Number(id))) {
      const sqlS = await this.whiteboardRepo.findOneBy({ id: Number(id) });
      if (sqlS) return { ...sqlS, source: 'mysql' };
    }

    if (this.connection.readyState === 1) {
      const entry = await this.whiteboardModel.findById(id).lean();
      if (entry) return { ...entry, source: 'mongodb' };
    }

    throw new NotFoundException('Whiteboard session not found');
  }

  async create(data: any): Promise<any> {
    // MySQL
    try {
      const sqlSession = this.whiteboardRepo.create({
        title: data.sessionName || data.title,
        createdBy: data.createdBy || data.userId, // handle variation
        content: typeof data.data === 'string' ? data.data : JSON.stringify(data.data || {}),
        roomId: data.roomCode || data.roomId || `room_${Date.now()}`,
        year: data.year,
        branch: data.branch,
        section: data.section,
        subject: data.subject
      });
      await this.whiteboardRepo.save(sqlSession);
    } catch (e) {
      console.warn(`MySQL Whiteboard Create Error: ${e.message}`);
    }

    // MongoDB
    const entry = new this.whiteboardModel(data);
    return entry.save();
  }

  async update(id: string, data: any): Promise<any> {
    // 1. MySQL
    if (!isNaN(Number(id))) {
      const updatePayload: any = {};
      if (data.sessionName || data.title) updatePayload.title = data.sessionName || data.title;
      if (data.data) updatePayload.content = typeof data.data === 'string' ? data.data : JSON.stringify(data.data);
      if (data.roomCode || data.roomId) updatePayload.roomId = data.roomCode || data.roomId;

      await this.whiteboardRepo.update(Number(id), updatePayload);
    }

    // 2. MongoDB
    if (this.connection.readyState === 1) {
      const result = await this.whiteboardModel.findByIdAndUpdate(id, { $set: data }, { new: true });
      if (result) return result;
    }

    if (!isNaN(Number(id))) {
      return this.whiteboardRepo.findOneBy({ id: Number(id) });
    }

    throw new NotFoundException('Whiteboard session not found');
  }

  async delete(id: string): Promise<any> {
    let deleted = false;
    if (!isNaN(Number(id))) {
      const res = await this.whiteboardRepo.delete(Number(id));
      if (res.affected > 0) deleted = true;
    }
    if (this.connection.readyState === 1) {
      const entry = await this.whiteboardModel.findByIdAndDelete(id);
      if (entry) deleted = true;
    }
    if (!deleted) throw new NotFoundException('Whiteboard session not found');
    return { success: true };
  }
}
