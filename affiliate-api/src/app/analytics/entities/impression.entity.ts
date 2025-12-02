import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../shared/base/base-entity';
import { AffiliateEntity } from '../../affiliate/affiliate.entity';
import { CampaignEntity } from './campaign.entity';

@Entity({ name: 'impressions' })
@Index(['projectId', 'createdAt'])
@Index(['affiliateId', 'campaignId', 'createdAt'])
export class ImpressionEntity extends CustomBaseEntity {

  @Column({ name: 'project_id', type: 'int' })
  @Index()
  projectId: number;

  @Column({ name: 'affiliate_id', type: 'int', nullable: true })
  affiliateId?: number;

  @ManyToOne(() => AffiliateEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'affiliate_id' })
  affiliate?: AffiliateEntity;

  @Column({ name: 'campaign_id', type: 'int', nullable: true })
  campaignId?: number;

  @ManyToOne(() => CampaignEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'campaign_id' })
  campaign?: CampaignEntity;

  @Column({ name: 'referral_code', type: 'varchar', nullable: true })
  referralCode?: string;

  @Column({ name: 'country', type: 'varchar', length: 2, nullable: true })
  country?: string;

  @Column({ name: 'metadata', type: 'json', nullable: true })
  metadata?: Record<string, unknown> | null;

  // Only createdAt tracked for impressions
}
