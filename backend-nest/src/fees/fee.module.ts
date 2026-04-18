import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeeController } from './fee.controller';
import { FeeService } from './fee.service';
import { Fee, FeeSchema } from '../schemas/fee.schema';
import { Fee as FeeEntity } from '../entities/fee.entity';
import { SseModule } from '../sse/sse.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Fee.name, schema: FeeSchema }]),
    TypeOrmModule.forFeature([FeeEntity]),
    SseModule,
  ],
  controllers: [FeeController],
  providers: [FeeService],
  exports: [FeeService, MongooseModule, TypeOrmModule],
})
export class FeeModule { }
