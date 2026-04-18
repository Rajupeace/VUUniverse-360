import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransportController } from './transport.controller';
import { TransportService } from './transport.service';
import { Transport, TransportSchema } from '../schemas/transport.schema';
import { Transport as TransportEntity } from '../entities/transport.entity';
import { SseModule } from '../sse/sse.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Transport.name, schema: TransportSchema }]),
    TypeOrmModule.forFeature([TransportEntity]),
    SseModule,
  ],
  controllers: [TransportController],
  providers: [TransportService],
  exports: [TransportService, MongooseModule, TypeOrmModule],
})
export class TransportModule { }
