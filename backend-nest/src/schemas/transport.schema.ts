import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TransportDocument = Transport & Document;

@Schema({ timestamps: true, collection: 'AdminDashboardDB_Sections_Transport' })
export class Transport {
    @Prop({ required: true, index: true })
    rollNumber: string;

    @Prop({ required: true })
    studentName: string;

    @Prop({ required: true })
    busNumber: string;

    @Prop({ required: true })
    route: string;

    @Prop({ required: true })
    pickupPoint: string;

    @Prop()
    pickupTime: string;

    @Prop({ enum: ['Regular', 'One-way'], default: 'Regular' })
    type: string;

    @Prop({ enum: ['Active', 'Suspended', 'Unassigned'], default: 'Active' })
    status: string;

    @Prop({ default: false })
    feePaid: boolean;

    @Prop()
    driverName: string;

    @Prop()
    driverContact: string;
}

export const TransportSchema = SchemaFactory.createForClass(Transport);

TransportSchema.index({ busNumber: 1, route: 1 });
TransportSchema.index({ rollNumber: 1 }, { unique: true });
TransportSchema.index({ pickupPoint: 1 });
TransportSchema.index({ status: 1 });
