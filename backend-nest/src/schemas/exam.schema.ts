import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ExamDocument = Exam & Document;

@Schema()
class Question {
    @Prop({ required: true })
    questionText: string;

    @Prop({ type: [String], required: true })
    options: string[];

    @Prop({ required: true })
    correctOptionIndex: number;

    @Prop({ default: 1 })
    marks: number;
}

const QuestionSchema = SchemaFactory.createForClass(Question);

@Schema({ timestamps: true })
export class Exam {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    subject: string;

    @Prop({ required: true })
    topic: string;

    @Prop({ required: true })
    week: string;

    @Prop({ required: true })
    branch: string;

    @Prop({ required: true })
    year: string;

    @Prop()
    section: string;

    @Prop({ default: 20 })
    durationMinutes: number;

    @Prop({ default: 10 })
    totalMarks: number;

    @Prop({ type: [QuestionSchema] })
    questions: Question[];

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Faculty' })
    createdBy: MongooseSchema.Types.ObjectId;

    @Prop({ default: true })
    isActive: boolean;
}

export const ExamSchema = SchemaFactory.createForClass(Exam);
