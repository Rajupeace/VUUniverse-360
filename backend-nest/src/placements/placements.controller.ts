import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { PlacementsService } from './placements.service';
import { JwtAuthGuard, StaffGuard } from '../auth/guards';

@Controller('placements')
@UseGuards(JwtAuthGuard)
export class PlacementsController {
  constructor(private placementsService: PlacementsService) { }

  @Get()
  async findAll(@Query() query: any): Promise<any[]> {
    return this.placementsService.findAll(query);
  }

  @Get('applications/:sid')
  async findApplications(@Param('sid') sid: string): Promise<any[]> {
    return this.placementsService.findByStudent(sid);
  }

  @Get('student/:id')
  async findByStudent(@Param('id') id: string): Promise<any[]> {
    return this.placementsService.findByStudent(id);
  }

  @Get('stats')
  async getStats(): Promise<any> {
    return this.placementsService.getStats();
  }

  @Post()
  @UseGuards(StaffGuard)
  async create(@Body() data: any): Promise<any> {
    return this.placementsService.create(data);
  }

  @Put(':id')
  @UseGuards(StaffGuard)
  async update(@Param('id') id: string, @Body() data: any): Promise<any> {
    return this.placementsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(StaffGuard)
  async delete(@Param('id') id: string): Promise<any> {
    return this.placementsService.delete(id);
  }
}
