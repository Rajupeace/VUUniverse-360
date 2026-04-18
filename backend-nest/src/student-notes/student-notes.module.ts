import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentNotesController } from './student-notes.controller';
import { StudentNotesService } from './student-notes.service';
import { StudentNotes, StudentNotesSchema } from '../schemas/student-notes.schema';
import { StudentNote as NoteEntity } from '../entities/student-note.entity';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: StudentNotes.name, schema: StudentNotesSchema }]),
        TypeOrmModule.forFeature([NoteEntity]),
    ],
    controllers: [StudentNotesController],
    providers: [StudentNotesService],
    exports: [StudentNotesService, MongooseModule, TypeOrmModule],
})
export class StudentNotesModule { }
