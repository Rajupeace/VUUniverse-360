import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Library, LibraryDocument } from '../schemas/library.schema';
import { Library as LibraryEntity } from '../entities/library.entity';

@Injectable()
export class LibraryService {
  constructor(
    @InjectModel(Library.name) private libraryModel: Model<LibraryDocument>,
    @InjectRepository(LibraryEntity) private libraryRepo: Repository<LibraryEntity>,
    @InjectConnection() private readonly connection: Connection,
  ) { }

  async findAll(query: any): Promise<any[]> {
    const sqlLibraries = await this.libraryRepo.find({ order: { issueDate: 'DESC' } });
    if (sqlLibraries.length > 0) return sqlLibraries.map(l => ({ ...l, id: l.id.toString(), source: 'mysql' }));

    if (this.connection.readyState !== 1) return [];
    return this.libraryModel.find(query).sort({ issueDate: -1 }).lean();
  }

  async findOne(id: string): Promise<any> {
    if (!isNaN(Number(id))) {
      const sqlL = await this.libraryRepo.findOneBy({ id: Number(id) });
      if (sqlL) return { ...sqlL, source: 'mysql' };
    }

    if (this.connection.readyState === 1) {
      const entry = await this.libraryModel.findById(id).lean();
      if (entry) return { ...entry, source: 'mongodb' };
    }

    throw new NotFoundException('Library record not found');
  }

  async findByStudent(rollNumber: string): Promise<any[]> {
    const sqlL = await this.libraryRepo.find({ where: { studentId: rollNumber }, order: { issueDate: 'DESC' } });
    if (sqlL.length > 0) return sqlL;

    if (this.connection.readyState !== 1) return [];
    return this.libraryModel.find({ rollNumber }).sort({ issueDate: -1 }).lean();
  }

  async issueBook(data: any): Promise<any> {
    // MySQL
    try {
      const sqlLib = this.libraryRepo.create({
        studentId: data.rollNumber || data.studentId,
        studentName: data.studentName,
        bookTitle: data.bookTitle,
        isbn: data.isbn,
        issueDate: data.issueDate ? String(data.issueDate) : new Date().toISOString(),
        dueDate: data.dueDate ? String(data.dueDate) : new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
        status: 'Issued',
      });
      await this.libraryRepo.save(sqlLib);
    } catch (e) { console.warn(`MySQL Library Issue Error: ${e.message}`); }

    // MongoDB
    const entry = new this.libraryModel(data);
    return entry.save();
  }

  async returnBook(id: string): Promise<any> {
    // 1. MySQL
    if (!isNaN(Number(id))) {
      const sqlL = await this.libraryRepo.findOneBy({ id: Number(id) });
      if (sqlL) {
        sqlL.status = 'Returned';
        sqlL.returnDate = new Date().toISOString();
        // Fine logic if needed
        await this.libraryRepo.save(sqlL);
      }
    }

    // 2. MongoDB
    if (this.connection.readyState === 1) {
      const entry = await this.libraryModel.findById(id);
      if (entry) {
        entry.status = 'Returned';
        entry.returnDate = new Date();
        const diffDays = Math.ceil((entry.returnDate.getTime() - entry.dueDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays > 0) entry.fine = diffDays * 5;
        return entry.save();
      }
    }

    return { success: true };
  }

  async getOverdue(): Promise<any[]> {
    const sqlOverdue = await this.libraryRepo.find({
      where: { status: 'Issued', dueDate: LessThan(new Date().toISOString()) },
      order: { dueDate: 'ASC' }
    });
    if (sqlOverdue.length > 0) return sqlOverdue;

    if (this.connection.readyState !== 1) return [];
    return this.libraryModel.find({
      status: 'Issued',
      dueDate: { $lt: new Date() }
    }).sort({ dueDate: 1 }).lean();
  }
}
