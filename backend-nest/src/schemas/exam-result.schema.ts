import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExamResultDocument = ExamResult & Document;

@Schema({ timestamps: true, collection: 'StudentDashboardDB_Sections_Exams' })
export class ExamResult {
    @Prop({ required: true })
    examTitle: string;

    @Prop({ default: 'Internal' })
    examType: string;

    @Prop({ default: Date.now })
    date: Date;

    @Prop()
    year: string;

    @Prop()
    semester: string;

    @Prop()
    branch: string;

    @Prop()
    subject: string;

    @Prop({ required: true })
    studentId: string;

    @Prop()
    studentName: string;

    @Prop({ required: true })
    marksObtained: number;

    @Prop({ required: true })
    maxMarks: number;

    @Prop()
    grade: string;

    @Prop()
    summary: string;
}

export const ExamResultSchema = SchemaFactory.createForClass(ExamResult);
