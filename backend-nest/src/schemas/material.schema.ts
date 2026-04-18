import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MaterialDocument = Material & Document;

@Schema({ timestamps: true, collection: 'AdminDashboardDB_Sections_Materials' })
export class Material {
    @Prop({ required: true })
    title: string;

    @Prop()
    description: string;

    @Prop({ default: '1' })
    year: string;

    @Prop({ default: 'All' })
    branch: string;

    @Prop({ default: '1' })
    semester: string;

    @Prop({ type: MongooseSchema.Types.Mixed, default: 'All' })
    section: any;

    @Prop({ required: true })
    subject: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course' })
    course: MongooseSchema.Types.ObjectId;

    @Prop({ default: '1' })
    module: string;

    @Prop({ default: '1' })
    unit: string;

    @Prop({ default: 'General Topics' })
    topic: string;

    @Prop({ required: true })
    type: string;

    @Prop({ default: false })
    isAdvanced: boolean;

    @Prop({ required: true })
    fileUrl: string;

    @Prop()
    url: string;

    @Prop()
    fileType: string;

    @Prop()
    fileSize: number;

    @Prop({ type: MongooseSchema.Types.Mixed })
    uploadedBy: any;

    @Prop()
    facultyName: string;

    @Prop({ default: 0 })
    views: number;

    @Prop({ default: 0 })
    downloads: number;

    @Prop({ default: 0 })
    likes: number;

    @Prop()
    duration: string;

    @Prop()
    videoAnalysis: string;

    @Prop()
    examYear: string;

    @Prop()
    dueDate: Date;

    @Prop()
    message: string;
}

export const MaterialSchema = SchemaFactory.createForClass(Material);

MaterialSchema.pre('save', function (next) {
    if (!this.url) this.url = this.fileUrl;
    if (!this.fileUrl) this.fileUrl = this.url;
    next();
});

MaterialSchema.index({ year: 1, branch: 1, section: 1 });
MaterialSchema.index({ subject: 1, type: 1 });
MaterialSchema.index({ course: 1 });
MaterialSchema.index({ title: 'text', description: 'text', subject: 'text' });
