import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('exams')
@UseGuards(JwtAuthGuard)
export class ExamsController {
  constructor(private examsService: ExamsService) { }

  @Get()
  async findAll(@Query() query: any): Promise<any[]> {
    return this.examsService.findAll(query);
  }

  @Get('faculty/:id')
  async findByFaculty(@Param('id') id: string): Promise<any[]> {
    return this.examsService.findAll({ facultyId: id });
  }

  @Get('student')
  async findByStudentTarget(@Query() query: any): Promise<any[]> {
    // Return exams that are meant for a student (based on branch/year/section query params)
    return this.examsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    return this.examsService.findOne(id);
  }

  @Post()
  async create(@Body() data: any): Promise<any> {
    return this.examsService.create(data);
  }

  @Post('submit')
  async submitResult(@Body() data: any): Promise<any> {
    return this.examsService.submitResult(data);
  }

  @Get('student/:id/results')
  async getStudentResults(@Param('id') id: string): Promise<any[]> {
    return this.examsService.getResultsByStudent(id);
  }

  @Get('results/:examTitle')
  async getExamResults(@Param('examTitle') title: string): Promise<any[]> {
    return this.examsService.getResultsByExam(title);
  }
}
