import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { AffiliateEntity } from '../affiliate/affiliate.entity';
import { ReferralEntity } from '../referral/referral.entity';
import { PaymentEntity } from '../payment/payment.entity';
import { UserEntity } from '../user/user.entity';
import { RedisCacheModule } from '../../shared/cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AffiliateEntity,
      ReferralEntity,
      PaymentEntity,
      UserEntity
    ]),
    RedisCacheModule
  ],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
  exports: [LeaderboardService]
})
export class LeaderboardModule {}
