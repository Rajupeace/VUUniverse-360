import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('schedule')
@UseGuards(JwtAuthGuard)
export class ScheduleController {
  constructor(private scheduleService: ScheduleService) { }

  @Get()
  async findAll(@Query() query: any): Promise<any[]> {
    return this.scheduleService.findAll(query);
  }

  @Get('student')
  async findByStudent(
    @Query('branch') branch: string,
    @Query('year') year: string,
    @Query('section') section: string
  ): Promise<any[]> {
    return this.scheduleService.findByStudent({ branch, year, section });
  }

  @Get('faculty/:id')
  async findByFaculty(@Param('id') id: string): Promise<any[]> {
    return this.scheduleService.findByFaculty(id);
  }

  @Post()
  async create(@Body() data: any): Promise<any> {
    return this.scheduleService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any): Promise<any> {
    return this.scheduleService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<any> {
    return this.scheduleService.delete(id);
  }
}
