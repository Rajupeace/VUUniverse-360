import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { FastService } from './fast.service';
import { JwtAuthGuard, StaffGuard } from '../auth/guards';

@Controller(['fast', 'teaching-assignments'])
@UseGuards(JwtAuthGuard)
export class FastController {
  constructor(private fastService: FastService) { }

  @Get()
  async findAll(@Query() query: any): Promise<any[]> {
    return this.fastService.findAll(query);
  }

  @Get('student-feed')
  async getStudentFeed(
    @Query('branch') branch: string,
    @Query('year') year: string,
    @Query('section') section: string
  ): Promise<any[]> {
    return this.fastService.findByStudent({ branch, year, section });
  }

  @Get('faculty/:id')
  async findByFaculty(@Param('id') id: string): Promise<any[]> {
    return this.fastService.findByFaculty(id);
  }

  @Post()
  @UseGuards(StaffGuard)
  async create(@Body() data: any): Promise<any> {
    return this.fastService.create(data);
  }

  @Delete(':id')
  @UseGuards(StaffGuard)
  async delete(@Param('id') id: string): Promise<any> {
    return this.fastService.delete(id);
  }
}
