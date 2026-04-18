import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { SkillBoostService } from './skillboost.service';
import { JwtAuthGuard, StaffGuard } from '../auth/guards';
import { Public } from '../decorators/public.decorator';

@Controller('skill-boost')
@UseGuards(JwtAuthGuard)
export class SkillBoostController {
  constructor(private skillBoostService: SkillBoostService) { }

  @Public()
  @Get()
  async findAll(@Query() query: any): Promise<any[]> {
    return this.skillBoostService.findAll(query);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    return this.skillBoostService.findOne(id);
  }

  @Post()
  @UseGuards(StaffGuard)
  async create(@Body() data: any): Promise<any> {
    return this.skillBoostService.create(data);
  }

  @Put(':id')
  @UseGuards(StaffGuard)
  async update(@Param('id') id: string, @Body() data: any): Promise<any> {
    return this.skillBoostService.update(id, data);
  }

  @Post(':id/enroll')
  async enroll(@Param('id') id: string): Promise<any> {
    return this.skillBoostService.enroll(id);
  }

  @Delete(':id')
  @UseGuards(StaffGuard)
  async delete(@Param('id') id: string): Promise<any> {
    return this.skillBoostService.delete(id);
  }
}
