import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { AdminDataService } from './admindata.service';
import { JwtAuthGuard, StaffGuard } from '../auth/guards';

@Controller('admin-data')
@UseGuards(JwtAuthGuard, StaffGuard)
export class AdminDataController {
  constructor(private dataService: AdminDataService) { }

  @Get('collections')
  async getCollections(): Promise<string[]> {
    return this.dataService.getCollections();
  }

  @Get('stats')
  async getStats(): Promise<any> {
    return this.dataService.getStats();
  }

  @Delete('collection/:name')
  async drop(@Param('name') name: string): Promise<any> {
    return this.dataService.dropCollection(name);
  }
}
