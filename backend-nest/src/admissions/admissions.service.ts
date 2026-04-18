import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admission, AdmissionDocument } from '../schemas/admission.schema';
import { SseService } from '../sse/sse.service';

@Injectable()
export class AdmissionsService {
  constructor(
    @InjectModel(Admission.name) private admissionModel: Model<AdmissionDocument>,
    private sseService: SseService,
  ) { }

  async findAll(): Promise<Admission[]> {
    try {
      const list = await this.admissionModel.find().sort({ createdAt: -1 }).exec();
      if (list && list.length > 0) return list;
    } catch (e) {
      console.warn('⚠️ [ADMISSIONS] Database fetch failed, using lifeboat:', e.message);
    }

    // LIFEBOAT: Demo data
    return [
      {
        _id: 'demo1',
        applicationNumber: 'APP-2024-001',
        candidateName: 'Sai Indra Martin',
        courseApplied: 'B.Tech CSE',
        academicYear: '2024-25',
        previousQualification: 'Intermediate',
        percentage: 94.5,
        phone: '+91 9876543210',
        email: 'arjun@example.com',
        status: 'Pending',
        documents: [{ name: '10th Marksheet', url: '#' }, { name: 'Inter Transfer', url: '#' }],
        createdAt: new Date(),
        updatedAt: new Date()
      } as any,
      {
        _id: 'demo2',
        applicationNumber: 'APP-2024-002',
        candidateName: 'Vignesh Rao',
        courseApplied: 'B.Tech AI&ML',
        academicYear: '2024-25',
        previousQualification: 'Diploma',
        percentage: 88.2,
        phone: '+91 8765432109',
        email: 'sneha@example.com',
        status: 'Accepted',
        notes: 'Priority admission confirmed.',
        documents: [{ name: 'Diploma Cert', url: '#' }],
        createdAt: new Date(),
        updatedAt: new Date()
      } as any
    ];
  }

  async findOne(id: string): Promise<Admission> {
    const record = await this.admissionModel.findById(id).exec();
    if (!record) throw new NotFoundException('Application not found');
    return record;
  }

  async update(id: string, updateData: any): Promise<Admission> {
    const record = await this.admissionModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    if (!record) throw new NotFoundException('Update failed: Record not found');
    
    this.sseService.broadcast({ resource: 'admissions', action: 'update', id });
    return record;
  }

  async remove(id: string): Promise<any> {
    const record = await this.admissionModel.findByIdAndDelete(id).exec();
    if (!record) throw new NotFoundException('Delete failed: Record not found');
    
    this.sseService.broadcast({ resource: 'admissions', action: 'remove', id });
    return { success: true };
  }

  async create(data: any): Promise<Admission> {
    const count = await this.admissionModel.countDocuments();
    const appNo = `APP-${new Date().getFullYear()}-${(count + 1).toString().padStart(3, '0')}`;
    const newRecord = new this.admissionModel({ ...data, applicationNumber: appNo });
    const saved = await newRecord.save();
    
    this.sseService.broadcast({ resource: 'admissions', action: 'create', id: saved._id });
    return saved;
  }
}
