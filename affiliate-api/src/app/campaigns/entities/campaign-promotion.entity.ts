import { Entity, Column, Index, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { CustomBaseEntity } from '../../../shared/base/base-entity';
import { OfferEntity } from './offer.entity';
import { AffiliateEntity } from '../../affiliate/affiliate.entity';

@Entity({ name: 'offer_promotions' })
@Unique(['offerId', 'affiliateId'])
@Index(['offerId'])
@Index(['affiliateId'])
@Index(['promotedAt'])
export class OfferPromotionEntity extends CustomBaseEntity {
  @Column({ name: 'offer_id', type: 'int' })
  offerId: number;

  @ManyToOne(() => OfferEntity, offer => offer.promotions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'offer_id' })
  offer: OfferEntity;

  @Column({ name: 'affiliate_id', type: 'int' })
  affiliateId: number;

  @ManyToOne(() => AffiliateEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'affiliate_id' })
  affiliate: AffiliateEntity;

  @Column({ name: 'promoted_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  promotedAt: Date;

  @Column({ name: 'channel', type: 'varchar', length: 50, nullable: true })
  channel?: string;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
