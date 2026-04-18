import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FacultyDocument = Faculty & Document;

@Schema({ collection: 'AdminDashboardDB_Sections_Faculty' })
export class Faculty {
    @Prop({ required: true }) name: string;
    @Prop({ required: true, unique: true }) facultyId: string;
    @Prop({ default: '' }) email: string;
    @Prop({ required: true }) password: string;
    @Prop({ default: 'Lecturer' }) designation: string;
    @Prop({ default: 'General' }) department: string;
    @Prop() phone: string;
    @Prop() gender: string;
    @Prop() address: string;
    @Prop([{
        year: String,
        section: String,
        branch: String,
        subject: String,
        semester: String,
    }]) assignments: Record<string, any>[];
    @Prop({ default: 'Faculty' }) role: string;
    @Prop({ default: false }) isAchievementManager: boolean;
    @Prop({ default: 'PhD Scholar' }) qualification: string;
    @Prop({ default: '10+ Academic Years' }) experience: string;
    @Prop({ default: 'Computer Engineering' }) specialization: string;
    @Prop({ default: null }) image: string;
    @Prop({ default: null }) profileImage: string;
    @Prop({ default: null }) profilePic: string;
    @Prop() lastLogin: Date;
    @Prop({ default: 0 }) totalClasses: number;
    @Prop({ default: Date.now }) createdAt: Date;
    @Prop() updatedAt: Date;
    @Prop({ default: false }) isTransportUser: boolean;
    @Prop({ default: false }) isHosteller: boolean;
}

export const FacultySchema = SchemaFactory.createForClass(Faculty);
// Non-unique indexes only (unique ones come from @Prop decorators)
FacultySchema.index({ 'assignments.year': 1, 'assignments.section': 1 }, { name: 'assignment_class_idx', sparse: true });
FacultySchema.index({ 'assignments.subject': 1 }, { name: 'subject_idx', sparse: true });
FacultySchema.index({ name: 'text', specialization: 'text' });
FacultySchema.index({ lastLogin: -1 }, { name: 'lastlogin_idx', sparse: true });
FacultySchema.index({ createdAt: -1 }, { name: 'created_idx' });
FacultySchema.index({ department: 1, designation: 1 }, { name: 'dept_designation_idx' });
