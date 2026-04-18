import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type AchievementDocument = Achievement & Document;

@Schema({ timestamps: true })
export class Achievement {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Student', required: true, index: true })
    studentId: MongooseSchema.Types.ObjectId;

    @Prop({ required: true, index: true })
    rollNumber: string;

    @Prop()
    studentName: string;

    @Prop()
    department: string;

    @Prop()
    year: string;

    @Prop()
    section: string;

    @Prop({ required: true, trim: true })
    title: string;

    @Prop({
        required: true,
        enum: [
            'Semester Certificates', 'Sports Certificates', 'Technical Certificates',
            'Academic Certificates', 'Core Activity Certificates', 'Achievement Certificates',
            'Personal Document Certificates', 'Research', 'Cultural', 'Community Service', 'Other'
        ]
    })
    category: string;

    @Prop({
        required: true,
        enum: ['College Level', 'Inter-College', 'State Level', 'National Level', 'International Level']
    })
    level: string;

    @Prop({ enum: ['Individual', 'Team'], default: 'Individual' })
    achievementType: string;

    @Prop({
        required: true,
        enum: ['Winner', 'Runner-up', 'Participation', 'Rank']
    })
    position: string;

    @Prop({ min: 1 })
    rank: number;

    @Prop({ required: true })
    achievementDate: Date;

    @Prop({ maxlength: 1000 })
    description: string;

    @Prop({ required: true })
    eventName: string;

    @Prop()
    organizingInstitution: string;

    @Prop()
    eventLocation: string;

    @Prop({ enum: ['Online', 'Offline', 'Hybrid'], default: 'Offline' })
    eventMode: string;

    @Prop({
        type: [{
            fileType: { type: String, enum: ['Certificate', 'Screenshot', 'Report', 'Other'] },
            fileName: String,
            fileUrl: String,
            uploadedAt: { type: Date, default: Date.now },
            verified: { type: Boolean, default: false },
            verifiedBy: String,
            verifiedAt: Date
        }]
    })
    documents: any[];

    @Prop()
    resultLink: string;

    @Prop({ enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' })
    status: string;

    @Prop()
    approvedBy: string;

    @Prop({ enum: ['Faculty', 'Admin'], default: 'Faculty' })
    approvedByType: string;

    @Prop()
    approvalDate: Date;

    @Prop()
    rejectionReason: string;

    @Prop({ default: Date.now })
    submittedAt: Date;
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);

AchievementSchema.index({ studentId: 1, achievementDate: -1 });
AchievementSchema.index({ rollNumber: 1, status: 1 });
AchievementSchema.index({ category: 1, level: 1 });
AchievementSchema.index({ status: 1, submittedAt: -1 });
