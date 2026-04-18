import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentProgressController } from './student-progress.controller';
import { StudentProgressService } from './student-progress.service';
import { StudentProgress, StudentProgressSchema } from '../schemas/student-progress.schema';
import { StudentProgress as ProgressEntity } from '../entities/student-progress.entity';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: StudentProgress.name, schema: StudentProgressSchema }]),
        TypeOrmModule.forFeature([ProgressEntity]),
    ],
    controllers: [StudentProgressController],
    providers: [StudentProgressService],
    exports: [StudentProgressService, MongooseModule, TypeOrmModule],
})
export class StudentProgressModule { }
