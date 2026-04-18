import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdmissionDocument = Admission & Document;

@Schema({ collection: 'admissions', timestamps: true })
export class Admission {
    @Prop({ required: true, unique: true }) applicationNumber: string;
    @Prop({ required: true }) candidateName: string;
    @Prop({ required: true }) courseApplied: string;
    @Prop({ required: true }) academicYear: string;
    @Prop({ required: true }) previousQualification: string;
    @Prop({ required: true }) percentage: number;
    @Prop({ required: true }) phone: string;
    @Prop({ required: true }) email: string;
    @Prop({ enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' }) status: string;
    @Prop() notes: string;
    @Prop([{ name: String, url: String }]) documents: { name: string, url: string }[];
}

export const AdmissionSchema = SchemaFactory.createForClass(Admission);
