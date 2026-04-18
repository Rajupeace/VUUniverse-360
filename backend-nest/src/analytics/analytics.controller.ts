import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) { }

  @Get('overview')
  async getOverview(): Promise<any> {
    return this.analyticsService.getOverview();
  }

  @Get('faculty-activity')
  async getFacultyActivity(): Promise<any> {
    return this.analyticsService.getFacultyActivity();
  }

  @Get('class-attendance')
  async getClassAttendance(): Promise<any> {
    const data = await this.analyticsService.getDashboard();
    return data.classAttendance || [];
  }

  @Get('low-attendance')
  async getLowAttendance(): Promise<any> {
    const data = await this.analyticsService.getDashboard();
    return data.lowAttendance || [];
  }

  @Get('student-performance')
  async getStudentPerformance(): Promise<any> {
    const data = await this.analyticsService.getDashboard();
    return data.studentPerformance || [];
  }

  @Get('hourly-trends')
  async getHourlyTrends(): Promise<any> {
    const data = await this.analyticsService.getDashboard();
    return data.hourlyTrends || [];
  }

  @Get('daily-trends')
  async getDailyTrends(): Promise<any> {
    const data = await this.analyticsService.getDashboard();
    return data.dailyTrends || [];
  }

  @Get('department-summary')
  async getDeptSummary(): Promise<any> {
    const data = await this.analyticsService.getDashboard();
    return data.deptSummary || [];
  }

  @Get('dashboard')
  async getDashboard(): Promise<any> {
    return this.analyticsService.getDashboard();
  }

}
