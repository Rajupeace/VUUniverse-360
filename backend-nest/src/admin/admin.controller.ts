import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard, StaffGuard } from '../auth/guards';
import { Roles } from '../decorators/roles.decorator';
import { MarksService } from '../marks/marks.service';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(
    private adminService: AdminService,
    private marksService: MarksService
  ) { }

  @Post('sync-database')
  async syncDatabase(): Promise<any> {
    return this.adminService.syncDatabase();
  }

  @Post('sync-relationships')
  async syncRelationships(): Promise<any> {
    return this.adminService.syncDatabase();
  }

  @Post('migrate-to-enrollments')
  async migrateToEnrollments(): Promise<any> {
    return this.adminService.migrateAssignmentsToEnrollments();
  }

  @Get('dashboard-status')
  async getDashboardStatus(): Promise<any> {
    return this.adminService.getDashboardStatus();
  }

  @Get('enrollments-report')
  async getEnrollmentsReport(): Promise<any> {
    return this.adminService.getEnrollmentsReport();
  }

  @Get('class-roster/:year/:section/:branch')
  async getClassRoster(
    @Param('year') year: string,
    @Param('section') section: string,
    @Param('branch') branch: string,
  ): Promise<any> {
    return this.adminService.getClassRoster(year, section, branch);
  }

  @Post('attendance-recompute')
  async attendanceRecompute(): Promise<any> {
    return this.adminService.attendanceRecompute();
  }

  @Post('sync-all-student-data')
  async syncAllStudentData(): Promise<any> {
    return this.adminService.attendanceRecompute();
  }

  @Get('marks/overview')
  async getMarksOverview(@Query() query: any): Promise<any> {
    return this.marksService.getAdminOverview(query);
  }
}
