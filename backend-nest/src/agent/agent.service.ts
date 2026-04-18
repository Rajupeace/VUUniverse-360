import { Injectable, NotFoundException, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { SseService } from '../sse/sse.service';

@Injectable()
export class AgentService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private sseService: SseService,
  ) { }

  private checkDb() {
    if (this.connection.readyState !== 1) throw new ServiceUnavailableException('Database not connected');
  }

  async reloadKnowledge(): Promise<any> {
    try {
      const kbDir = path.join(process.cwd(), '..', 'knowledge');
      if (!fs.existsSync(kbDir)) throw new NotFoundException('Knowledge directory not found');

      const files = fs.readdirSync(kbDir).filter(f => f.endsWith('.js') || f.endsWith('.json') || f.endsWith('.md'));
      const cleared: string[] = [];

      files.forEach(f => {
        const full = path.join(kbDir, f);
        try {
          const reqPath = require.resolve(full);
          if (require.cache[reqPath]) {
            delete require.cache[reqPath];
            cleared.push(f);
          }
        } catch (e) { /* ignore */ }
      });

      // Re-require main knowledge modules in the background if needed
      const reloaded: string[] = [];
      ['studentKnowledge.js', 'facultyKnowledge.js', 'adminKnowledge.js'].forEach(fname => {
        const full = path.join(kbDir, fname);
        try {
          require(full);
          reloaded.push(fname);
        } catch (e) { /* ignore */ }
      });

      this.sseService.broadcast({ resource: 'knowledge', action: 'reload', files: cleared });
      return { ok: true, reloaded, cleared };
    } catch (err) {
      console.error('Agent reload error:', err);
      throw new InternalServerErrorException(err.message);
    }
  }

  async updateKnowledgeToDb(): Promise<any> {
    this.checkDb();
    try {
      const kbDir = path.join(process.cwd(), '..', 'knowledge');
      const filesToLoad = ['studentKnowledge.js', 'facultyKnowledge.js', 'adminKnowledge.js'];
      const loaded: any = {};

      for (const fname of filesToLoad) {
        const full = path.join(kbDir, fname);
        try {
          const resolved = require.resolve(full);
          if (require.cache[resolved]) delete require.cache[resolved];
          loaded[fname.replace(/\.js$/, '')] = require(full);
        } catch (e) { /* ignore missing */ }
      }

      const coll = this.connection.collection('agentKnowledge');
      const now = new Date();
      const updateDoc = { $set: { knowledge: loaded, updatedAt: now } };
      await coll.updateOne({ name: 'agent_knowledge' }, updateDoc, { upsert: true });

      this.sseService.broadcast({ resource: 'knowledge', action: 'db-upsert', timestamp: now });
      return { ok: true, loaded: Object.keys(loaded), timestamp: now };
    } catch (err) {
      console.error('update-knowledge error:', err);
      throw new InternalServerErrorException(err.message);
    }
  }
}
