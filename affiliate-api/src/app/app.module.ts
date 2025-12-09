import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeorm from '../config/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
<<<<<<< HEAD
import { WalletModule } from './wallet/wallet.module';
=======
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { AnalyticsModule } from './analytics/analytics.module';
>>>>>>> 2d6232b9e822791b2e1f9a384fe8e2870267caf4
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        const options = configService.get('typeorm');
        if (!options) {
          throw new Error('TypeORM configuration is missing');
        }
        return options;
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
<<<<<<< HEAD
    WalletModule,
=======
    LeaderboardModule,
    AnalyticsModule,
>>>>>>> 2d6232b9e822791b2e1f9a384fe8e2870267caf4
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
