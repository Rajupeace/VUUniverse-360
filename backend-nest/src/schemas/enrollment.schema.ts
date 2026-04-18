import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EnrollmentDocument = Enrollment & Document;

@Schema({ timestamps: true, collection: 'enrollments' })
export class Enrollment {
    @Prop({ required: true, index: true })
    studentId: string;

    @Prop({ required: true })
    studentName: string;

    @Prop({ required: true, index: true })
    facultyId: string;

    @Prop({ required: true })
    facultyName: string;

    @Prop({ required: true, index: true })
    subject: string;

    @Prop({ required: true })
    branch: string;

    @Prop({ required: true })
    year: string;

    @Prop({ required: true })
    section: string;

    @Prop()
    semester: string;

    @Prop()
    studentEmail: string;

    @Prop()
    studentPhone: string;

    @Prop()
    facultyEmail: string;

    @Prop()
    facultyPhone: string;

    @Prop({ enum: ['active', 'completed', 'dropped', 'pending'], default: 'active', index: true })
    status: string;

    @Prop({ required: true, index: true })
    academicYear: string;

    @Prop({ default: 0 })
    attendancePercentage: number;

    @Prop({ default: 0 })
    marksPercentage: number;

    @Prop({ default: 0 })
    examsAttempted: number;

    @Prop({ default: Date.now })
    enrolledAt: Date;

    @Prop()
    completedAt: Date;

    @Prop({ default: Date.now })
    lastActivityAt: Date;
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);

EnrollmentSchema.index({ studentId: 1, facultyId: 1, subject: 1 });
EnrollmentSchema.index({ facultyId: 1, academicYear: 1, status: 1 });
EnrollmentSchema.index({ studentId: 1, academicYear: 1, status: 1 });
EnrollmentSchema.index({ year: 1, section: 1, branch: 1 });
