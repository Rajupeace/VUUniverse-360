import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { TransportService } from './transport.service';
import { JwtAuthGuard, StaffGuard } from '../auth/guards';

@Controller('transport')
@UseGuards(JwtAuthGuard)
export class TransportController {
  constructor(private transportService: TransportService) { }

  @Get()
  @UseGuards(StaffGuard)
  async findAll(@Query() query: any): Promise<any[]> {
    return this.transportService.findAll(query);
  }

  @Get('student/:id')
  async findByStudent(@Param('id') id: string): Promise<any> {
    return this.transportService.findByStudent(id);
  }

  @Get('route/:route')
  async getRouteInfo(@Param('route') route: string): Promise<any[]> {
    return this.transportService.getRouteInfo(route);
  }

  @Post()
  @UseGuards(StaffGuard)
  async create(@Body() data: any): Promise<any> {
    return this.transportService.create(data);
  }

  @Put(':id')
  @UseGuards(StaffGuard)
  async update(@Param('id') id: string, @Body() data: any): Promise<any> {
    return this.transportService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(StaffGuard)
  async delete(@Param('id') id: string): Promise<any> {
    return this.transportService.delete(id);
  }
}
