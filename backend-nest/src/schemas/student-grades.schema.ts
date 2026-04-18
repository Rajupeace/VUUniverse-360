import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StudentGradesDocument = StudentGrades & Document;

@Schema({ timestamps: true, collection: 'AdminDashboardDB_Sections_StudentGrades' })
export class StudentGrades {
    @Prop({ required: true, index: true })
    rollNumber: string;

    @Prop({
        type: [{
            semester: Number,
            sgpa: Number,
            backlogs: Number,
            grades: [{
                subject: String,
                grade: String,
                credits: Number
            }]
        }]
    })
    semesters: any[];

    @Prop({ default: 0 })
    cgpa: number;

    @Prop({ default: 0 })
    totalCredits: number;
}

export const StudentGradesSchema = SchemaFactory.createForClass(StudentGrades);

StudentGradesSchema.index({ rollNumber: 1 }, { unique: true });
