import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacultyController } from './faculty.controller';
import { FacultyService } from './faculty.service';
import { Faculty, FacultySchema } from '../schemas/faculty.schema';
import { Faculty as FacultyEntity } from '../entities/faculty.entity';
import { SseModule } from '../sse/sse.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Faculty.name, schema: FacultySchema }]),
        TypeOrmModule.forFeature([FacultyEntity]),
        SseModule,
    ],
    controllers: [FacultyController],
    providers: [FacultyService],
    exports: [FacultyService, MongooseModule, TypeOrmModule],
})
export class FacultyModule { }
