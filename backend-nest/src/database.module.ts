import { DynamicModule, Module, Logger } from '@nestjs/common';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({})
export class DatabaseModule {
  private static readonly logger = new Logger(DatabaseModule.name);

  static async forRootAsync(): Promise<DynamicModule> {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb+srv://bobbyteja4_db_user:VuUniverse360SecurePass2026!@cluster0.im2uv.mongodb.net/fbn_xai_system?appName=Cluster0';
    
    const mongooseOptions: MongooseModuleOptions = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 300000,
      connectTimeoutMS: 10000,
      maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE || '100'),
      minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE || '10'),
      maxIdleTimeMS: 10000,
      retryWrites: true,
      autoIndex: true,                  // Auto-build schema indexes on connect
      heartbeatFrequencyMS: 5000,       // Faster failover detection
      compressors: ['zlib'],            // Compress wire traffic for speed
    };

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
}
