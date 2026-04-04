import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Revenue } from './src/revenue/schemas/revenue.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const revenueModel = app.get<Model<any>>(getModelToken(Revenue.name));
  const docs = await revenueModel.find().limit(3).exec();
  console.log('REVENUE_SAMPLE:', JSON.stringify(docs, null, 2));
  await app.close();
}
bootstrap();
