import { Controller, Post, UseGuards } from '@nestjs/common';
import { AgentService } from './agent.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('agent')
@UseGuards(JwtAuthGuard)
export class AgentController {
  constructor(private agentService: AgentService) { }

  @Post('reload')
  async reload(): Promise<any> {
    return this.agentService.reloadKnowledge();
  }

  @Post('update-knowledge')
  async updateKnowledge(): Promise<any> {
    return this.agentService.updateKnowledgeToDb();
  }
}
