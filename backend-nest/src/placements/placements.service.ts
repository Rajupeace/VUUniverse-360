import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Placement, PlacementDocument } from '../schemas/placement.schema';
import { Placement as PlacementEntity } from '../entities/placement.entity';

@Injectable()
export class PlacementsService {
  constructor(
    @InjectModel(Placement.name) private placementModel: Model<PlacementDocument>,
    @InjectRepository(PlacementEntity) private placementRepo: Repository<PlacementEntity>,
    @InjectConnection() private readonly connection: Connection,
  ) { }

  async findAll(query: any): Promise<any[]> {
    const sqlPlacements = await this.placementRepo.find({ order: { driveDate: 'DESC' } });
    if (sqlPlacements.length > 0) return sqlPlacements.map(p => ({ ...p, id: p.id.toString(), source: 'mysql' }));

    if (this.connection.readyState !== 1) return [];
    return this.placementModel.find(query).sort({ placementDate: -1 }).lean();
  }

  async findOne(id: string): Promise<any> {
    if (!isNaN(Number(id))) {
      const sqlP = await this.placementRepo.findOneBy({ id: Number(id) });
      if (sqlP) return { ...sqlP, source: 'mysql' };
    }

    if (this.connection.readyState === 1) {
      const entry = await this.placementModel.findById(id).lean();
      if (entry) return { ...entry, source: 'mongodb' };
    }

    throw new NotFoundException('Placement record not found');
  }

  async findByStudent(rollNumber: string): Promise<any[]> {
    const sqlP = await this.placementRepo.find({ where: { studentId: rollNumber }, order: { driveDate: 'DESC' } });
    if (sqlP.length > 0) return sqlP;

    if (this.connection.readyState !== 1) return [];
    return this.placementModel.find({ rollNumber }).sort({ placementDate: -1 }).lean();
  }

  async create(data: any): Promise<any> {
    // MySQL
    try {
      const sqlPlace = this.placementRepo.create({
        studentId: data.rollNumber || data.studentId,
        studentName: data.studentName,
        companyName: data.company || data.companyName,
        jobRole: data.role || data.jobRole,
        salaryPackage: Number(data.package || data.salaryPackage || 0),
        status: data.status || 'Placed',
        driveDate: data.placementDate ? String(data.placementDate) : new Date().toISOString(),
      });
      await this.placementRepo.save(sqlPlace);
    } catch (e) { console.warn(`MySQL Placement Create Error: ${e.message}`); }

    // MongoDB
    const entry = new this.placementModel(data);
    return entry.save();
  }

  async update(id: string, data: any): Promise<any> {
    // 1. MySQL
    if (!isNaN(Number(id))) {
      const sqlData = { ...data };
      if (data.role) sqlData.jobRole = data.role;
      if (data.package) sqlData.salaryPackage = data.package;
      await this.placementRepo.update(Number(id), sqlData);
    }

    // 2. MongoDB
    if (this.connection.readyState === 1) {
      const result = await this.placementModel.findByIdAndUpdate(id, { $set: data }, { new: true });
      if (result) return result;
    }

    if (!isNaN(Number(id))) {
      return this.placementRepo.findOneBy({ id: Number(id) });
    }

    throw new NotFoundException('Placement record not found');
  }

  async delete(id: string): Promise<any> {
    let deleted = false;
    if (!isNaN(Number(id))) {
      const res = await this.placementRepo.delete(Number(id));
      if (res.affected > 0) deleted = true;
    }
    if (this.connection.readyState === 1) {
      const res = await this.placementModel.findByIdAndDelete(id);
      if (res) deleted = true;
    }
    if (!deleted) throw new NotFoundException('Placement record not found');
    return { success: true };
  }

  async getStats(): Promise<any> {
    const sqlStats = await this.placementRepo
      .createQueryBuilder('p')
      .select('AVG(p.salaryPackage)', 'avgPackage')
      .addSelect('MAX(p.salaryPackage)', 'maxPackage')
      .addSelect('COUNT(*)', 'count')
      .getRawOne();

    if (sqlStats && Number(sqlStats.count) > 0) {
      return [{
        avgPackage: Number(sqlStats.avgPackage || 0),
        maxPackage: Number(sqlStats.maxPackage || 0),
        count: Number(sqlStats.count)
      }];
    }

    if (this.connection.readyState !== 1) return [];
    return this.placementModel.aggregate([
      { $group: { _id: null, avgPackage: { $avg: '$package' }, maxPackage: { $max: '$package' }, count: { $sum: 1 } } }
    ]);
  }
}
