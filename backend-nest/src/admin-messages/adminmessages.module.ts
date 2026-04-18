import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminMessagesController } from './adminmessages.controller';
import { AdminMessagesService } from './adminmessages.service';
import { Message, MessageSchema } from '../schemas/message.schema';
import { AdminMessage as AdminMessageEntity } from '../entities/admin-message.entity';
import { SseModule } from '../sse/sse.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    TypeOrmModule.forFeature([AdminMessageEntity]),
    SseModule,
  ],
  controllers: [AdminMessagesController],
  providers: [AdminMessagesService],
  exports: [AdminMessagesService, MongooseModule, TypeOrmModule],
})
export class AdminMessagesModule { }
