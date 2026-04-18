import { Controller, Get, Post, Body, Param, Put, Delete, Patch, Query, UseGuards } from '@nestjs/common';
import { TodosService } from './todos.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {
    constructor(private todosService: TodosService) { }

    @Get()
    async findAll(@Query() query: any): Promise<any[]> {
        return this.todosService.findByUser(query.userId || 'all', query.target || 'all');
    }

    @Get(':userId')
    async findByUser(
        @Param('userId') userId: string,
        @Query('target') target: string = 'student'
    ): Promise<any[]> {
        return this.todosService.findByUser(userId, target);
    }

    @Post()
    async create(@Body() data: any): Promise<any> {
        return this.todosService.create(data);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() data: any): Promise<any> {
        return this.todosService.update(id, data);
    }

    @Patch(':id/toggle')
    async toggle(@Param('id') id: string): Promise<any> {
        return this.todosService.toggle(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string): Promise<any> {
        return this.todosService.delete(id);
    }
}
