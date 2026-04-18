import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill, SkillDocument } from '../schemas/skill.schema';
import { Skill as SkillEntity } from '../entities/skill.entity';

@Injectable()
export class SkillBoostService {
  constructor(
    @InjectModel(Skill.name) private skillModel: Model<SkillDocument>,
    @InjectRepository(SkillEntity) private skillRepo: Repository<SkillEntity>,
    @InjectConnection() private readonly connection: Connection,
  ) { }

  async findAll(query: any): Promise<any[]> {
    const sqlSkills = await this.skillRepo.find({ order: { rating: 'DESC' } });
    if (sqlSkills.length > 0) return sqlSkills.map(s => ({ ...s, id: s.id.toString(), source: 'mysql' }));

    if (this.connection.readyState !== 1) return [];
    return this.skillModel.find({ active: true, ...query }).sort({ rating: -1 }).lean();
  }

  async findOne(id: string): Promise<any> {
    if (!isNaN(Number(id))) {
      const sqlS = await this.skillRepo.findOneBy({ id: Number(id) });
      if (sqlS) return { ...sqlS, source: 'mysql' };
    }

    if (this.connection.readyState === 1) {
      const entry = await this.skillModel.findById(id).lean();
      if (entry) return { ...entry, source: 'mongodb' };
    }

    throw new NotFoundException('Skill course not found');
  }

  async create(data: any): Promise<any> {
    // MySQL
    try {
      const sqlSkill = this.skillRepo.create({
        name: data.name || data.title,
        category: data.category || 'General',
        instructor: data.instructor || data.facultyName,
        rating: Number(data.rating || 0),
        duration: data.duration,
        enrolledCount: Number(data.enrolledCount || 0),
        description: data.description,
      });
      await this.skillRepo.save(sqlSkill);
    } catch (e) { console.warn(`MySQL Skill Create Error: ${e.message}`); }

    // MongoDB
    const entry = new this.skillModel(data);
    return entry.save();
  }

  async update(id: string, data: any): Promise<any> {
    // 1. MySQL
    if (!isNaN(Number(id))) {
      await this.skillRepo.update(Number(id), data);
    }

    // 2. MongoDB
    if (this.connection.readyState === 1) {
      const result = await this.skillModel.findByIdAndUpdate(id, { $set: data }, { new: true });
      if (result) return result;
    }

    if (!isNaN(Number(id))) {
      return this.skillRepo.findOneBy({ id: Number(id) });
    }

    throw new NotFoundException('Skill course not found');
  }

  async delete(id: string): Promise<any> {
    let deleted = false;
    if (!isNaN(Number(id))) {
      const res = await this.skillRepo.delete(Number(id));
      if (res.affected > 0) deleted = true;
    }
    if (this.connection.readyState === 1) {
      const res = await this.skillModel.findByIdAndDelete(id);
      if (res) deleted = true;
    }
    if (!deleted) throw new NotFoundException('Skill course not found');
    return { success: true };
  }

  async enroll(id: string): Promise<any> {
    // 1. MySQL
    if (!isNaN(Number(id))) {
      await this.skillRepo.increment({ id: Number(id) }, 'enrolledCount', 1);
    }

    // 2. MongoDB
    if (this.connection.readyState === 1) {
      const result = await this.skillModel.findByIdAndUpdate(id, { $inc: { enrolledCount: 1 } }, { new: true });
      if (result) return result;
    }

    if (!isNaN(Number(id))) {
      return this.skillRepo.findOneBy({ id: Number(id) });
    }

    throw new NotFoundException('Skill course not found');
  }
}
