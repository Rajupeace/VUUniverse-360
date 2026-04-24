import { DynamicModule, Module, Logger, OnModuleDestroy } from '@nestjs/common';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
// Dynamic require for MongoMemoryServer to avoid production build errors

@Module({})
export class DatabaseModule implements OnModuleDestroy {
  private static readonly logger = new Logger(DatabaseModule.name);
  private static mongod: any | null = null;

  static async forRootAsync(): Promise<DynamicModule> {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb+srv://bobbyteja4_db_user:4ZltK5qmHHCxuFt6@cluster0.im2uv.mongodb.net/fbn_xai_system?appName=Cluster0';
    
    // Check if we should use memory server
    const useMemoryServer = process.env.USE_MEMORY_DB === 'true';
    
    if (useMemoryServer) {
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
        ],
        exports: [MongooseModule],
      };
    }

    // Try to connect to real MongoDB
    const mongooseOptions: MongooseModuleOptions = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 300000,
      connectTimeoutMS: 5000,
      maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE || '500'),
      minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE || '20'),
      maxIdleTimeMS: 10000,
      retryWrites: true,
      family: 4,
    };

    return {
      module: DatabaseModule,
      imports: [
        ConfigModule,
        MongooseModule.forRoot(mongoUri, mongooseOptions),
      ],
      exports: [MongooseModule],
    };
  }

  async onModuleDestroy() {
    if (DatabaseModule.mongod) {
      await DatabaseModule.mongod.stop();
      DatabaseModule.logger.log('🛑 MongoDB Memory Server stopped');
    }
  }
}
