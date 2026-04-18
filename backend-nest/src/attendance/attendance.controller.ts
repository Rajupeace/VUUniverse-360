import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards';
import { Roles } from '../decorators/roles.decorator';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) { }

  @Post()
  async recordAttendance(@Body() body: any): Promise<any> {
    return this.attendanceService.recordAttendance(body);
  }

  @Get('analysis/sections')
  async getAnalysisSections(@Query() query: any): Promise<any[]> {
    return this.attendanceService.getSectionSummary(query);
  }

  @Get('analysis/subjects')
  async getAnalysisSubjects(@Query() query: any): Promise<any[]> {
    return this.attendanceService.getSubjectSummary(query);
  }

  @Get('daily')
  async getDailyAttendance(@Query('date') date: string): Promise<any[]> {
    return this.attendanceService.getAllAttendance({ date });
  }

  @Get('matrix')
  async getMatrix(@Query() query: any): Promise<any> {
    return this.attendanceService.getSectionMatrix(query);
  }

  @Get('student/:sid/summary')
  async getStudentSummary(@Param('sid') sid: string): Promise<any[]> {
    return this.attendanceService.getStudentSubjectSummary(sid);
  }

  @Get('section-summary')
  async getSectionSummary(@Query() query: any): Promise<any[]> {
    return this.attendanceService.getSectionSummary(query);
  }

  @Get('students')
  async getStudentsSummary(@Query() query: any): Promise<any[]> {
    return this.attendanceService.getStudentsSummary(query);
  }

  @Get('subject-summary')
  async getSubjectSummary(@Query() query: any): Promise<any[]> {
    return this.attendanceService.getSubjectSummary(query);
  }

  @Get('section-matrix')
  async getSectionMatrix(@Query() query: any): Promise<any> {
    return this.attendanceService.getSectionMatrix(query);
  }

  @Get('student/:sid/subject-summary')
  async getStudentSubjectSummary(@Param('sid') sid: string): Promise<any[]> {
    return this.attendanceService.getStudentSubjectSummary(sid);
  }

  @Get('student/:sid')
  async getStudentAttendance(@Param('sid') sid: string): Promise<any> {
    return this.attendanceService.getStudentAttendance(sid);
  }

  @Get('subject/:subject/section/:section')
  async getSectionSubjectAttendance(
    @Param('subject') subject: string,
    @Param('section') section: string,
    @Query('date') date?: string
  ): Promise<any> {
    return this.attendanceService.getSectionSubjectAttendance(subject, section, date);
  }

  @Get('all')
  async getAllAttendance(@Query() query: any): Promise<any[]> {
    return this.attendanceService.getAllAttendance(query);
  }
}

