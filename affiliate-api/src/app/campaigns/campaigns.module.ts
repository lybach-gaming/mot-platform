import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OffersController } from './offers.controller';
import { OffersService } from './services';
import { OfferEntity, OfferPromotionEntity } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([OfferEntity, OfferPromotionEntity])],
  controllers: [OffersController],
  providers: [OffersService],
  exports: [OffersService]
})
export class OffersModule {}
