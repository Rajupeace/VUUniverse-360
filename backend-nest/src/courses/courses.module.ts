import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { Course, CourseSchema } from '../schemas/course.schema';
import { Course as CourseEntity } from '../entities/course.entity';
import { SseModule } from '../sse/sse.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }]),
        TypeOrmModule.forFeature([CourseEntity]),
        SseModule,
    ],
    controllers: [CoursesController],
    providers: [CoursesService],
    exports: [CoursesService, MongooseModule, TypeOrmModule],
})
export class CoursesModule { }
