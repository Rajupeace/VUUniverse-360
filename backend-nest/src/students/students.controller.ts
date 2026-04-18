import {
    Controller, Get, Post, Put, Delete, Param, Body, Query,
    UseGuards, UseInterceptors, UploadedFile,
    Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/guards';
import { Public } from '../decorators/public.decorator';
import { SseService } from '../sse/sse.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const multer = require('multer');

const resumeStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(process.cwd(), '..', 'uploads', 'resumes');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, `resume-${Date.now()}${path.extname(file.originalname)}`),
});

const profilePicStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(process.cwd(), '..', 'uploads', 'profile-pics');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, `student-profile-${Date.now()}${path.extname(file.originalname)}`),
});

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
    constructor(
        private studentsService: StudentsService,
        private sseService: SseService,
    ) { }

    @Post('profile-pic/upload')
    @UseInterceptors(FileInterceptor('image', { storage: profilePicStorage }))
    async uploadProfilePic(@UploadedFile() file: any) {
        if (!file) return { success: false, error: 'No file uploaded' };
        return { success: true, url: `/uploads/profile-pics/${file.filename}` };
    }

    @Get()
    async findAll(@Query() query: any): Promise<any[]> {
        return this.studentsService.findAll(query);
    }

    @Public()
    @Get(':id/overview')
    async getStudentOverview(@Param('id') id: string): Promise<any> {
        return this.studentsService.getStudentOverview(id);
    }

    @Public()
    @Get(':id/class-attendance')
    async getClassAttendance(@Param('id') id: string): Promise<any> {
        return this.studentsService.getClassAttendance(id);
    }

    @Public()
    @Get(':studentId/courses')
    async getCourses(@Param('studentId') studentId: string): Promise<any[]> {
        return this.studentsService.getStudentCourses(studentId);
    }

    @Public()
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<any> {
        return this.studentsService.findOne(id);
    }

    @Post()
    async create(@Body() body: any) {
        const student = await this.studentsService.create(body);
        this.sseService.broadcast({ resource: 'students', action: 'create', data: student });
        return student;
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() body: any) {
        const student = await this.studentsService.update(id, body);
        this.sseService.broadcast({ resource: 'students', action: 'update', data: student });
        return student;
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        const result = await this.studentsService.remove(id);
        this.sseService.broadcast({ resource: 'students', action: 'delete', data: { id } });
        return result;
    }

    @Put('profile/:sid')
    async updateProfile(@Param('sid') sid: string, @Body() body: any): Promise<any> {
        const updated = await this.studentsService.updateProfile(sid, body);
        this.sseService.broadcast({ resource: 'students', action: 'profile-update', data: { sid } });
        return { success: true, student: { ...updated.toObject?.() || updated, profilePic: (updated as any).profileImage } };
    }

    @Put('security/:sid')
    async security(@Param('sid') sid: string, @Body() body: any) {
        return this.studentsService.changePassword(sid, body);
    }

    @Public()
    @Put('change-password/:sid')
    async changePassword(@Param('sid') sid: string, @Body() body: any) {
        return this.studentsService.changePassword(sid, body);
    }

    @Post('resume/upload')
    @UseInterceptors(FileInterceptor('resume', { storage: resumeStorage }))
    uploadResume(@UploadedFile() file: any) {
        if (!file) return { error: 'No file uploaded' };
        return { url: `/uploads/resumes/${file.filename}` };
    }

    @Post(':studentId/roadmap-progress')
    async updateRoadmap(
        @Param('studentId') studentId: string,
        @Body() body: { roadmapSlug: string; topicName?: string; completedTopics?: string[] },
    ) {
        const result = await this.studentsService.updateRoadmapProgress(
            studentId, body.roadmapSlug, body.topicName, body.completedTopics,
        );
        this.sseService.broadcast({ resource: 'studentData', action: 'roadmap-update', data: { studentId } });
        return result;
    }
    
    @Get(':studentId/marks-by-subject')
    async getMarksBySubject(@Param('studentId') studentId: string): Promise<any[]> {
        return this.studentsService.getStudentMarksBySubject(studentId);
    }


    @Post('update-roadmap')
    async updateRoadmapAlt(@Body() body: { sid: string; roadmapSlug: string; completedTopics: string[] }) {
        const result = await this.studentsService.updateRoadmapProgress(
            body.sid, body.roadmapSlug, undefined, body.completedTopics,
        );
        this.sseService.broadcast({ resource: 'studentData', action: 'roadmap-update', data: { studentId: body.sid } });
        return result;
    }

    @Post('bulk')
    @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
    async bulkUpload(@UploadedFile() file: any, @Body() body: any) {
        let studentDataList: any[] = [];

        if (file) {
            const { parseCSV } = require('../utils/csv-parser');
            studentDataList = parseCSV(file.buffer.toString('utf8'));
        } else if (body.students && Array.isArray(body.students)) {
            studentDataList = body.students;
        } else {
            return { success: false, error: 'Please provide an array of students or upload a CSV file' };
        }

        if (studentDataList.length === 0) {
            return { success: false, error: 'No student data found in request' };
        }

        const results = await this.studentsService.bulkUpsert(studentDataList);

        if ((results.success as any[]).length > 0) {
            this.sseService.broadcast({ resource: 'students', action: 'bulk-create' });
        }

        return {
            success: true,
            message: `Bulk upload complete: ${(results.success as any[]).length} succeeded, ${(results.errors as any[]).length} failed`,
            results,
        };
    }
}
