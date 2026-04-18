import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/guards';
import { Public } from '../decorators/public.decorator';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private coursesService: CoursesService) { }

  @Post()
  async createCourse(@Body() body: any): Promise<any> {
    return this.coursesService.createCourse(body);
  }

  @Public()
  @Get()
  async getCourses(): Promise<any[]> {
    return this.coursesService.getCourses();
  }

  @Put(':id')
  async updateCourse(@Param('id') id: string, @Body() body: any): Promise<any> {
    return this.coursesService.updateCourse(id, body);
  }

  @Delete(':id')
  async deleteCourse(@Param('id') id: string): Promise<any> {
    return this.coursesService.deleteCourse(id);
  }
}
