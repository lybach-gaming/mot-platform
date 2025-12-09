import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../shared/base/base-entity';
import { AffiliateEntity } from '../../affiliate/affiliate.entity';
import { CampaignEntity } from './campaign.entity';
import { ClickEntity } from './click.entity';
import { PaymentEntity } from '../../payment/payment.entity';
import { UserEntity } from '../../user/user.entity';
import { decimalTransformer } from '../../../shared/utils/decimal-transformer';

@Entity({ name: 'conversions' })
@Index(['projectId', 'createdAt'])
@Index(['affiliateId', 'campaignId', 'createdAt'])
@Index(['country', 'createdAt'])
@Index(['paymentId'])
export class ConversionEntity extends CustomBaseEntity {

  @Column({ name: 'project_id', type: 'int' })
  @Index()
  projectId: number;

  @Column({ name: 'affiliate_id', type: 'int' })
  affiliateId: number;

  @ManyToOne(() => AffiliateEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'affiliate_id' })
  affiliate: AffiliateEntity;

  @Column({ name: 'campaign_id', type: 'int', nullable: true })
  campaignId?: number;

  @ManyToOne(() => CampaignEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'campaign_id' })
  campaign?: CampaignEntity;

  @Column({ name: 'click_id', type: 'int', nullable: true })
  clickId?: number;

  @ManyToOne(() => ClickEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'click_id' })
  click?: ClickEntity;

  @Column({ name: 'payment_id', type: 'int', nullable: true })
  paymentId?: number;

  @ManyToOne(() => PaymentEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'payment_id' })
  payment?: PaymentEntity;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({
    name: 'order_value',
    type: 'decimal',
    precision: 20,
    scale: 8,
    transformer: decimalTransformer
  })
  orderValue: number;

  @Column({
    name: 'commission_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    transformer: decimalTransformer
  })
  commissionRate: number;

  @Column({
    name: 'commission_amount',
    type: 'decimal',
    precision: 20,
    scale: 8,
    transformer: decimalTransformer
  })
  commissionAmount: number;

  @Column({ name: 'country', type: 'varchar', length: 2, nullable: true })
  country?: string;

  @Column({ name: 'metadata', type: 'json', nullable: true })
  metadata?: Record<string, unknown> | null;

  // createdAt and updatedAt inherited from CustomBaseEntity
}
