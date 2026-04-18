import { Controller, Get, Post, Put, Delete, Patch, Param, Body, Query, UseGuards, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards';
import { Public } from '../decorators/public.decorator';
import { StudentNotesService } from './studentnotes.service';

@Controller('student-notes')
@UseGuards(JwtAuthGuard)
export class StudentNotesController {
  constructor(private studentnotesService: StudentNotesService) {}

  @Get()
  async getNotes(@Query() query: any): Promise<any[]> {
    return this.studentnotesService.findAll(query);
  }

  @Post()
  async createNote(@Body() body: any) {
    return this.studentnotesService.create(body);
  }

  @Put(':id')
  async updateNote(@Param('id') id: string, @Body() body: any) {
    return this.studentnotesService.update(id, body);
  }

  @Delete(':id')
  async deleteNote(@Param('id') id: string) {
    return this.studentnotesService.remove(id);
  }
}
