import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LibraryDocument = Library & Document;

@Schema({ timestamps: true, collection: 'AdminDashboardDB_Sections_Library' })
export class Library {
    @Prop({ required: true, index: true })
    rollNumber: string;

    @Prop({ required: true })
    studentName: string;

    @Prop({ required: true })
    bookTitle: string;

    @Prop({ required: true })
    bookId: string;

    @Prop({ default: Date.now })
    issueDate: Date;

    @Prop({ required: true })
    dueDate: Date;

    @Prop()
    returnDate: Date;

    @Prop({ enum: ['Issued', 'Returned', 'Overdue', 'Lost'], default: 'Issued' })
    status: string;

    @Prop({ default: 0 })
    fine: number;

    @Prop({ default: false })
    isFinePaid: boolean;
}

export const LibrarySchema = SchemaFactory.createForClass(Library);

LibrarySchema.index({ rollNumber: 1, status: 1 });
LibrarySchema.index({ bookId: 1, status: 1 });
LibrarySchema.index({ dueDate: 1 });
LibrarySchema.index({ status: 1 });
