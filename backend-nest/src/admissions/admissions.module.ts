import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdmissionsController } from './admissions.controller';
import { AdmissionsService } from './admissions.service';
import { Admission, AdmissionSchema } from '../schemas/admission.schema';
import { SseModule } from '../sse/sse.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Admission.name, schema: AdmissionSchema }]),
    SseModule,
  ],
  controllers: [AdmissionsController],
  providers: [AdmissionsService],
  exports: [AdmissionsService],
})
export class AdmissionsModule { }
