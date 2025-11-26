import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { AnalyticsController } from './analytics.controller';
import {
  AnalyticsService,
  DateRangeService,
  SummaryService,
  TrendService,
  FunnelService,
  CampaignAnalyticsService,
  GeographyService,
  ExportService
} from './services';
import {
  CampaignEntity,
  ClickEntity,
  ImpressionEntity,
  ConversionEntity
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CampaignEntity,
      ClickEntity,
      ImpressionEntity,
      ConversionEntity
    ]),
    CacheModule.register()
  ],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    DateRangeService,
    SummaryService,
    TrendService,
    FunnelService,
    CampaignAnalyticsService,
    GeographyService,
    ExportService
  ],
  exports: [AnalyticsService]
})
export class AnalyticsModule {}
