import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { FacultyDataService } from './facultydata.service';
import { JwtAuthGuard, StaffGuard } from '../auth/guards';
import { Public } from '../decorators/public.decorator';

@Controller('faculty-data')
@UseGuards(JwtAuthGuard)
export class FacultyDataController {
  constructor(private dataService: FacultyDataService) { }

  @Public()
  @Get(':facultyId/dashboard')
  async getDashboard(@Param('facultyId') facultyId: string): Promise<any> {
    return this.dataService.getDashboard(facultyId);
  }

  @Get('branch/:name')
  async getByBranch(@Param('name') branch: string): Promise<any[]> {
    return this.dataService.getByBranch(branch);
  }

  @Get('expertise/:name')
  async getByExpertise(@Param('name') expertise: string): Promise<any[]> {
    return this.dataService.getByExpertise(expertise);
  }
}
