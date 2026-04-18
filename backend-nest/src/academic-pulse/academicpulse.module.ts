import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicPulseController } from './academicpulse.controller';
import { AcademicPulseService } from './academicpulse.service';
import { AcademicPulse, AcademicPulseSchema } from '../schemas/academic-pulse.schema';
import { AcademicPulse as PulseEntity } from '../entities/academic-pulse.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AcademicPulse.name, schema: AcademicPulseSchema }]),
    TypeOrmModule.forFeature([PulseEntity]),
  ],
  controllers: [AcademicPulseController],
  providers: [AcademicPulseService],
  exports: [AcademicPulseService, MongooseModule, TypeOrmModule],
})
export class AcademicPulseModule { }
