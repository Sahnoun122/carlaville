import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException, Logger } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express, Request, Response } from 'express';

// Global server instance for Vercel logic
const server: Express = express();
let cachedApp: any;

async function bootstrap(expressInstance: Express) {
  const logger = new Logger('Bootstrap');
  
  // Singleton pattern for NestJS instance
  if (cachedApp) return cachedApp;

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

  // Production-Ready CORS configuration
  const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.ADMIN_URL,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    /https?:\/\/.*\.vercel\.app$/, // Allow all Vercel Preview Deployments
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type,Accept,Authorization,X-Requested-With,x-custom-lang',
  });

  await app.init();
  cachedApp = server;
  
  logger.log('NestJS application initialized successfully');
  return app;
}

export default async (req: Request, res: Response) => {
  try {
    await bootstrap(server);
    return server(req, res);
  } catch (error) {
    console.error('Bootstrap error', error);
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
};

if (process.env.NODE_ENV !== 'production') {
  const localPort = process.env.PORT || 3000;
  const localServer = express();
  bootstrap(localServer).then(() => {
    localServer.listen(localPort, () => {
      console.log(`\x1b[32m[Carlaville] Local server running on http://localhost:${localPort}\x1b[0m`);
    });
  }).catch(err => {
    console.error('Critical error during bootstrap:', err);
  });
}

