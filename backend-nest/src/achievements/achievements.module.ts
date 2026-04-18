import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementsController } from './achievements.controller';
import { AchievementsService } from './achievements.service';
import { Achievement, AchievementSchema } from '../schemas/achievement.schema';
import { Student, StudentSchema } from '../schemas/student.schema';
import { Achievement as AchievementEntity } from '../entities/achievement.entity';
import { Student as StudentEntity } from '../entities/student.entity';
import { SseModule } from '../sse/sse.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Achievement.name, schema: AchievementSchema },
      { name: Student.name, schema: StudentSchema },
    ]),
    TypeOrmModule.forFeature([AchievementEntity, StudentEntity]),
    SseModule,
  ],
  controllers: [AchievementsController],
  providers: [AchievementsService],
  exports: [AchievementsService, MongooseModule, TypeOrmModule],
})
export class AchievementsModule { }
