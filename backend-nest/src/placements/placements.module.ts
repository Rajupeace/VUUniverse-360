import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlacementsController } from './placements.controller';
import { PlacementsService } from './placements.service';
import { Placement, PlacementSchema } from '../schemas/placement.schema';
import { Placement as PlacementEntity } from '../entities/placement.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Placement.name, schema: PlacementSchema }]),
    TypeOrmModule.forFeature([PlacementEntity]),
  ],
  controllers: [PlacementsController],
  providers: [PlacementsService],
  exports: [PlacementsService, MongooseModule, TypeOrmModule],
})
export class PlacementsModule { }
