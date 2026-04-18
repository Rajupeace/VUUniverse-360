import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminDataController } from './admindata.controller';
import { AdminDataService } from './admindata.service';

@Module({
  imports: [
    MongooseModule.forFeature([]), // Depends on generic db connection for bulk ops
  ],
  controllers: [AdminDataController],
  providers: [AdminDataService],
  exports: [AdminDataService],
})
export class AdminDataModule { }
