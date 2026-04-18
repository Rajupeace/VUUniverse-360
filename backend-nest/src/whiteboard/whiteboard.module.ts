import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhiteboardController } from './whiteboard.controller';
import { WhiteboardService } from './whiteboard.service';
import { Whiteboard, WhiteboardSchema } from '../schemas/whiteboard.schema';
import { Whiteboard as WhiteboardEntity } from '../entities/whiteboard.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Whiteboard.name, schema: WhiteboardSchema }]),
    TypeOrmModule.forFeature([WhiteboardEntity]),
  ],
  controllers: [WhiteboardController],
  providers: [WhiteboardService],
  exports: [WhiteboardService, MongooseModule, TypeOrmModule],
})
export class WhiteboardModule { }
