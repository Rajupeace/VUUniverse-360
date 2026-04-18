import { Controller, Get, UseGuards } from '@nestjs/common';
import { SystemService } from './system.service';
import { Public } from '../decorators/public.decorator';
import { JwtAuthGuard, StaffGuard } from '../auth/guards';

@Controller('system')
export class SystemController {
    constructor(private systemService: SystemService) { }

    @Public()
    @Get('health')
    async getHealth(): Promise<any> {
        return this.systemService.getHealth();
    }

    @Get('logs')
    @UseGuards(JwtAuthGuard, StaffGuard)
    async getLogs(): Promise<any[]> {
        return this.systemService.getLogs();
    }
}
