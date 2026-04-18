import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { SseService } from './sse.service';
import { Public } from '../decorators/public.decorator';

@Controller('stream')
export class SseController {
  constructor(private sseService: SseService) { }

  @Public()
  @Get()
  stream(@Res() res: any) {
    const added = this.sseService.addClient(res);
    if (!added) {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        error: 'Live Node Capacity Reached (Max 2000)',
      });
    }

    // Set high-performance SSE headers with explicit keep-alive and anti-buffering
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Transfer-Encoding': 'chunked',
      'Access-Control-Allow-Origin': '*',
      'X-Accel-Buffering': 'no', 
    });

    if (res.flushHeaders) res.flushHeaders();
    res.write('retry: 3000\n\n');
    res.write('data: {"type":"connection","status":"online"}\n\n');

    // Robust heartbeat to solve ERR_INCOMPLETE_CHUNKED_ENCODING
    const keepAlive = setInterval(() => {
      try {
        if (res.writable && !res.writableEnded) {
          res.write(': heartbeat\n\n');
          res.write('data: {"type":"ping","ts":' + Date.now() + '}\n\n');
        } else {
          clearInterval(keepAlive);
        }
      } catch (e) {
        clearInterval(keepAlive);
        this.sseService.removeClient(res);
      }
    }, 15000);

    res.on('close', () => {
      clearInterval(keepAlive);
      this.sseService.removeClient(res);
    });
    
    res.on('error', () => {
      clearInterval(keepAlive);
      this.sseService.removeClient(res);
    });
  }
}
