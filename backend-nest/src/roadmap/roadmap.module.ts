import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoadmapController } from './roadmap.controller';
import { RoadmapService } from './roadmap.service';
import { Roadmap as RoadmapSchema, RoadmapSchema as RoadmapMongooseSchema } from '../schemas/roadmap.schema';
import { Roadmap as RoadmapEntity } from '../entities/roadmap.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RoadmapSchema.name, schema: RoadmapMongooseSchema }]),
    TypeOrmModule.forFeature([RoadmapEntity]),
  ],
  controllers: [RoadmapController],
  providers: [RoadmapService],
  exports: [RoadmapService],
})
export class RoadmapModule {}
