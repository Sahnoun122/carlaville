import { Module, Logger } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AgenciesModule } from './agencies/agencies.module';
import { CarsModule } from './cars/cars.module';
import { ReservationsModule } from './reservations/reservations.module';
import { PricingModule } from './pricing/pricing.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { RolesModule } from './roles/roles.module';
import { BlogsModule } from './blogs/blogs.module';
import { UploadsModule } from './uploads/uploads.module';
import { PaymentsModule } from './payments/payments.module';
import { RevenueModule } from './revenue/revenue.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import * as path from 'path';
import * as fs from 'fs';
import {
  AcceptLanguageResolver,
  I18nModule,
  HeaderResolver,
} from 'nestjs-i18n';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'fr',
      loaderOptions: {
        path: (() => {
          // 1. Try absolute path from process.cwd() (Direct source or standard root build)
          const cwdSrcPath = path.join(process.cwd(), 'src/i18n/');
          const cwdDistPath = path.join(process.cwd(), 'dist/i18n/');
          
          if (fs.existsSync(cwdSrcPath)) return cwdSrcPath;
          if (fs.existsSync(cwdDistPath)) return cwdDistPath;

          // 2. Try relative to __dirname (Flexible for nested builds)
          const relPath = path.join(__dirname, 'i18n/');
          const relParentPath = path.join(__dirname, '../i18n/');
          
          if (fs.existsSync(relPath)) return relPath;
          if (fs.existsSync(relParentPath)) return relParentPath;

          // Fallback to standard src path
          return cwdSrcPath;
        })(),
        watch: true,
      },
      resolvers: [
        new HeaderResolver(['x-custom-lang']),
        AcceptLanguageResolver,
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('database.uri');
        const nodeEnv = configService.get<string>('NODE_ENV');
        
        const logger = new Logger('MongooseModule');

        if (uri) {
          // Log obfuscated version for debugging in Vercel
          const parts = uri.split('@');
          if (parts.length > 1) {
             const protocol = parts[0].split('://')[0];
             const cluster = parts[1].split('/')[0];
             logger.log(`Connecting to: ${protocol}://***:***@${cluster}`);
          } else {
             logger.log(`Connecting with URI (Length: ${uri.length})`);
          }
        }

        // Safety Fallback for LOCAL DEVELOPMENT ONLY
        if (!uri && nodeEnv !== 'production') {
          logger.warn('DATABASE_URI is not defined. Falling back to localhost for development.');
          return { uri: 'mongodb://127.0.0.1:27017/carlaville' };
        }

        if (!uri) {
          throw new Error('FATAL: DATABASE_URI is not defined in environment variables. Check your Vercel/Local .env configuration.');
        }

        return { uri };
      },
    }),
    UsersModule,
    AuthModule,
    AgenciesModule,
    CarsModule,
    ReservationsModule,
    PricingModule,
    DashboardModule,
    DeliveriesModule,
    RolesModule,
    BlogsModule,
    UploadsModule,
    PaymentsModule,
    RevenueModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
