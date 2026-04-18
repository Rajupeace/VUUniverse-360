import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentProgress, StudentProgressDocument } from '../schemas/student-progress.schema';
import { StudentProgress as ProgressEntity } from '../entities/student-progress.entity';

@Injectable()
export class StudentProgressService {
    constructor(
        @InjectModel(StudentProgress.name) private progressModel: Model<StudentProgressDocument>,
        @InjectRepository(ProgressEntity) private progressRepo: Repository<ProgressEntity>,
        @InjectConnection() private readonly connection: Connection,
    ) { }

    async findByStudent(rollNumber: string): Promise<any> {
        const sqlProgress = await this.progressRepo.findOneBy({ studentId: rollNumber });
        if (sqlProgress) return { ...sqlProgress, source: 'mysql' };

        if (this.connection.readyState === 1) {
            let entry = await this.progressModel.findOne({ rollNumber }).lean();
            if (!entry) {
                entry = await this.progressModel.create({ rollNumber });
            }
            return { ...entry, source: 'mongodb' };
        }

        return { rollNumber, stats: {}, source: 'fallback' };
    }

    async updateProgress(rollNumber: string, data: any): Promise<any> {
        // MySQL Upsert
        try {
            let sqlProgress = await this.progressRepo.findOneBy({ studentId: rollNumber });
            if (!sqlProgress) {
                sqlProgress = this.progressRepo.create({
                    studentId: rollNumber,
                    cgpa: data.cgpa,
                    attendancePercentage: data.attendancePercentage,
                    semesterStanding: data.semesterStanding,
                    subjectWise: data.subjectWise,
                    careerReadyScore: data.careerReadyScore,
                    streak: data.streak,
                    aiUsageCount: data.aiUsageCount,
                    tasksCompleted: data.tasksCompleted
                });
            } else {
                if (data.cgpa !== undefined) sqlProgress.cgpa = data.cgpa;
                if (data.attendancePercentage !== undefined) sqlProgress.attendancePercentage = data.attendancePercentage;
                if (data.semesterStanding !== undefined) sqlProgress.semesterStanding = data.semesterStanding;
                if (data.subjectWise !== undefined) sqlProgress.subjectWise = data.subjectWise;
                if (data.careerReadyScore !== undefined) sqlProgress.careerReadyScore = data.careerReadyScore;
                if (data.streak !== undefined) sqlProgress.streak = data.streak;
                await this.progressRepo.save(sqlProgress);
            }
        } catch (e) {
            console.warn(`MySQL Progress Update Error: ${e.message}`);
        }

        // MongoDB
        const result = await this.progressModel.findOneAndUpdate(
            { rollNumber },
            { $set: data },
            { new: true, upsert: true }
        );
        return result;
    }

    async pushMonthlyTrend(rollNumber: string, trend: any): Promise<any> {
        // MySQL
        try {
            const sqlProgress = await this.progressRepo.findOneBy({ studentId: rollNumber });
            if (sqlProgress) {
                const trends = JSON.parse(JSON.stringify(sqlProgress.semesterTrend || []));
                trends.push(trend);
                sqlProgress.semesterTrend = trends;
                await this.progressRepo.save(sqlProgress);
            }
        } catch (e) { console.warn(`MySQL SemesterTrend Push Error: ${e.message}`); }

        // MongoDB
        return this.progressModel.findOneAndUpdate(
            { rollNumber },
            { $push: { monthlyTrends: trend } },
            { new: true }
        );
    }
}
