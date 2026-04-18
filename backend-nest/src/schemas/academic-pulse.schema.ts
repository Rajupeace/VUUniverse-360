import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AcademicPulseDocument = AcademicPulse & Document;

@Schema({ timestamps: true, collection: 'AdminDashboardDB_Sections_AcademicPulse' })
export class AcademicPulse {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    content: string;

    @Prop({ enum: ['News', 'Exam', 'Placement', 'Holiday'], default: 'News' })
    category: string;

    @Prop({ default: Date.now })
    publishDate: Date;

    @Prop({ default: true })
    active: boolean;
}

export const AcademicPulseSchema = SchemaFactory.createForClass(AcademicPulse);

AcademicPulseSchema.index({ publishDate: -1, active: 1 });
