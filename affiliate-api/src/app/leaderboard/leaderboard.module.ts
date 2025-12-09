import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { AffiliateEntity } from '../affiliate/affiliate.entity';
import { ReferralEntity } from '../referral/referral.entity';
import { PaymentEntity } from '../payment/payment.entity';
import { UserEntity } from '../user/user.entity';
import { RedisCacheModule } from '../../shared/cache/cache.module';
import {
  RankingService,
  ReferralsService,
  EarningsService,
  MetricsService
} from './services';

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
  providers: [
    LeaderboardService,
    RankingService,
    ReferralsService,
    EarningsService,
    MetricsService
  ],
  exports: [LeaderboardService]
})
export class LeaderboardModule {}
