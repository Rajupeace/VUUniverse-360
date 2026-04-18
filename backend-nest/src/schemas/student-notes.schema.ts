import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StudentNotesDocument = StudentNotes & Document;

@Schema({ timestamps: true, collection: 'AdminDashboardDB_Sections_StudentNotes' })
export class StudentNotes {
    @Prop({ required: true, index: true })
    sid: string;

    @Prop()
    courseId: string;

    @Prop({ required: true })
    title: string;

    @Prop({ default: '' })
    content: string;

    @Prop({ default: 'personal-notes' })
    category: string;

    @Prop()
    semester: string;

    @Prop()
    academicYear: string;

    @Prop({ type: [String], default: [] })
    tags: string[];

    @Prop()
    fileUrl: string;

    @Prop({ default: false })
    isShared: boolean;
}

export const StudentNotesSchema = SchemaFactory.createForClass(StudentNotes);

StudentNotesSchema.index({ sid: 1, category: 1 });
StudentNotesSchema.index({ sid: 1, courseId: 1 });
