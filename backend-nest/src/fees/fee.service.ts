import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fee, FeeDocument } from '../schemas/fee.schema';
import { Fee as FeeEntity } from '../entities/fee.entity';
import { SseService } from '../sse/sse.service';

@Injectable()
export class FeeService {
  constructor(
    @InjectModel(Fee.name) private feeModel: Model<FeeDocument>,
    @InjectRepository(FeeEntity) private feeRepo: Repository<FeeEntity>,
    @InjectConnection() private readonly connection: Connection,
    private sseService: SseService,
  ) { }

  async findAll(query: any): Promise<any[]> {
    // Try SQL first
    const sqlFees = await this.feeRepo.find({ where: query, order: { dueDate: 'ASC' } });
    if (sqlFees.length > 0) {
      return sqlFees.map(f => ({ ...f, id: f.id, source: 'mysql' }));
    }

    if (this.connection.readyState !== 1) return [];
    return this.feeModel.find(query).sort({ dueDate: 1 }).lean();
  }

  async findOne(id: string): Promise<any> {
    // SQL first
    if (!isNaN(Number(id))) {
      const sqlFee = await this.feeRepo.findOneBy({ id: Number(id) });
      if (sqlFee) return { ...sqlFee, source: 'mysql' };
    }

    if (this.connection.readyState === 1) {
      const fee = await this.feeModel.findById(id).lean();
      if (fee) return { ...fee, source: 'mongodb' };
    }

    throw new NotFoundException('Fee record not found');
  }

  async findByStudent(rollNumber: string): Promise<any[]> {
    const sqlFees = await this.feeRepo.find({ where: { studentId: rollNumber }, order: { dueDate: 'ASC' } });
    if (sqlFees.length > 0) return sqlFees;

    if (this.connection.readyState !== 1) return [];
    return this.feeModel.find({ rollNumber }).sort({ dueDate: 1 }).lean();
  }

  async create(data: any): Promise<any> {
    // Write to MySQL
    try {
      const sqlFee = this.feeRepo.create({
        studentId: data.rollNumber || data.studentId,
        studentName: data.studentName,
        year: String(data.year || '1'),
        semester: String(data.semester || '1'),
        feeType: data.feeType || 'tuition',
        amount: Number(data.totalAmount || data.amount || 0),
        paid: Number(data.paidAmount || data.paid || 0),
        balance: Number(data.totalAmount || data.amount || 0) - Number(data.paidAmount || data.paid || 0),
        status: data.status || 'pending',
        dueDate: data.dueDate ? String(data.dueDate) : null,
      });
      await this.feeRepo.save(sqlFee);
    } catch (e) {
      console.warn(`MySQL Fee Create Error: ${e.message}`);
    }

    // Write to MongoDB
    const fee = new this.feeModel(data);
    const saved = await fee.save();
    this.sseService.broadcast({ resource: 'fees', action: 'create', data: saved });
    return saved;
  }

  async addTransaction(id: string, transaction: any): Promise<any> {
    // 1. Try MySQL
    if (!isNaN(Number(id))) {
      const sqlFee = await this.feeRepo.findOneBy({ id: Number(id) });
      if (sqlFee) {
        sqlFee.paid += Number(transaction.amount);
        sqlFee.balance = sqlFee.amount - sqlFee.paid;
        sqlFee.transactionId = transaction.transactionId || transaction.id;
        sqlFee.paidDate = new Date().toISOString();

        if (sqlFee.paid >= sqlFee.amount) {
          sqlFee.status = 'paid';
        } else if (sqlFee.paid > 0) {
          sqlFee.status = 'partial';
        }
        await this.feeRepo.save(sqlFee);
      }
    }

    // 2. Try MongoDB
    if (this.connection.readyState === 1) {
      const fee = await this.feeModel.findById(id);
      if (fee) {
        if (!fee.transactions) fee.transactions = [];
        fee.transactions.push(transaction);
        fee.paidAmount = (fee.paidAmount || 0) + Number(transaction.amount);

        if (fee.paidAmount >= fee.totalAmount) {
          fee.status = 'Paid';
        } else if (fee.paidAmount > 0) {
          fee.status = 'Partial';
        }
        const saved = await fee.save();
        this.sseService.broadcast({ resource: 'fees', action: 'transaction', data: { id, amount: transaction.amount } });
        return saved;
      }
    }

    return { success: true };
  }

  async getStats(): Promise<any> {
    // SQL aggregation
    const sqlStats = await this.feeRepo
      .createQueryBuilder('fee')
      .select('status', '_id')
      .addSelect('SUM(amount)', 'total')
      .addSelect('SUM(paid)', 'collected')
      .addSelect('COUNT(*)', 'count')
      .groupBy('status')
      .getRawMany();

    if (sqlStats.length > 0) return sqlStats;

    if (this.connection.readyState !== 1) return [];
    return this.feeModel.aggregate([
      { $group: { _id: '$status', total: { $sum: '$totalAmount' }, collected: { $sum: '$paidAmount' }, count: { $sum: 1 } } }
    ]);
  }
}
