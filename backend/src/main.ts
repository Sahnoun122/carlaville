import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cors from 'cors';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const port = process.env.PORT || 3009;
  app.setGlobalPrefix('api');
  app.use(
    cors({
      origin: ['http://localhost:3002', 'http://localhost:3000', 'http://localhost:3001'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    }),
  );
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}
bootstrap();
