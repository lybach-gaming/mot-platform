import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrivyAuthController } from './privy-auth.controller';
import { PrivyAuthService } from './privy-auth.service';
import { JwtModule } from '@nestjs/jwt';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    WalletModule,
  ],
  controllers: [PrivyAuthController],
  providers: [PrivyAuthService],
  exports: [PrivyAuthService],
})
export class AuthModule { }



