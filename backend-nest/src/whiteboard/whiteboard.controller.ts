import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { WhiteboardService } from './whiteboard.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('whiteboard')
@UseGuards(JwtAuthGuard)
export class WhiteboardController {
  constructor(private whiteboardService: WhiteboardService) { }

  @Get('user/:id')
  async findAll(@Param('id') userId: string): Promise<any[]> {
    return this.whiteboardService.findAll(userId);
  }

  @Get('faculty')
  async findFacultyWhiteboards(): Promise<any[]> {
    return this.whiteboardService.findAll(null); 
  }

  @Get('student/:year/:branch/:section')
  async findStudentWhiteboards(
    @Param('year') year: string, 
    @Param('branch') branch: string, 
    @Param('section') section: string
  ): Promise<any[]> {
    // Basic implementation: it can be expanded in whiteboardService if needed
    return this.whiteboardService.findAll(null); 
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    return this.whiteboardService.findOne(id);
  }

  @Post()
  async create(@Body() data: any): Promise<any> {
    return this.whiteboardService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any): Promise<any> {
    return this.whiteboardService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<any> {
    return this.whiteboardService.delete(id);
  }
}
