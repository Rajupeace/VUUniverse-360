import { Controller, Get, Body, Param, Put, Post, UseGuards } from '@nestjs/common';
import { StudentGradesService } from './studentgrades.service';
import { JwtAuthGuard, StaffGuard } from '../auth/guards';

@Controller('student-grades')
@UseGuards(JwtAuthGuard)
export class StudentGradesController {
  constructor(private gradesService: StudentGradesService) { }

  @Get(':rollNumber')
  async findByStudent(@Param('rollNumber') rollNumber: string): Promise<any> {
    return this.gradesService.findByStudent(rollNumber);
  }

  @Put(':rollNumber')
  @UseGuards(StaffGuard)
  async updateGrades(@Param('rollNumber') rollNumber: string, @Body() data: any): Promise<any> {
    return this.gradesService.updateGrades(rollNumber, data);
  }

  @Post(':rollNumber/semester')
  @UseGuards(StaffGuard)
  async addSemester(@Param('rollNumber') rollNumber: string, @Body() semesterData: any): Promise<any> {
    return this.gradesService.addSemester(rollNumber, semesterData);
  }
}
