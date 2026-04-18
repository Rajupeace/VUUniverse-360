import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { MaterialsController } from './materials.controller';
import { MaterialsService } from './materials.service';
import { Material, MaterialSchema } from '../schemas/material.schema';
import { Course, CourseSchema } from '../schemas/course.schema';
import { Faculty, FacultySchema } from '../schemas/faculty.schema';
import { Message, MessageSchema } from '../schemas/message.schema';
import { Material as MaterialEntity } from '../entities/material.entity';
import { Course as CourseEntity } from '../entities/course.entity';
import { Faculty as FacultyEntity } from '../entities/faculty.entity';
import { SseModule } from '../sse/sse.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Material.name, schema: MaterialSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Faculty.name, schema: FacultySchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    TypeOrmModule.forFeature([MaterialEntity, CourseEntity, FacultyEntity]),
    MulterModule.register({
      dest: '../uploads',
    }),
    SseModule,
  ],
  controllers: [MaterialsController],
  providers: [MaterialsService],
  exports: [MaterialsService, MongooseModule, TypeOrmModule],
})
export class MaterialsModule { }
