import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FastDocument = Fast & Document;

@Schema({ timestamps: true, collection: 'AdminDashboardDB_Sections_Fast' })
export class Fast {
    @Prop({ required: true })
    title: string;

    @Prop()
    description: string;

    @Prop({ required: true })
    facultyId: string;

    @Prop({ required: true })
    subject: string;

    @Prop({ required: true })
    branch: string;

    @Prop({ required: true })
    year: string;

    @Prop({ required: true })
    section: string;

    @Prop({ required: true })
    dueDate: Date;

    @Prop({ default: true })
    isActive: boolean;
}

export const FastSchema = SchemaFactory.createForClass(Fast);

FastSchema.index({ facultyId: 1, subject: 1 });
FastSchema.index({ branch: 1, year: 1, section: 1 });
