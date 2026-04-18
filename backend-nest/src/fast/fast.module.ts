import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FastController } from './fast.controller';
import { FastService } from './fast.service';
import { Fast, FastSchema } from '../schemas/fast.schema';
import { Assignment as AssignmentEntity } from '../entities/assignment.entity';
import { SseModule } from '../sse/sse.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Fast.name, schema: FastSchema }]),
    TypeOrmModule.forFeature([AssignmentEntity]),
    SseModule,
  ],
  controllers: [FastController],
  providers: [FastService],
  exports: [FastService, MongooseModule, TypeOrmModule],
})
export class FastModule { }
