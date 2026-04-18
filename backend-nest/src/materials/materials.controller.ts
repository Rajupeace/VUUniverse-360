import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { JwtAuthGuard } from '../auth/guards';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../decorators/roles.decorator';

@Controller('materials')
export class MaterialsController {
  constructor(private materialsService: MaterialsService) { }

  @Get()
  async findAll(@Query() query: any): Promise<any[]> {
    return this.materialsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    return this.materialsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadMaterial(
    @Body() body: any,
    @UploadedFile() file: any,
    @Request() req: any
  ): Promise<any> {
    return this.materialsService.uploadMaterial(body, file, req.user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFile() file: any,
    @Request() req: any
  ): Promise<any> {
    return this.materialsService.update(id, body, file, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Request() req: any): Promise<any> {
    return this.materialsService.remove(id, req.user);
  }

  @Post(':id/like')
  async like(@Param('id') id: string): Promise<any> {
    return this.materialsService.like(id);
  }
}
