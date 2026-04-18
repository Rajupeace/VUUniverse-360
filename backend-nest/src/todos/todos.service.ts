import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo, TodoDocument } from '../schemas/todo.schema';
import { Todo as TodoEntity } from '../entities/todo.entity';
import { SseService } from '../sse/sse.service';

@Injectable()
export class TodosService {
    constructor(
        @InjectModel(Todo.name) private todoModel: Model<TodoDocument>,
        @InjectRepository(TodoEntity) private todoRepo: Repository<TodoEntity>,
        private sseService: SseService,
    ) { }

    async findByUser(userId: string, target: string): Promise<any[]> {
        // Get from MySQL
        const sqlTodos = await this.todoRepo.find({ where: { userId } });

        // Get from MongoDB
        const mongoTodos = await this.todoModel.find({
            $or: [
                { userId },
                { target: 'all' },
                { target }
            ]
        }).sort({ createdAt: -1 }).lean();

        // Combine (basic deduplication could be added here if needed)
        const combined = [...sqlTodos.map(t => ({ ...t, source: 'mysql' })), ...mongoTodos.map(t => ({ ...t, source: 'mongodb' }))];
        return combined;
    }

    async create(data: any): Promise<any> {
        // Write to MySQL
        try {
            const sqlTodo = this.todoRepo.create({
                userId: data.userId,
                title: data.title,
                description: data.description,
                completed: data.completed || false,
                priority: data.priority || 'medium',
                dueDate: data.dueDate,
                category: data.category,
            });
            await this.todoRepo.save(sqlTodo);
        } catch (e) {
            console.warn(`MySQL Todo Create Error: ${e.message}`);
        }

        // Write to MongoDB
        const todo = new this.todoModel(data);
        const saved = await todo.save();
        this.sseService.broadcast({ resource: 'todos', action: 'create', data: saved });
        return saved;
    }

    async update(id: string, data: any): Promise<any> {
        // Try MongoDB find by ID (most common from frontend)
        const todo = await this.todoModel.findByIdAndUpdate(id, { $set: data }, { new: true });

        // If not found in Mongo, it might be a MySQL ID (numeric)
        if (!todo && !isNaN(Number(id))) {
            await this.todoRepo.update(Number(id), data);
            return this.todoRepo.findOneBy({ id: Number(id) });
        }

        if (!todo) throw new NotFoundException('Todo not found');
        this.sseService.broadcast({ resource: 'todos', action: 'update', data: { id } });
        return todo;
    }

    async delete(id: string): Promise<any> {
        let deleted = false;

        // Try MongoDB
        const result = await this.todoModel.findByIdAndDelete(id);
        if (result) deleted = true;

        // Try MySQL
        if (!deleted && !isNaN(Number(id))) {
            const sqlResult = await this.todoRepo.delete(Number(id));
            if (sqlResult.affected > 0) deleted = true;
        }

        if (!deleted) throw new NotFoundException('Todo not found');
        this.sseService.broadcast({ resource: 'todos', action: 'delete', data: { id } });
        return { success: true };
    }

    async toggle(id: string): Promise<any> {
        // Try MongoDB
        let todo: any = await this.todoModel.findById(id);
        if (todo) {
            const saved = await todo.save();
            this.sseService.broadcast({ resource: 'todos', action: 'update', data: { id, completed: saved.completed } });
            return saved;
        }

        // Try MySQL
        if (!isNaN(Number(id))) {
            const sqlTodo = await this.todoRepo.findOneBy({ id: Number(id) });
            if (sqlTodo) {
                sqlTodo.completed = !sqlTodo.completed;
                return this.todoRepo.save(sqlTodo);
            }
        }

        throw new NotFoundException('Todo not found');
    }
}
