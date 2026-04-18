import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AdmissionsService } from './admissions.service';
import { JwtAuthGuard } from '../auth/guards';
import { Public } from '../decorators/public.decorator';

@Controller('admissions')
@UseGuards(JwtAuthGuard)
export class AdmissionsController {
  constructor(private admissionsService: AdmissionsService) { }

  @Get()
  async findAll() {
    return this.admissionsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.admissionsService.findOne(id);
  }

  @Post()
  async create(@Body() body: any) {
    return this.admissionsService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.admissionsService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.admissionsService.remove(id);
  }
}
