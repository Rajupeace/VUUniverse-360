import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ScheduleDocument = Schedule & Document;

@Schema({ timestamps: true, collection: 'AdminDashboardDB_Sections_Schedule' })
export class Schedule {
    @Prop({ required: true })
    day: string; // e.g., 'Monday', 'Tuesday'

    @Prop({ required: true })
    startTime: string; // e.g., '09:00'

    @Prop({ required: true })
    endTime: string; // e.g., '10:00'

    @Prop({ required: true })
    subject: string;

    @Prop({ required: true })
    facultyName: string;

    @Prop()
    facultyId: string;

    @Prop({ required: true })
    branch: string;

    @Prop({ required: true })
    year: string;

    @Prop({ required: true })
    section: string;

    @Prop()
    room: string;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);

ScheduleSchema.index({ branch: 1, year: 1, section: 1, day: 1 });
ScheduleSchema.index({ facultyId: 1, day: 1 });
