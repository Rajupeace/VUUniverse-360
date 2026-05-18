import { DynamicModule, Module, Logger, OnModuleDestroy } from '@nestjs/common';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({})
export class DatabaseModule implements OnModuleDestroy {
  private static readonly logger = new Logger(DatabaseModule.name);
  private static mongod: any | null = null;

  static async forRootAsync(): Promise<DynamicModule> {
    const forceMemory = process.env.USE_MEMORY_DB === 'true';
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb+srv://bobbyteja4_db_user:4ZltK5qmHHCxuFt6@cluster0.im2uv.mongodb.net/fbn_xai_system?appName=Cluster0';
    
    let useMemory = forceMemory;

    const mongooseOptions: MongooseModuleOptions = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 300000,
      connectTimeoutMS: 10000,
      maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE || '100'),
      minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE || '10'),
      maxIdleTimeMS: 10000,
      retryWrites: true,
    };

    if (!useMemory) {
      this.logger.log(`🔍 Pre-testing MongoDB Atlas connection...`);
      try {
        const { MongoClient } = require('mongodb');
        const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 5000 });
        await client.connect();
        await client.db().command({ ping: 1 });
        await client.close();
        this.logger.log(`✅ MongoDB Atlas pre-test connection successful! Proceeding with Atlas.`);
      } catch (err) {
        this.logger.warn(`⚠️ MongoDB Atlas connection pre-test failed: ${err.message}.`);
        this.logger.warn(`🔄 Gracefully falling back to MongoDB Memory Server...`);
        useMemory = true;
      }
    }

    if (useMemory) {
      try {
        this.logger.log('🔄 Starting MongoDB Memory Server...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        this.mongod = await MongoMemoryServer.create();
        const uri = this.mongod.getUri();
        this.logger.log(`✅ MongoDB Memory Server running at: ${uri}`);

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
        this.logger.error(`❌ Memory Server failed: ${memErr.message}. Cannot start database.`);
        throw memErr;
      }
    }

    // Connect to real MongoDB Atlas
    this.logger.log(`🔗 Connecting to MongoDB Atlas...`);
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
