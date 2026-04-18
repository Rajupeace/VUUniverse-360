import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentNotes, StudentNotesDocument } from '../schemas/student-notes.schema';
import { StudentNote as NoteEntity } from '../entities/student-note.entity';

@Injectable()
export class StudentNotesService {
    constructor(
        @InjectModel(StudentNotes.name) private notesModel: Model<StudentNotesDocument>,
        @InjectRepository(NoteEntity) private noteRepo: Repository<NoteEntity>,
        @InjectConnection() private readonly connection: Connection,
    ) { }

    async findAll(rollNumber: string): Promise<any[]> {
        const sqlNotes = await this.noteRepo.find({ where: { studentId: rollNumber }, order: { updatedAt: 'DESC' } });
        if (sqlNotes.length > 0) return sqlNotes.map(n => ({ ...n, id: n.id.toString(), source: 'mysql' }));

        if (this.connection.readyState !== 1) return [];
        return this.notesModel.find({ rollNumber }).sort({ updatedAt: -1 }).lean();
    }

    async findOne(id: string): Promise<any> {
        if (!isNaN(Number(id))) {
            const sqlN = await this.noteRepo.findOneBy({ id: Number(id) });
            if (sqlN) return { ...sqlN, source: 'mysql' };
        }

        if (this.connection.readyState === 1) {
            const entry = await this.notesModel.findById(id).lean();
            if (entry) return { ...entry, source: 'mongodb' };
        }

        throw new NotFoundException('Note not found');
    }

    async create(data: any): Promise<any> {
        // MySQL
        try {
            const sqlNote = this.noteRepo.create({
                studentId: data.rollNumber || data.studentId,
                title: data.title,
                content: data.content,
                subject: data.subject,
                tags: data.tags ? (Array.isArray(data.tags) ? data.tags.join(',') : String(data.tags)) : '',
            });
            await this.noteRepo.save(sqlNote);
        } catch (e) { console.warn(`MySQL Note Create Error: ${e.message}`); }

        // MongoDB
        const entry = new this.notesModel(data);
        return entry.save();
    }

    async update(id: string, data: any): Promise<any> {
        // 1. MySQL
        if (!isNaN(Number(id))) {
            await this.noteRepo.update(Number(id), data);
        }

        // 2. MongoDB
        if (this.connection.readyState === 1) {
            const result = await this.notesModel.findByIdAndUpdate(id, { $set: data }, { new: true });
            if (result) return result;
        }

        if (!isNaN(Number(id))) {
            return this.noteRepo.findOneBy({ id: Number(id) });
        }

        throw new NotFoundException('Note not found');
    }

    async delete(id: string): Promise<any> {
        let deleted = false;
        if (!isNaN(Number(id))) {
            const res = await this.noteRepo.delete(Number(id));
            if (res.affected > 0) deleted = true;
        }
        if (this.connection.readyState === 1) {
            const res = await this.notesModel.findByIdAndDelete(id);
            if (res) deleted = true;
        }
        if (!deleted) throw new NotFoundException('Note not found');
        return { success: true };
    }
}
