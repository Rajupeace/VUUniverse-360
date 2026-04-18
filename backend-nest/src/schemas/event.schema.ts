import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EventDocument = Event & Document;

@Schema({ timestamps: true, collection: 'AdminDashboardDB_Sections_Events' })
export class Event {
    @Prop({ required: true })
    title: string;

    @Prop()
    description: string;

    @Prop({ required: true })
    date: Date;

    @Prop()
    time: string;

    @Prop()
    location: string;

    @Prop({ enum: ['Academic', 'Cultural', 'Sports', 'Technical', 'General'], default: 'General' })
    category: string;

    @Prop({ enum: ['College Level', 'Inter-College', 'State Level', 'National Level'], default: 'College Level' })
    level: string;

    @Prop()
    image: string;

    @Prop({ type: [String] })
    targetAudience: string[]; // e.g., ['1st Year', 'CSE']

    @Prop({ default: true })
    active: boolean;

    @Prop()
    registrationLink: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);

EventSchema.index({ date: 1, active: 1 });
EventSchema.index({ category: 1 });
