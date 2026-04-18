import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Chat, ChatSchema } from '../schemas/chat.schema';
import { ChatHistory as ChatEntity } from '../entities/chat-history.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
    TypeOrmModule.forFeature([ChatEntity]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService, MongooseModule, TypeOrmModule],
})
export class ChatModule { }
