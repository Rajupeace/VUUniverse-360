import { Controller, Get, Post, Body, Param, Put, Query, UseGuards } from '@nestjs/common';
import { FeeService } from './fee.service';
import { JwtAuthGuard, StaffGuard } from '../auth/guards';
import { Public } from '../auth/decorators/public.decorator';

@Controller('fees')
@UseGuards(JwtAuthGuard)
export class FeeController {
  constructor(private feeService: FeeService) { }

  @Get()
  @UseGuards(StaffGuard)
  async findAll(@Query() query: any): Promise<any[]> {
    return this.feeService.findAll(query);
  }

  @Public()
  @Get('student/:id')
  async findByStudent(@Param('id') id: string): Promise<any[]> {
    return this.feeService.findByStudent(id);
  }

  @Get('stats')
  @UseGuards(StaffGuard)
  async getStats(): Promise<any> {
    return this.feeService.getStats();
  }

  @Post()
  @UseGuards(StaffGuard)
  async create(@Body() data: any): Promise<any> {
    return this.feeService.create(data);
  }

  @Put(':id/transaction')
  @UseGuards(StaffGuard)
  async addTransaction(@Param('id') id: string, @Body() body: any): Promise<any> {
    return this.feeService.addTransaction(id, body);
  }
}
