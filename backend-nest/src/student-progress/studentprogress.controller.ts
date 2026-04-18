import { Controller, Get, Post, Put, Delete, Patch, Param, Body, Query, UseGuards, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards';
import { Public } from '../decorators/public.decorator';
import { StudentProgressService } from './studentprogress.service';

@Controller('student-progress')
@UseGuards(JwtAuthGuard)
export class StudentProgressController {
  constructor(private studentprogressService: StudentProgressService) {}

  @Get(':sid')
  async getProgress(@Param('sid') sid: string) {
    return this.studentprogressService.getProgress(sid);
  }
}
