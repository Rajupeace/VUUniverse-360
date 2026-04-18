import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { FacultyStatsService } from './facultystats.service';
import { JwtAuthGuard } from '../auth/guards';
import { Public } from '../decorators/public.decorator';

@Controller('faculty-stats')
@UseGuards(JwtAuthGuard)
export class FacultyStatsController {
  constructor(private statsService: FacultyStatsService) { }

  @Public() // Keeping it public for ease of demo as requested in similar patterns
  @Get(':facultyId/students')
  async getStudents(@Param('facultyId') facultyId: string) {
    return this.statsService.getFacultyStudents(facultyId);
  }

  @Public()
  @Get(':facultyId/materials-downloads')
  async getMaterialsDownloads(@Param('facultyId') facultyId: string) {
    return this.statsService.getMaterialsDownloads(facultyId);
  }
}
