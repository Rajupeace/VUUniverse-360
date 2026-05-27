import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) { }

  @Post()
  async generateChat(@Body() data: any): Promise<any> {
    try {
      console.log('[Chat Controller] Received message:', data.message, 'from role:', data.role);
      const response = await this.chatService.generateResponse(data);
      console.log('[Chat Controller] Generated response successfully');
      return response;
    } catch (error) {
      console.error('[Chat Controller] Error generating response:', error.message);
      throw new HttpException(
        { response: 'Unable to generate response. Please try again.' },
        HttpStatus.OK
      );
    }
  }

  @Get('history/:userId')
  @UseGuards(JwtAuthGuard)
  async getHistoryByParam(
    @Param('userId') userId: string,
    @Query('limit') limit: number = 50
  ): Promise<any[]> {
    return this.chatService.findByUser(userId, limit);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getHistoryByQuery(
    @Query('userId') userId: string,
    @Query('limit') limit: number = 50
  ): Promise<any[]> {
    return this.chatService.findByUser(userId, limit);
  }

  @Post('save')
  @UseGuards(JwtAuthGuard)
  async saveChat(@Body() data: any): Promise<any> {
    return this.chatService.saveChat(data);
  }

  @Delete('clear/:userId')
  @UseGuards(JwtAuthGuard)
  async clearHistory(@Param('userId') userId: string): Promise<any> {
    return this.chatService.clearHistory(userId);
  }

  @Post('reload')
  async reloadKnowledge(): Promise<any> {
    try {
      // Reload knowledge bases in the service
      await this.chatService.reloadKnowledge();
      return { success: true, message: 'Knowledge base reloaded successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
