import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FeeDocument = Fee & Document;

@Schema({ timestamps: true, collection: 'AdminDashboardDB_Sections_Fees' })
export class Fee {
    @Prop({ required: true, index: true })
    rollNumber: string;

    @Prop({ required: true })
    studentName: string;

    @Prop({ required: true })
    branch: string;

    @Prop({ required: true })
    year: string;

    @Prop({
        required: true,
        enum: ['Tuition Fee', 'Hostel Fee', 'Transport Fee', 'Exam Fee', 'Library Fine', 'Other']
    })
    category: string;

    @Prop({ required: true })
    totalAmount: number;

    @Prop({ default: 0 })
    paidAmount: number;

    @Prop({ required: true })
    dueDate: Date;

    @Prop({ enum: ['Paid', 'Partial', 'Unpaid'], default: 'Unpaid' })
    status: string;

    @Prop({
        type: [{
            amount: Number,
            date: { type: Date, default: Date.now },
            method: { type: String, enum: ['Cash', 'Bank Transfer', 'Online', 'UPI', 'Cheque'] },
            refNo: String,
            receivedBy: String
        }]
    })
    transactions: any[];

    @Prop()
    academicYear: string;
}

export const FeeSchema = SchemaFactory.createForClass(Fee);

FeeSchema.index({ rollNumber: 1, category: 1 }, { unique: false });
FeeSchema.index({ status: 1 });
FeeSchema.index({ dueDate: 1 });
