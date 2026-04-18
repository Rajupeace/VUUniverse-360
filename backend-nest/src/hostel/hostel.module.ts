import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HostelController } from './hostel.controller';
import { HostelService } from './hostel.service';
import { Hostel, HostelSchema } from '../schemas/hostel.schema';
import { Hostel as HostelEntity } from '../entities/hostel.entity';
import { SseModule } from '../sse/sse.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Hostel.name, schema: HostelSchema }]),
    TypeOrmModule.forFeature([HostelEntity]),
    SseModule,
  ],
  controllers: [HostelController],
  providers: [HostelService],
  exports: [HostelService, MongooseModule, TypeOrmModule],
})
export class HostelModule { }
