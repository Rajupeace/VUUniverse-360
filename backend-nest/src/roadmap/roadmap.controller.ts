import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RoadmapService } from './roadmap.service';
import { JwtAuthGuard } from '../auth/guards';
import { Public } from '../decorators/public.decorator';

@Controller('roadmaps')
@UseGuards(JwtAuthGuard)
export class RoadmapController {
  constructor(private readonly roadmapService: RoadmapService) {}

  @Public()
  @Get()
  async findAll() {
    return this.roadmapService.findAll();
  }

  @Public()
  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return this.roadmapService.findOne(slug);
  }
}
