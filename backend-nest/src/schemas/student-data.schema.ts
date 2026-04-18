import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type StudentDataDocument = StudentData & Document;

@Schema({ timestamps: true })
export class StudentData {
    @Prop({ type: MongooseSchema.Types.Mixed, ref: 'Student', required: true, unique: true })
    studentId: any;

    @Prop()
    name: string;

    @Prop()
    email: string;

    @Prop()
    rollNumber: string;

    @Prop()
    branch: string;

    @Prop()
    currentSemester: string;

    @Prop({ type: Object })
    sections: {
        overview: {
            totalCourses: number;
            activeCoursesCount: number;
            totalClasses: number;
            totalPresent: number;
            totalAbsent: number;
            overallAttendance: number;
            currentCGPA: number;
            currentSGPA: number;
            lastUpdated: Date;
        };
        courses: {
            totalCourses: number;
            courseList: any[];
            lastUpdated: Date;
        };
        materials: {
            totalMaterials: number;
            downloadedCount: number;
            materialList: any[];
            lastUpdated: Date;
        };
        schedule: {
            totalClasses: number;
            upcomingClasses: number;
            classSchedule: any[];
            weeklySchedule: any[];
            lastUpdated: Date;
        };
        exams: {
            totalExams: number;
            completedExams: number;
            upcomingExams: number;
            examList: any[];
            lastUpdated: Date;
        };
        faculty: {
            totalFaculty: number;
            facultyList: any[];
            lastUpdated: Date;
        };
        chat: {
            totalChats: number;
            recentChats: any[];
            conversationHistory: any[];
            lastUpdated: Date;
        };
        attendance: {
            totalClasses: number;
            totalPresent: number;
            totalAbsent: number;
            attendancePercentage: number;
            attendanceRecords: any[];
            lastUpdated: Date;
        };
    };

    @Prop({ type: Object })
    progress: {
        overallProgress: number;
        coursesInProgress: number;
        coursesCompleted: number;
        streak: number;
        aiUsageCount: number;
        tasksCompleted: number;
        careerReadyScore: number;
        advancedProgress: number;
        weeklyActivity: any[];
        lastUpdated: Date;
    };

    @Prop({ type: Object })
    statistics: {
        totalAssignmentsSubmitted: number;
        totalAssignmentsReceived: number;
        totalProjectsCompleted: number;
        averageMarks: number;
        lastUpdated: Date;
    };

    @Prop({ type: [Object] })
    activityLog: any[];

    @Prop()
    lastLogin: Date;

    @Prop({ default: 0 })
    loginCount: number;
}

export const StudentDataSchema = SchemaFactory.createForClass(StudentData);
