import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TodoDocument = Todo & Document;

@Schema({ timestamps: true })
export class Todo {
    @Prop({ required: true })
    text: string;

    @Prop({ enum: ['admin', 'faculty', 'student', 'all'], default: 'admin' })
    target: string;

    @Prop({ default: null })
    userId: string;

    @Prop()
    dueDate: Date;

    @Prop({ default: false })
    completed: boolean;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
