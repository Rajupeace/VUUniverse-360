import { Controller, Get, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { StudentProgressService } from './student-progress.service';
import { JwtAuthGuard, StaffGuard } from '../auth/guards';

@Controller('student-progress')
@UseGuards(JwtAuthGuard)
export class StudentProgressController {
    constructor(private progressService: StudentProgressService) { }

    @Get(':rollNumber')
    async findByStudent(@Param('rollNumber') rollNumber: string): Promise<any> {
        return this.progressService.findByStudent(rollNumber);
    }

    @Put(':rollNumber')
    @UseGuards(StaffGuard)
    async updateProgress(@Param('rollNumber') rollNumber: string, @Body() data: any): Promise<any> {
        return this.progressService.updateProgress(rollNumber, data);
    }
}
