import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoadmapDocument = Roadmap & Document;

@Schema()
class RoadmapLevel {
    @Prop({ required: true })
    title: string;

    @Prop()
    description: string;

    @Prop({ type: [String] })
    topics: string[];
}

@Schema({ timestamps: true, collection: 'AdminDashboardDB_Sections_Roadmaps' })
export class Roadmap {
    @Prop({ required: true, unique: true })
    slug: string;

    @Prop({ required: true })
    title: string;

    @Prop()
    description: string;

    @Prop()
    category: string;

    @Prop()
    icon: string;

    @Prop()
    color: string;

    @Prop({ type: [RoadmapLevel] })
    levels: RoadmapLevel[];

    @Prop({ default: true })
    isActive: boolean;
}

export const RoadmapSchema = SchemaFactory.createForClass(Roadmap);
