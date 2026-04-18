import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { Schedule, ScheduleSchema } from '../schemas/schedule.schema';
import { Schedule as ScheduleEntity } from '../entities/schedule.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Schedule.name, schema: ScheduleSchema }]),
    TypeOrmModule.forFeature([ScheduleEntity]),
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService, MongooseModule, TypeOrmModule],
})
export class ScheduleModule { }
