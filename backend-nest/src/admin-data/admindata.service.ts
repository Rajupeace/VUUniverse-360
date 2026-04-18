import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class AdminDataService {
  constructor(@InjectConnection() private readonly connection: Connection) { }

  private checkDb() {
    if (this.connection.readyState !== 1) throw new ServiceUnavailableException('Database not connected');
  }

  async getCollections(): Promise<string[]> {
    this.checkDb();
    const collections = await this.connection.db.listCollections().toArray();
    return collections.map(c => c.name);
  }

  async getStats(): Promise<any> {
    this.checkDb();
    const stats: any = {};
    const collections = await this.getCollections();
    for (const name of collections) {
      stats[name] = await this.connection.db.collection(name).countDocuments();
    }
    return stats;
  }

  async dropCollection(name: string): Promise<any> {
    this.checkDb();
    return this.connection.db.collection(name).drop();
  }
}
