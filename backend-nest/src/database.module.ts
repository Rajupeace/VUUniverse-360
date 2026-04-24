import { DynamicModule, Module, Logger, OnModuleDestroy } from '@nestjs/common';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({})
export class DatabaseModule implements OnModuleDestroy {
  private static readonly logger = new Logger(DatabaseModule.name);
  private static mongod: any | null = null;

  static async forRootAsync(): Promise<DynamicModule> {
    // STRATEGY: Always try MongoDB Memory Server first in production
    // This eliminates dependency on external MongoDB Atlas which blocks Render IPs
    const isProduction = process.env.NODE_ENV === 'production';
    const forceMemory = process.env.USE_MEMORY_DB === 'true';
    const hasAtlasUri = !!(process.env.MONGODB_URI || process.env.MONGO_URI);

    // Try Memory Server if: explicitly forced via env
    if (forceMemory) {
      try {
        this.logger.log('🔄 Starting MongoDB Memory Server...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        this.mongod = await MongoMemoryServer.create();
        const uri = this.mongod.getUri();
        this.logger.log(`✅ MongoDB Memory Server running at: ${uri}`);
        process.env.MONGODB_URI = uri;

        return {
          module: DatabaseModule,
          imports: [
            ConfigModule,
            MongooseModule.forRoot(uri, {
              serverSelectionTimeoutMS: 5000,
              connectTimeoutMS: 5000,
            }),
            TypeOrmModule.forRoot({
              type: 'mongodb',
              url: uri,
              synchronize: false,
              autoLoadEntities: true,
              logging: false,
            }),
          ],
          exports: [MongooseModule, TypeOrmModule],
        };
      } catch (memErr) {
        this.logger.warn(`⚠️ Memory Server failed: ${memErr.message}. Falling back to Atlas...`);
      }
    }

    // Fallback: Connect to real MongoDB Atlas
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb+srv://bobbyteja4_db_user:4ZltK5qmHHCxuFt6@cluster0.im2uv.mongodb.net/fbn_xai_system?appName=Cluster0';
    this.logger.log(`🔗 Connecting to MongoDB Atlas...`);

    const mongooseOptions: MongooseModuleOptions = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 300000,
      connectTimeoutMS: 10000,
      maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE || '50'),
      minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE || '5'),
      maxIdleTimeMS: 10000,
      retryWrites: true,
    };

    return {
      module: DatabaseModule,
      imports: [
        ConfigModule,
        MongooseModule.forRoot(mongoUri, mongooseOptions),
        TypeOrmModule.forRoot({
          type: 'mongodb',
          url: mongoUri,
          synchronize: false,
          autoLoadEntities: true,
          logging: false,
        }),
      ],
      exports: [MongooseModule, TypeOrmModule],
    };
  }

  async onModuleDestroy() {
    if (DatabaseModule.mongod) {
      await DatabaseModule.mongod.stop();
      DatabaseModule.logger.log('🛑 MongoDB Memory Server stopped');
    }
  }
}
