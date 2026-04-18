import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SkillDocument = Skill & Document;

@Schema({ timestamps: true, collection: 'AdminDashboardDB_Sections_SkillBoost' })
export class Skill {
    @Prop({ required: true })
    title: string;

    @Prop()
    description: string;

    @Prop({ enum: ['Programming', 'Soft Skills', 'Technical', 'General'], default: 'Technical' })
    category: string;

    @Prop({ enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' })
    level: string;

    @Prop()
    duration: string;

    @Prop()
    instructor: string;

    @Prop()
    thumbnail: string;

    @Prop()
    videoUrl: string;

    @Prop({ default: true })
    active: boolean;

    @Prop({ type: [String] })
    tags: string[];

    @Prop({ default: 0 })
    enrolledCount: number;

    @Prop({ default: 0 })
    rating: number;
}

export const SkillSchema = SchemaFactory.createForClass(Skill);

SkillSchema.index({ category: 1, active: 1 });
SkillSchema.index({ tags: 1 });
SkillSchema.index({ rating: -1 });
