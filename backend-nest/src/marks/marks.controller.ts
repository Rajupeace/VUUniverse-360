import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { MarksService } from './marks.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('marks')
@UseGuards(JwtAuthGuard)
export class MarksController {
  constructor(private marksService: MarksService) { }

  @Get('subject/:subject')
  async getMarksBySubject(@Param('subject') subject: string): Promise<any[]> {
    return this.marksService.getMarksBySubject(subject);
  }

  @Get(':subject/all')
  async getAllMarksBySubject(@Param('subject') subject: string): Promise<any[]> {
    return this.marksService.getMarksBySubject(subject);
  }

  @Post('bulk-save')
  async bulkSaveMarks(@Body() body: any): Promise<any> {
    return this.marksService.bulkSaveMarks(body.marks);
  }

  @Get('students/:studentId/marks-by-subject')
  async getStudentMarksBySubject(@Param('studentId') studentId: string): Promise<any[]> {
    return this.marksService.getStudentMarksBySubject(studentId);
  }

  @Get('admin/overview')
  async getAdminOverview(@Query() query: any): Promise<any> {
    return this.marksService.getAdminOverview(query);
  }

  @Get('faculty/:facultyId/students')
  async getFacultyStudents(@Param('facultyId') facultyId: string): Promise<any[]> {
    return this.marksService.getFacultyStudents(facultyId);
  }
}
