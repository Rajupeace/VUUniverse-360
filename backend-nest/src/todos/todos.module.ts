import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import { Todo, TodoSchema } from '../schemas/todo.schema';
import { Todo as TodoEntity } from '../entities/todo.entity';
import { SseModule } from '../sse/sse.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Todo.name, schema: TodoSchema }]),
        TypeOrmModule.forFeature([TodoEntity]),
        SseModule,
    ],
    controllers: [TodosController],
    providers: [TodosService],
    exports: [TodosService],
})
export class TodosModule { }
