import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema({ timestamps: true, collection: 'chats' })
export class Chat {
    @Prop({ default: 'guest', index: true })
    userId: string;

    @Prop({ default: 'student', index: true })
    role: string;

    @Prop({ required: true })
    userMessage: string;

    @Prop({ required: true })
    agentResponse: string;

    @Prop({ type: Object })
    context: any;

    @Prop({ default: Date.now, index: true })
    timestamp: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
