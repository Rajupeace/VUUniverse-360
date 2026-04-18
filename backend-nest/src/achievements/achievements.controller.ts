import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { JwtAuthGuard } from '../auth/guards';
import { Public } from '../decorators/public.decorator';

@Controller('achievements')
@UseGuards(JwtAuthGuard)
export class AchievementsController {
  constructor(private achievementsService: AchievementsService) { }

  @Get(['', 'all/list'])
  async findAll(@Query() query: any): Promise<any[]> {
    return this.achievementsService.findAll(query);
  }

  @Get('student/:id')
  async findByStudent(@Param('id') id: string): Promise<any[]> {
    return this.achievementsService.findByStudent(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    return this.achievementsService.findOne(id);
  }

  @Post()
  async create(@Body() data: any): Promise<any> {
    return this.achievementsService.create(data);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; approvedBy: string; approvedByType: string }
  ): Promise<any> {
    return this.achievementsService.updateStatus(id, body.status, body.approvedBy, body.approvedByType);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<any> {
    return this.achievementsService.delete(id);
  }
}
