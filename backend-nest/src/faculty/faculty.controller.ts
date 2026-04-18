import {
    Controller, Get, Post, Put, Delete, Patch, Param, Body, Query,
    UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const multer = require('multer');
import * as path from 'path';
import * as fs from 'fs';
import { FacultyService } from './faculty.service';
import { JwtAuthGuard, StaffGuard } from '../auth/guards';
import { Public } from '../decorators/public.decorator';
import { SseService } from '../sse/sse.service';

const profilePicStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '..', '..', '..', 'uploads', 'profiles');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, `profile-${Date.now()}${path.extname(file.originalname)}`),
});

@Controller('faculty')
@UseGuards(JwtAuthGuard)
export class FacultyController {
    constructor(
        private facultyService: FacultyService,
        private sseService: SseService,
    ) { }

    // POST /api/faculty/profile/upload-pic
    @Post('profile/upload-pic')
    @UseInterceptors(FileInterceptor('profilePic', { storage: profilePicStorage }))
    uploadPic(@UploadedFile() file: Express.Multer.File) {
        if (!file) return { error: 'No file uploaded' };
        return { url: `/uploads/profiles/${file.filename}` };
    }

    // GET /api/faculty/by-role/achievement-managers
    @Public()
    @Get('by-role/achievement-managers')
    async achievementManagers() {
        const managers = await this.facultyService.findByRole('Achievement Manager');
        return { success: true, managers };
    }

    // GET /api/faculty (protected)
    @Get()
    async findAll(): Promise<any[]> {
        return this.facultyService.findAll();
    }

    // POST /api/faculty (admin: create)
    @Post()
    @UseGuards(StaffGuard)
    async create(@Body() body: any) {
        const faculty = await this.facultyService.create(body);
        this.sseService.broadcast({ resource: 'faculty', action: 'create', data: faculty });
        return faculty;
    }

    // POST /api/faculty/bulk
    @Post('bulk')
    @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
    async bulkUpload(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
        let faculties: any[] = [];
        if (file) {
            const { parseCSV } = require('../utils/csv-parser');
            faculties = parseCSV(file.buffer.toString('utf8'));
        } else if (body.faculties && Array.isArray(body.faculties)) {
            faculties = body.faculties;
        } else {
            return { success: false, error: 'Please provide an array of faculty members or upload a CSV file' };
        }

        if (faculties.length === 0) return { success: false, error: 'No faculty data found in request' };

        const results = await this.facultyService.bulkCreate(faculties);
        if (results.success.length > 0) this.sseService.broadcast({ resource: 'faculty', action: 'bulk-create' });

        return {
            success: true,
            message: `Bulk upload complete: ${results.success.length} succeeded, ${results.errors.length} failed`,
            results,
        };
    }

    // GET /api/faculty/teaching
    @Get('teaching')
    async findTeachingFaculty(@Query() query: any) {
        const { year, section, branch } = query;
        return this.facultyService.getTeachingFaculty(year, section, branch);
    }

    // GET /api/faculty/:id
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.facultyService.findOne(id);
    }

    // PUT /api/faculty/:id
    @Put(':id')
    @UseGuards(StaffGuard)
    async update(@Param('id') id: string, @Body() body: any) {
        const updated = await this.facultyService.update(id, body);
        this.sseService.broadcast({ resource: 'faculty', action: 'update', data: updated });
        return updated;
    }

    // DELETE /api/faculty/:id
    @Delete(':id')
    @UseGuards(StaffGuard)
    async delete(@Param('id') id: string) {
        const result = await this.facultyService.delete(id);
        this.sseService.broadcast({ resource: 'faculty', action: 'delete', data: { id } });
        return result;
    }

    // PATCH /api/faculty/:id/assign-role
    @Patch(':id/assign-role')
    async assignRole(@Param('id') id: string, @Body() body: { role: string }) {
        const result = await this.facultyService.assignRole(id, body.role);
        this.sseService.broadcast({ resource: 'faculty', action: 'role-update', data: { id, role: body.role } });
        return result;
    }
}
