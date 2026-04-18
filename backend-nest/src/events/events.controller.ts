import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guards';
import { Public } from '../decorators/public.decorator';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private eventsService: EventsService) { }

  @Get()
  async findAll(@Query() query: any): Promise<any[]> {
    return this.eventsService.findAll(query);
  }

  @Public()
  @Get('upcoming')
  async getUpcoming(): Promise<any[]> {
    return this.eventsService.getUpcoming();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    return this.eventsService.findOne(id);
  }

  @Post()
  async create(@Body() data: any): Promise<any> {
    return this.eventsService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any): Promise<any> {
    return this.eventsService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<any> {
    return this.eventsService.delete(id);
  }
}
