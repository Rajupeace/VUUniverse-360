import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MarkDocument = Mark & Document;

@Schema({ timestamps: true })
export class Mark {
    @Prop({ required: true }) studentId: string;
    @Prop({ required: true }) subject: string;
    @Prop({
        required: true,
        enum: ['cla1', 'cla2', 'cla3', 'cla4', 'cla5',
            'm1pre', 'm1t1', 'm1t2', 'm1t3', 'm1t4',
            'm2pre', 'm2t1', 'm2t2', 'm2t3', 'm2t4']
    }) assessmentType: string;
    @Prop({ required: true, min: 0 }) marks: number;
    @Prop({ required: true }) maxMarks: number;
    @Prop() updatedBy: string;
    @Prop({ default: Date.now }) updatedAt: Date;
}

export const MarkSchema = SchemaFactory.createForClass(Mark);
MarkSchema.index({ studentId: 1, subject: 1, assessmentType: 1 }, { unique: true });
