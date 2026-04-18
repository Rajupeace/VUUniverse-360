import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { StudentNotesService } from './student-notes.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('student-notes')
@UseGuards(JwtAuthGuard)
export class StudentNotesController {
    constructor(private notesService: StudentNotesService) { }

    @Get('user/:rollNumber')
    async findAll(@Param('rollNumber') rollNumber: string): Promise<any[]> {
        return this.notesService.findAll(rollNumber);
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<any> {
        return this.notesService.findOne(id);
    }

    @Post()
    async create(@Body() data: any): Promise<any> {
        return this.notesService.create(data);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() data: any): Promise<any> {
        return this.notesService.update(id, data);
    }

    @Delete(':id')
    async delete(@Param('id') id: string): Promise<any> {
        return this.notesService.delete(id);
    }
}
