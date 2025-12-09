import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { User } from '../entity/user.entity';
import { Wallet } from '../entity/wallet.entity';
import { UserWallet } from '../entity/user-wallet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Wallet, UserWallet])],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule { }










