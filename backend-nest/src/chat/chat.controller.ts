import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) { }

  @Post()
  async generateChat(@Body() data: any): Promise<any> {
    return this.chatService.generateResponse(data);
  }

  @Get('history/:userId')
  async getHistoryByParam(
    @Param('userId') userId: string,
    @Query('limit') limit: number = 50
  ): Promise<any[]> {
    return this.chatService.findByUser(userId, limit);
  }

  @Get('history')
  async getHistoryByQuery(
    @Query('userId') userId: string,
    @Query('limit') limit: number = 50
  ): Promise<any[]> {
    return this.chatService.findByUser(userId, limit);
  }

  @Post('save')
  async saveChat(@Body() data: any): Promise<any> {
    return this.chatService.saveChat(data);
  }

  @Delete('clear/:userId')
  async clearHistory(@Param('userId') userId: string): Promise<any> {
    return this.chatService.clearHistory(userId);
  }
}
