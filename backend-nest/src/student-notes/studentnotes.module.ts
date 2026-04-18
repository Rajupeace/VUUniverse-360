import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentNotesController } from './studentnotes.controller';
import { StudentNotesService } from './studentnotes.service';
import { StudentNotes, StudentNotesSchema } from '../schemas/student-notes.schema';
import { SseModule } from '../sse/sse.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: StudentNotes.name, schema: StudentNotesSchema }]),
    SseModule,
  ],
  controllers: [StudentNotesController],
  providers: [StudentNotesService],
  exports: [StudentNotesService],
})
export class StudentNotesModule { }
