import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { AcademicPulseService } from './academicpulse.service';
import { JwtAuthGuard, StaffGuard } from '../auth/guards';
import { Public } from '../decorators/public.decorator';

@Controller('academic-pulse')
@UseGuards(JwtAuthGuard)
export class AcademicPulseController {
  constructor(private pulseService: AcademicPulseService) { }

  @Public()
  @Get()
  async findAll(): Promise<any[]> {
    return this.pulseService.findAll();
  }

  @Post()
  @UseGuards(StaffGuard)
  async create(@Body() data: any): Promise<any> {
    return this.pulseService.create(data);
  }

  @Delete(':id')
  @UseGuards(StaffGuard)
  async delete(@Param('id') id: string): Promise<any> {
    return this.pulseService.delete(id);
  }
}
