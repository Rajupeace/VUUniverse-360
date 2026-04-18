import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true, collection: 'AdminDashboardDB_Sections_Messages' })
export class Message {
    @Prop({ default: 'Admin' })
    sender: string;

    @Prop({ default: 'admin' })
    senderRole: string;

    @Prop()
    senderImage: string;

    @Prop()
    facultyId: string;

    @Prop({ required: true })
    target: string;

    @Prop()
    targetYear: string;

    @Prop({ type: [String] })
    targetSections: string[];

    @Prop()
    targetBranch: string;

    @Prop({ default: 'info' })
    type: string;

    @Prop()
    subject: string;

    @Prop({ required: true })
    message: string;

    @Prop()
    expiresAt: Date;

    @Prop({ default: Date.now })
    createdAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
