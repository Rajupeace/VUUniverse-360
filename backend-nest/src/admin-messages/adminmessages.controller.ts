import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AdminMessagesService } from './adminmessages.service';
import { JwtAuthGuard } from '../auth/guards';
import { Public } from '../decorators/public.decorator';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class AdminMessagesController {
  constructor(private adminMessagesService: AdminMessagesService) { }

  @Get()
  async findAll(@Query() query: any): Promise<any[]> {
    return this.adminMessagesService.findActive(query);
  }

  @Get('active')
  async findActive(@Query() query: any): Promise<any[]> {
    return this.adminMessagesService.findActive(query);
  }

  @Public()
  @Get('inbox/:email')
  async getInbox(@Param('email') email: string): Promise<any[]> {
    return this.adminMessagesService.findInbox(email);
  }

  @Post()
  async create(@Body() data: any): Promise<any> {
    return this.adminMessagesService.create(data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<any> {
    return this.adminMessagesService.delete(id);
  }

  @Post('student-feed')
  async getStudentFeed(@Body() student: any): Promise<any[]> {
    return this.adminMessagesService.findByStudent(student);
  }
}

