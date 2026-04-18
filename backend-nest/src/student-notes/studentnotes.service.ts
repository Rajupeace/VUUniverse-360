import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StudentNotes, StudentNotesDocument } from '../schemas/student-notes.schema';
import { SseService } from '../sse/sse.service';

@Injectable()
export class StudentNotesService {
  constructor(
    @InjectModel(StudentNotes.name) private notesModel: Model<StudentNotesDocument>,
    private sseService: SseService,
  ) {}

  async findAll(query: any): Promise<any[]> {
    const filter: any = {};
    if (query.sid) filter.sid = query.sid;
    if (query.courseId) filter.courseId = query.courseId;
    return this.notesModel.find(filter).sort({ updatedAt: -1 }).lean();
  }

  async findOne(id: string): Promise<any> {
    return this.notesModel.findById(id).lean();
  }

  async create(data: any): Promise<any> {
    const note = new this.notesModel(data);
    const saved = await note.save();
    this.sseService.broadcast({ resource: 'notes', action: 'create', data: { sid: saved.sid } });
    return saved;
  }

  async update(id: string, data: any): Promise<any> {
    const updated = await this.notesModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
    if (updated) {
        this.sseService.broadcast({ resource: 'notes', action: 'update', data: { sid: (updated as any).sid } });
    }
    return updated;
  }

  async remove(id: string): Promise<any> {
    const deleted = await this.notesModel.findByIdAndDelete(id).lean();
    if (deleted) {
        this.sseService.broadcast({ resource: 'notes', action: 'delete', data: { sid: (deleted as any).sid } });
    }
    return { success: true };
  }
}
