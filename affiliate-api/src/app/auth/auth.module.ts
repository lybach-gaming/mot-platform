import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttachUserMiddleware } from './attach-user.middleware';
import { PrivyAuthController } from './privy-auth.controller';
import { PrivyAuthService } from './privy-auth.service';
import { User } from '../entity/user.entity';
import { Wallet } from '../entity/wallet.entity';
import { UserWallet } from '../entity/user-wallet.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User, Wallet, UserWallet])],
  controllers: [PrivyAuthController],
  providers: [PrivyAuthService],
  exports: [PrivyAuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AttachUserMiddleware).forRoutes('*');
  }
}
