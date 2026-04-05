import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response, Express } from 'express';

const server = express();

async function bootstrap(expressInstance: Express) {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
    { rawBody: true },
  );

  app.setGlobalPrefix('api');
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        return new BadRequestException(errors);
      },
    }),
  );

  const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.ADMIN_URL,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    /https?:\/\/.*\.vercel\.app$/, // Allow Vercel preview domains
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  return app.init();
}

// Global variable to keep the app warm in serverless if possible
let cachedApp;

export default async (req: Request, res: Response) => {
  if (!cachedApp) {
    await bootstrap(server);
    cachedApp = server;
  }
  return server(req, res);
};

// For local development
if (process.env.NODE_ENV !== 'production') {
  const localPort = process.env.PORT || 3009;
  const localServer = express();
  bootstrap(localServer).then(() => {
    localServer.listen(localPort, () => {
      console.log(`[Carlaville] Local server running on http://localhost:${localPort}`);
    });
  });
}

