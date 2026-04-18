import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { Library, LibrarySchema } from '../schemas/library.schema';
import { Library as LibraryEntity } from '../entities/library.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Library.name, schema: LibrarySchema }]),
    TypeOrmModule.forFeature([LibraryEntity]),
  ],
  controllers: [LibraryController],
  providers: [LibraryService],
  exports: [LibraryService, MongooseModule, TypeOrmModule],
})
export class LibraryModule { }
