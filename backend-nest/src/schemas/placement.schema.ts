import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlacementDocument = Placement & Document;

@Schema({ timestamps: true, collection: 'AdminDashboardDB_Sections_Placements' })
export class Placement {
    @Prop({ required: true, index: true })
    rollNumber: string;

    @Prop({ required: true })
    studentName: string;

    @Prop({ required: true })
    companyName: string;

    @Prop({ required: true })
    jobProfile: string;

    @Prop({ required: true })
    package: number; // LPA

    @Prop({ enum: ['On-Campus', 'Off-Campus', 'Pool-Campus'], default: 'On-Campus' })
    placementType: string;

    @Prop({ required: true })
    placementDate: Date;

    @Prop({ enum: ['Selected', 'Shortlisted', 'Rejected', 'Joined'], default: 'Selected' })
    status: string;

    @Prop()
    location: string;

    @Prop()
    offerLetterUrl: string;

    @Prop()
    branch: string;

    @Prop()
    year: string;
}

export const PlacementSchema = SchemaFactory.createForClass(Placement);

PlacementSchema.index({ companyName: 1, status: 1 });
PlacementSchema.index({ rollNumber: 1 });
PlacementSchema.index({ package: -1 });
PlacementSchema.index({ placementDate: -1 });
