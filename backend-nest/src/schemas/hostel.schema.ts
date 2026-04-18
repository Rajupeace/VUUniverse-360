import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HostelDocument = Hostel & Document;

@Schema({ timestamps: true, collection: 'AdminDashboardDB_Sections_Hostel' })
export class Hostel {
    @Prop({ required: true, index: true })
    rollNumber: string;

    @Prop({ required: true })
    studentName: string;

    @Prop({ required: true })
    hostelName: string;

    @Prop({ required: true })
    roomNumber: string;

    @Prop({ enum: ['AC', 'Non-AC'], default: 'Non-AC' })
    roomType: string;

    @Prop({ enum: ['Single', 'Double', 'Triple', 'Common'], default: 'Double' })
    sharing: string;

    @Prop({ default: Date.now })
    admissionDate: Date;

    @Prop()
    vacatingDate: Date;

    @Prop({ enum: ['In-Hostel', 'Vacated', 'Suspended'], default: 'In-Hostel' })
    status: string;

    @Prop({ default: false })
    feePaid: boolean;

    @Prop()
    emergencyContact: string;
}

export const HostelSchema = SchemaFactory.createForClass(Hostel);

HostelSchema.index({ hostelName: 1, roomNumber: 1 });
HostelSchema.index({ rollNumber: 1 }, { unique: true });
HostelSchema.index({ status: 1 });
HostelSchema.index({ hostelName: 1 });
