import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { HostelService } from './hostel.service';
import { JwtAuthGuard, StaffGuard } from '../auth/guards';

@Controller('hostel')
@UseGuards(JwtAuthGuard)
export class HostelController {
  constructor(private hostelService: HostelService) { }

  @Get()
  @UseGuards(StaffGuard)
  async findAll(@Query() query: any): Promise<any[]> {
    return this.hostelService.findAll(query);
  }

  @Get('student/:id')
  async findByStudent(@Param('id') id: string): Promise<any> {
    return this.hostelService.findByStudent(id);
  }

  @Post()
  @UseGuards(StaffGuard)
  async create(@Body() data: any): Promise<any> {
    return this.hostelService.create(data);
  }

  @Put(':id')
  @UseGuards(StaffGuard)
  async update(@Param('id') id: string, @Body() data: any): Promise<any> {
    return this.hostelService.update(id, data);
  }

  @Put(':id/status')
  @UseGuards(StaffGuard)
  async changeStatus(@Param('id') id: string, @Body() body: { status: string }): Promise<any> {
    return this.hostelService.changeStatus(id, body.status);
  }

  @Delete(':id')
  @UseGuards(StaffGuard)
  async delete(@Param('id') id: string): Promise<any> {
    return this.hostelService.delete(id);
  }
}
