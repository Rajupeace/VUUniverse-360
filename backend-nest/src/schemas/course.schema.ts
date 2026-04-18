import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema({ collection: 'AdminDashboardDB_Sections_Courses' })
export class Course {
    @Prop() name: string;
    @Prop() courseName: string;
    @Prop() code: string;
    @Prop() courseCode: string;
    @Prop() branch: string;
    @Prop() semester: string;
    @Prop() year: string;
    @Prop({ default: 'All' }) section: string;
    @Prop() credits: number;
    @Prop() type: string;
    @Prop([{
        id: String, name: String, description: String,
        units: [{ id: String, name: String, content: String, topics: [{ id: String, name: String, content: String }] }]
    }]) modules: Record<string, any>[];
    @Prop([{ type: MongooseSchema.Types.Mixed }]) students: any[];
    @Prop({ default: Date.now }) createdAt: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
CourseSchema.index({ year: 1, branch: 1, semester: 1 });
CourseSchema.index({ code: 1 });
