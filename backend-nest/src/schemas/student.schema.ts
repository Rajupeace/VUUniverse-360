import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StudentDocument = Student & Document;

@Schema({ collection: 'AdminDashboardDB_Sections_Students' })
export class Student {
    @Prop({ required: true, unique: true }) sid: string;
    @Prop({ required: true }) studentName: string;
    @Prop({ required: true, unique: true }) email: string;
    @Prop({ required: true }) password: string;
    @Prop({ required: true }) branch: string;
    @Prop({ required: true }) year: string;
    @Prop({ required: true }) section: string;
    @Prop() phone: string;
    @Prop() dateOfBirth: Date;
    @Prop() religion: string;
    @Prop() sscMarks: string;
    @Prop() intermediateMarks: string;
    @Prop() schoolName: string;
    @Prop() schoolLocation: string;
    @Prop() interCollegeName: string;
    @Prop() interLocation: string;
    @Prop() sscPassOutYear: string;
    @Prop() intermediatePassOutYear: string;
    @Prop({ enum: ['EAMCET', 'V-SAT', 'M-SET', 'Other'], default: 'V-SAT' }) admissionMode: string;
    @Prop() gender: string;
    @Prop() bio: string;
    @Prop() address: string;
    @Prop() profileImage: string;
    @Prop() profilePicture: string;
    @Prop() avatar: string;
    @Prop() studentToken: string;
    @Prop() tokenIssuedAt: Date;
    @Prop({ default: Date.now }) createdAt: Date;
    @Prop({ default: Date.now }) updatedAt: Date;
    @Prop({
        type: {
            streak: { type: Number, default: 0 },
            lastLogin: Date,
            aiUsageCount: { type: Number, default: 0 },
            tasksCompleted: { type: Number, default: 0 },
            advancedProgress: { type: Number, default: 0 },
            careerReadyScore: { type: Number, default: 0 },
            totalClasses: { type: Number, default: 0 },
            totalPresent: { type: Number, default: 0 },
            weeklyActivity: [{
                day: { type: String, default: 'Mon' },
                hours: { type: Number, default: 0 }
            }],
        },
        default: {}
    }) stats: Record<string, any>;
    @Prop({ type: Map, of: [String], default: {} }) roadmapProgress: Map<string, string[]>;
    @Prop({ default: false }) isTransportUser: boolean;
    @Prop({ default: false }) isHosteller: boolean;
}

export const StudentSchema = SchemaFactory.createForClass(Student);

// Indexes (non-unique ones only - unique ones are already set via @Prop)
StudentSchema.index({ year: 1, branch: 1, section: 1 }, { name: 'class_query_idx' });
StudentSchema.index({ year: 1, section: 1, branch: 1, createdAt: -1 }, { name: 'class_sorted_idx' });
StudentSchema.index({ createdAt: -1 }, { name: 'created_idx' });
StudentSchema.index({ updatedAt: -1 }, { name: 'updated_idx' });
StudentSchema.index({ studentName: 'text', email: 'text' }, { name: 'search_idx' });
StudentSchema.index({ 'stats.lastLogin': -1 }, { name: 'lastlogin_idx', sparse: true });
StudentSchema.index({ 'stats.careerReadyScore': -1 }, { name: 'career_score_idx', sparse: true });
StudentSchema.index({ branch: 1, year: 1 }, { name: 'branch_year_idx' });
StudentSchema.index({ section: 1 }, { name: 'section_idx' });
StudentSchema.index({ year: 1, branch: 1, section: 1, createdAt: 1 }, { name: 'pagination_idx' });
StudentSchema.index({ phone: 1 }, { sparse: true, name: 'phone_idx' });

// Pre-save hook to update updatedAt
StudentSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
