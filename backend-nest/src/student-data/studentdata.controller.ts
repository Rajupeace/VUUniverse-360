import { Controller, Get, Put, Body, Param, UseGuards, Inject, forwardRef } from '@nestjs/common';
import { StudentDataService } from './studentdata.service';
import { JwtAuthGuard, StaffGuard } from '../auth/guards';
import { Public } from '../decorators/public.decorator';

@Controller('student-data')
@UseGuards(JwtAuthGuard)
export class StudentDataController {
  constructor(private dataService: StudentDataService) { }

  @Public()
  @Get(':rollNumber/dashboard')
  async getDashboard(@Param('rollNumber') rollNumber: string): Promise<any> {
    return this.dataService.getDashboard(rollNumber);
  }

  @Get(':rollNumber')
  async findByStudent(@Param('rollNumber') rollNumber: string): Promise<any> {
    return this.dataService.findByStudent(rollNumber);
  }

  @Put(':rollNumber')
  @UseGuards(StaffGuard)
  async updateData(@Param('rollNumber') rollNumber: string, @Body() data: any): Promise<any> {
    return this.dataService.updateData(rollNumber, data);
  }
}
