import 'reflect-metadata';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as os from 'os';

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
// Fallback if root .env missing or empty
if (!process.env.MONGO_URI) {
  dotenv.config({ path: path.join(__dirname, '..', '.env'), override: true });
}
if (!process.env.MONGO_URI) {
  dotenv.config({ path: path.join(process.cwd(), '.env'), override: true });
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

import * as cluster from 'cluster';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

    const helmetFn = require('helmet');
    const compressionFn = require('compression');
    const express = require('express');

    // Security & Performance Headers
    app.use(helmetFn({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    }));

    // High performance compression
    app.use(compressionFn({
        filter: (req: any, res: any) => {
            if (req.originalUrl === '/api/stream' || req.originalUrl === '/api/sse') return false;
            return compressionFn.filter(req, res);
        }
    }));

    // CORS for high-traffic
    app.enableCors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-student-token', 'x-faculty-token', 'x-admin-token', 'Cache-Control', 'Pragma', 'Expires'],
    });

    // High-speed JSON parsing
    app.use(express.json({ limit: '100mb' }));
    app.use(express.urlencoded({ extended: true, limit: '100mb' }));

    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    app.useStaticAssets(uploadsDir, {
      prefix: '/uploads',
      maxAge: '1d', // Faster delivery
      setHeaders: (res: any) => {
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
        res.set('Access-Control-Allow-Origin', '*');
      },
    });

    app.setGlobalPrefix('api');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    // Global performance tracing
    app.use((req: any, res: any, next: any) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        if (duration > 200) {
          console.warn(`[PERF ⚡] ${req.method} ${req.url} — ${duration}ms`);
        }
      });
      next();
    });

    // High-concurrency optimization
    const httpServer = app.getHttpServer();
    if (httpServer) {
      httpServer.keepAliveTimeout = 120000; // 120s
      httpServer.headersTimeout = 130000;
    }

  const PORT = process.env.PORT || 5001;
  await app.listen(PORT, '0.0.0.0');
  console.log(`✅ Worker ${process.pid} started on port ${PORT}`);
}

const Cluster = cluster as any;
if (Cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(`Primary ${process.pid} is running. Starting ${numCPUs} workers...`);
  for (let i = 0; i < numCPUs; i++) {
    Cluster.fork();
  }
  Cluster.on('exit', (worker: any, code: any, signal: any) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    Cluster.fork();
  });
} else {
  bootstrap();
}
