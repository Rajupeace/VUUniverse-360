import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AttendanceDocument = Attendance & Document;

@Schema({ collection: 'attendances' })
export class Attendance {
    @Prop({ required: true }) date: string;
    @Prop({ required: true }) studentId: string;
    @Prop() studentName: string;
    @Prop({ required: true }) subject: string;
    @Prop({ required: true }) year: string;
    @Prop({ required: true }) branch: string;
    @Prop({ required: true }) section: string;
    @Prop() hour: number;
    @Prop({ enum: ['Present', 'Absent', 'Leave', 'Late'], default: 'Present', required: true }) status: string;
    @Prop({ required: true }) facultyId: string;
    @Prop() facultyName: string;
    @Prop() topic: string;
    @Prop() remarks: string;
    @Prop({ default: Date.now }) markedAt: Date;
    @Prop({ default: Date.now }) createdAt: Date;
    @Prop({ default: Date.now }) updatedAt: Date;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
AttendanceSchema.index({ date: 1, subject: 1, section: 1, branch: 1, year: 1 });
AttendanceSchema.index({ studentId: 1, date: 1 });
AttendanceSchema.index({ subject: 1, date: 1 });
AttendanceSchema.pre('save', function (next) {
    (this as any).updatedAt = new Date();
    next();
});
