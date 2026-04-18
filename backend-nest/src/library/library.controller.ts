import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { LibraryService } from './library.service';
import { JwtAuthGuard, StaffGuard } from '../auth/guards';

@Controller('library')
@UseGuards(JwtAuthGuard)
export class LibraryController {
  constructor(private libraryService: LibraryService) { }

  @Get()
  @UseGuards(StaffGuard)
  async findAll(@Query() query: any): Promise<any[]> {
    return this.libraryService.findAll(query);
  }

  @Get('overdue')
  @UseGuards(StaffGuard)
  async getOverdue(): Promise<any[]> {
    return this.libraryService.getOverdue();
  }

  @Get('student/:id')
  async findByStudent(@Param('id') id: string): Promise<any[]> {
    return this.libraryService.findByStudent(id);
  }

  @Post('issue')
  @UseGuards(StaffGuard)
  async issueBook(@Body() data: any): Promise<any> {
    return this.libraryService.issueBook(data);
  }

  @Put('return/:id')
  @UseGuards(StaffGuard)
  async returnBook(@Param('id') id: string): Promise<any> {
    return this.libraryService.returnBook(id);
  }
}
