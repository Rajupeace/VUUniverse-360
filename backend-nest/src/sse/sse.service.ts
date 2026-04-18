import { Injectable } from '@nestjs/common';

@Injectable()
export class SseService {
    private clients: any[] = [];
    private readonly MAX_CLIENTS = 2000;

    addClient(res: any): boolean {
        if (this.clients.length >= this.MAX_CLIENTS) return false;
        this.clients.push(res);
        return true;
    }

    removeClient(res: any) {
        const idx = this.clients.indexOf(res);
        if (idx !== -1) this.clients.splice(idx, 1);
    }

    broadcast(payload: any) {
        if (!payload) return;
        const str = JSON.stringify(payload);
        setImmediate(() => {
            for (let i = this.clients.length - 1; i >= 0; i--) {
                try {
                    this.clients[i].write(`data: ${str}\n\n`);
                } catch {
                    this.clients.splice(i, 1);
                }
            }
        });
    }
}
