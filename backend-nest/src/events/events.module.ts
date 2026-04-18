import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Event, EventSchema } from '../schemas/event.schema';
import { Event as EventEntity } from '../entities/event.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    TypeOrmModule.forFeature([EventEntity]),
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService, MongooseModule, TypeOrmModule],
})
export class EventsModule { }
