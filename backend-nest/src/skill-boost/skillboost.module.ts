import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillBoostController } from './skillboost.controller';
import { SkillBoostService } from './skillboost.service';
import { Skill, SkillSchema } from '../schemas/skill.schema';
import { Skill as SkillEntity } from '../entities/skill.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Skill.name, schema: SkillSchema }]),
    TypeOrmModule.forFeature([SkillEntity]),
  ],
  controllers: [SkillBoostController],
  providers: [SkillBoostService],
  exports: [SkillBoostService, MongooseModule, TypeOrmModule],
})
export class SkillBoostModule { }
