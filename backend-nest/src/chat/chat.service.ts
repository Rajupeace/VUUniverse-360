import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';
import { Chat, ChatDocument } from '../schemas/chat.schema';
import { ChatHistory as ChatEntity } from '../entities/chat-history.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectRepository(ChatEntity) private chatRepo: Repository<ChatEntity>,
    @InjectConnection() private readonly connection: Connection,
  ) { }

  async findByUser(userId: string, limit = 50): Promise<any[]> {
    // Try SQL first
    const sqlChats = await this.chatRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit
    });
    if (sqlChats.length > 0) return sqlChats.map(c => ({ ...c, id: c.id.toString(), source: 'mysql' }));

    if (this.connection.readyState !== 1) return [];
    return this.chatModel.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  }

  async saveChat(data: any): Promise<any> {
    // MySQL
    try {
      const sqlChat = this.chatRepo.create({
        userId: String(data.userId || 'anonymous'),
        message: String(data.message || data.text || ''),
        role: String(data.role || 'user'),
      });
      await this.chatRepo.save(sqlChat);
    } catch (e) { console.warn(`MySQL Chat Save Error: ${e.message}`); }

    // MongoDB
    const chat = new this.chatModel({
      ...data,
      timestamp: new Date()
    });
    return chat.save();
  }

  private knowledgeBase: any = null;

  private loadKnowledge() {
    if (this.knowledgeBase) return;
    try {
      const kbDir = path.join(process.cwd(), '..', 'knowledge');
      if (!fs.existsSync(kbDir)) {
          console.warn('⚠️ Knowledge directory not found at:', kbDir);
          this.knowledgeBase = {};
          return;
      }
      const files = fs.readdirSync(kbDir).filter(f => f.endsWith('.js'));
      this.knowledgeBase = {};
      files.forEach(f => {
        try {
          const fullPath = path.join(kbDir, f);
          delete require.cache[require.resolve(fullPath)]; // Clear cache for dynamic reload
          const content = require(fullPath);
          Object.assign(this.knowledgeBase, content);
        } catch (e) { }
      });
    } catch (e) { this.knowledgeBase = {}; }
  }

  async generateResponse(data: any): Promise<any> {
    const userMessage = data.message || data.text || '';
    
    // 1. Try Python AI Agent (Port 8000)
    try {
      const axios = require('axios');
      const aiResponse = await axios.post('http://localhost:8000/chat', {
        message: userMessage,
        role: data.role || 'student',
        user_id: String(data.userId || data.sid || 'guest'),
        user_name: data.user_name || 'Student'
      }, { timeout: 10000 });

      if (aiResponse.data && aiResponse.data.response) {
        const response = aiResponse.data.response;
        // Save to history
        await this.saveChat({ ...data, response, timestamp: new Date() });
        return { response };
      }
    } catch (e) {
      console.warn(`[AI 🛰️] Python Agent unreachable or error: ${e.message}. Falling back to local knowledge base.`);
    }

    // 2. Fallback to Local Knowledge Base
    this.loadKnowledge();
    const message = (userMessage).toLowerCase();
    let response = "I'm sorry, I don't have specific information on that topic. Try asking about Data Structures, Networks, or your Syllabus!";

    const keys = Object.keys(this.knowledgeBase);
    for (const key of keys) {
      if (key === 'default') continue;
      const entry = this.knowledgeBase[key];
      if (entry.keywords && entry.keywords.some(k => message.includes(k.toLowerCase()))) {
        response = typeof entry.response === 'function' ? entry.response(message) : entry.response;
        break;
      }
    }

    if (response === "I'm sorry..." && this.knowledgeBase.default) {
       response = typeof this.knowledgeBase.default.response === 'function' ? this.knowledgeBase.default.response(message) : this.knowledgeBase.default.response;
    }

    // Save to history
    await this.saveChat({ ...data, response, timestamp: new Date() });
    return { response };
  }

  async clearHistory(userId: string): Promise<any> {
    // MySQL
    try {
      await this.chatRepo.delete({ userId });
    } catch (e) { }

    // MongoDB
    if (this.connection.readyState === 1) {
      return this.chatModel.deleteMany({ userId });
    }
    return { success: true };
  }
}
