import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StudentProgressDocument = StudentProgress & Document;

@Schema({ timestamps: true, collection: 'AdminDashboardDB_Sections_StudentProgress' })
export class StudentProgress {
    @Prop({ required: true, index: true })
    rollNumber: string;

    @Prop({ default: 0 })
    attendancePercent: number;

    @Prop({ default: 0 })
    averageMarks: number;

    @Prop({ default: 0 })
    completedCourses: number;

    @Prop({ default: 0 })
    totalCredits: number;

    @Prop({ default: 'Average' })
    standing: string; // e.g., 'Excellent', 'Good'

    @Prop({
        type: [{
            month: String,
            attendance: Number,
            performance: Number
        }]
    })
    monthlyTrends: any[];

    @Prop({ type: Object })
    subjectWise: any;
}

export const StudentProgressSchema = SchemaFactory.createForClass(StudentProgress);

StudentProgressSchema.index({ rollNumber: 1 }, { unique: true });
