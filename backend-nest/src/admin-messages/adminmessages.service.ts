import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, MessageDocument } from '../schemas/message.schema';
import { AdminMessage as AdminMessageEntity } from '../entities/admin-message.entity';
import { SseService } from '../sse/sse.service';

@Injectable()
export class AdminMessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectRepository(AdminMessageEntity) private messageRepo: Repository<AdminMessageEntity>,
    @InjectConnection() private readonly connection: Connection,
    private sseService: SseService,
  ) { }

  async findActive(query: any): Promise<any[]> {
    // MySQL
    const sqlMessages = await this.messageRepo.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' }
    });
    if (sqlMessages.length > 0) return sqlMessages.map(m => ({ ...m, id: m.id.toString(), source: 'mysql' }));

    if (this.connection.readyState !== 1) return [];
    return this.messageModel.find({
      ...query,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    }).sort({ createdAt: -1 }).lean();
  }

  async create(data: any): Promise<any> {
    // MySQL
    try {
      const sqlMsg = this.messageRepo.create({
        title: data.title || 'Broadcast Update',
        content: data.message || data.content,
        type: data.type || 'info',
        targetYear: data.targetYear ? String(data.targetYear) : 'All',
        targetBranch: data.targetBranch || 'All',
        targetSection: data.targetSection || 'All',
        isActive: true,
        expiresAt: data.expiresAt ? String(data.expiresAt) : null,
        createdBy: data.sender || 'Admin'
      });
      await this.messageRepo.save(sqlMsg);
    } catch (e) { console.warn(`MySQL Message Create Error: ${e.message}`); }

    // MongoDB
    const message = new this.messageModel(data);
    const result = await message.save();

    this.sseService.broadcast({
      resource: 'messages',
      action: 'broadcast',
      data: result
    });

    return result;
  }

  async delete(id: string): Promise<any> {
    let deleted = false;
    if (!isNaN(Number(id))) {
      const res = await this.messageRepo.delete(Number(id));
      if (res.affected > 0) deleted = true;
    }
    if (this.connection.readyState === 1) {
      const res = await this.messageModel.findByIdAndDelete(id);
      if (res) deleted = true;
    }
    if (!deleted) throw new NotFoundException('Message not found');
    return { success: true };
  }

  async findByStudent(student: any): Promise<any[]> {
    const sqlMessages = await this.messageRepo.find({
      where: [
        { targetYear: 'All' },
        { targetYear: String(student.year), targetBranch: student.branch }
      ],
      order: { createdAt: 'DESC' }
    });
    if (sqlMessages.length > 0) return sqlMessages;

    if (this.connection.readyState !== 1) return [];
    const query = {
      $or: [
        { target: 'all' },
        { target: 'students' },
        {
          targetBranch: student.branch,
          targetYear: student.year,
          $or: [
            { targetSections: { $size: 0 } },
            { targetSections: student.section }
          ]
        }
      ]
    };
    return this.findActive(query);
  }
}
