import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WhiteboardDocument = Whiteboard & Document;

@Schema({ timestamps: true, collection: 'AdminDashboardDB_Sections_Whiteboard' })
export class Whiteboard {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    data: string; // JSON string of drawings

    @Prop({ required: true })
    createdBy: string;

    @Prop({ type: [String] })
    sharedWith: string[];

    @Prop({ default: true })
    active: boolean;
}

export const WhiteboardSchema = SchemaFactory.createForClass(Whiteboard);

WhiteboardSchema.index({ createdBy: 1 });
WhiteboardSchema.index({ sharedWith: 1 });
