import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './services';
import { CampaignEntity, CampaignPromotionEntity } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([CampaignEntity, CampaignPromotionEntity])],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService]
})
export class CampaignsModule {}
