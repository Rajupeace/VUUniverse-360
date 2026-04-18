import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Faculty, FacultyDocument } from '../schemas/faculty.schema';
import { Faculty as FacultyEntity } from '../entities/faculty.entity';
import { SseService } from '../sse/sse.service';

@Injectable()
export class FacultyService {
    constructor(
        @InjectModel(Faculty.name) private facultyModel: Model<FacultyDocument>,
        @InjectRepository(FacultyEntity) private facultyRepo: Repository<FacultyEntity>,
        private sseService: SseService,
    ) { }

    async findAll(): Promise<any[]> {
        // SQL first
        const sqlFaculty = await this.facultyRepo.find();
        if (sqlFaculty.length > 0) {
            return sqlFaculty.map(f => ({ ...f, id: f.facultyId, source: 'mysql' }));
        }

        const faculty = await this.facultyModel.find({}).select('-password').sort({ createdAt: -1 }).lean();
        return faculty.map(f => ({ ...f, id: f.facultyId || (f as any)._id.toString(), source: 'mongodb' }));
    }

    async findOne(id: string): Promise<any> {
        // SQL first
        let faculty: any = await this.facultyRepo.findOne({ where: { facultyId: id } });

        if (!faculty) {
            const query = Types.ObjectId.isValid(id) ? { _id: id } : { facultyId: id };
            faculty = await this.facultyModel.findOne(query as any).select('-password').lean();
        }

        if (!faculty) throw new NotFoundException('Faculty not found');
        return faculty;
    }

    async findByRole(role: string) {
        const sqlFaculty = await this.facultyRepo.find({ where: { role } });
        if (sqlFaculty.length > 0) return sqlFaculty;
        return this.facultyModel.find({ role: { $regex: new RegExp(role, 'i') } }).select('-password').lean();
    }

    async create(data: any) {
        let { facultyId, name, facultyName, email, password, department, designation, phone, role, assignments, isTransportUser, isHosteller, address, gender } = data;

        const fid = facultyId || data.id;
        const fname = facultyName || name || data.name;

        if (!fid || !fname || !password) {
            throw new BadRequestException('Please provide required fields: facultyId, name, and password');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // ── Write to MySQL ──
        try {
            const sqlFaculty = this.facultyRepo.create({
                facultyId: fid,
                facultyName: fname,
                password: hashedPassword,
                email: email || `${fid}@example.com`,
                department: department || 'General',
                designation: designation || 'Assistant Professor',
                phone: phone || '',
                role: role || 'Faculty',
            });
            await this.facultyRepo.save(sqlFaculty);
        } catch (e) { console.warn(`MySQL Faculty Create Error: ${e.message}`); }

        // ── Write to MongoDB ──
        const newFaculty = new this.facultyModel({
            facultyId: fid, name: fname, email: email || `${fid}@example.com`, password: hashedPassword,
            department: department || 'General',
            designation: designation || 'Assistant Professor',
            phone: phone || '',
            role: role || 'Faculty',
            assignments: assignments || [],
            createdAt: new Date(),
        });

        const saved = await newFaculty.save();
        this.sseService.broadcast({ resource: 'faculty', action: 'create', data: { id: saved.facultyId } });
        return saved;
    }

    async update(id: string, updates: any) {
        if (updates.password && updates.password.trim() !== '') {
            updates.password = await bcrypt.hash(updates.password, 10);
        } else {
            delete updates.password;
        }

        // ── Update MySQL ──
        try {
            await this.facultyRepo.update({ facultyId: id }, updates);
        } catch (e) { console.warn(`MySQL Faculty Update Error: ${e.message}`); }

        // ── Update MongoDB ──
        const query = Types.ObjectId.isValid(id) ? { _id: id } : { facultyId: id };
        const updated = await this.facultyModel.findOneAndUpdate(
            query as any,
            { $set: { ...updates, updatedAt: new Date() } },
            { new: true },
        ).select('-password');

        if (!updated) throw new NotFoundException('Faculty not found');
        this.sseService.broadcast({ resource: 'faculty', action: 'update', data: { id } });
        return updated;
    }

    async delete(id: string) {
        // Delete SQL
        await this.facultyRepo.delete({ facultyId: id });

        // Delete Mongo
        const query = Types.ObjectId.isValid(id) ? { _id: id } : { facultyId: id };
        const deleted = await this.facultyModel.findOneAndDelete(query as any);
        if (!deleted) throw new NotFoundException('Faculty not found');
        this.sseService.broadcast({ resource: 'faculty', action: 'delete', data: { id } });
        return { message: 'Faculty deleted successfully' };
    }

    async assignRole(id: string, role: string) {
        if (!role) throw new BadRequestException('Role is required');

        // Update SQL
        try { await this.facultyRepo.update({ facultyId: id }, { role }); } catch (e) { }

        const query = Types.ObjectId.isValid(id) ? { _id: id } : { facultyId: id };
        const updated = await this.facultyModel.findOneAndUpdate(
            query as any,
            { $set: { role, updatedAt: new Date() } },
            { new: true },
        ).select('-password');

        if (!updated) throw new NotFoundException('Faculty not found');
        this.sseService.broadcast({ resource: 'faculty', action: 'update', data: { id, role } });
        return { success: true, message: `Role updated to "${role}"`, faculty: updated };
    }

    async getTeachingFaculty(year: string, section: string, branch: string): Promise<any[]> {
        // Aggregation query still uses Mongo due to complexity of assignments mapping in SQL for now
        const faculty = await this.facultyModel.find({
            assignments: {
                $elemMatch: {
                    year: { $in: [year, String(year), Number(year)] },
                    section: { $regex: new RegExp(`^${section}$`, 'i') },
                    branch: { $regex: new RegExp(`^${branch}$`, 'i') },
                },
            },
        }).select('-password').lean();

        return faculty.map(f => ({
            ...f,
            id: f.facultyId || (f as any)._id?.toString(),
            _id: (f as any)._id?.toString(),
            source: 'mongodb',
        }));
    }

    async bulkCreate(faculties: any[]) {
        const results: any = { success: [], errors: [], total: faculties.length };
        for (let i = 0; i < faculties.length; i++) {
            try {
                const res = await this.create(faculties[i]);
                results.success.push({ row: i + 1, id: res.facultyId });
            } catch (error) {
                results.errors.push({ row: i + 1, error: error.message });
            }
        }
        return results;
    }
}
