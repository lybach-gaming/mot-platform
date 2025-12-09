import { Entity, Column, Index, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { CustomBaseEntity } from '../../../shared/base/base-entity';
import { CampaignEntity } from './campaign.entity';
import { AffiliateEntity } from '../../affiliate/affiliate.entity';

@Entity({ name: 'campaign_promotions' })
@Unique(['campaignId', 'affiliateId'])
@Index(['campaignId'])
@Index(['affiliateId'])
@Index(['promotedAt'])
export class CampaignPromotionEntity extends CustomBaseEntity {
  @Column({ name: 'campaign_id', type: 'int' })
  campaignId: number;

  @ManyToOne(() => CampaignEntity, campaign => campaign.promotions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaign_id' })
  campaign: CampaignEntity;

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
