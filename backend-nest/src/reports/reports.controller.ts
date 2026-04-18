import { Controller, Get, Param, Query, UseGuards, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) { }

  @Get('summary')
  async getSummary(@Query('startDate') start: string, @Query('endDate') end: string): Promise<any> {
    return this.reportsService.getReportSummary(start, end);
  }

  @Get('pdf')
  async getPdf(@Query('startDate') start: string, @Query('endDate') end: string, @Res() res: any) {
    const buffer = await this.reportsService.generatePdfReport(start, end);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=VuUniverse-Reporting-${Date.now()}.pdf`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get('excel')
  async getExcel(@Query('startDate') start: string, @Query('endDate') end: string, @Res() res: any) {
    const buffer = await this.reportsService.generateExcelReport(start, end);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=VuUniverse-Reporting-${Date.now()}.xlsx`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get('branch-performance/:branch')
  async getBranchPerformance(@Param('branch') branch: string): Promise<any> {
    return this.reportsService.getBranchPerformance(branch);
  }

  @Get('student-full-report/:studentId')
  async getStudentReport(@Param('studentId') studentId: string): Promise<any> {
    return this.reportsService.getStudentFullProgressReport(studentId);
  }

  @Get('system-status')
  async getSystemStatus(): Promise<any> {
    return this.reportsService.getSystemStatus();
  }

}
