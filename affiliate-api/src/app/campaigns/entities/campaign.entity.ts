import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { CustomBaseEntity } from '../../../shared/base/base-entity';
import { UserEntity } from '../../user/user.entity';
import { OfferPromotionEntity } from './offer-promotion.entity';
import { OfferTopic, OfferStatus } from '../types/offer.types';
import { CommissionModel } from '../types/commission.types';

@Entity({ name: 'offers' })
@Index(['status'])
@Index(['topic'])
@Index(['rating'])
@Index(['slug'], { unique: true })
export class OfferEntity extends CustomBaseEntity {
  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'slug', type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({
    name: 'topic',
    type: 'enum',
    enum: OfferTopic
  })
  topic: OfferTopic;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: OfferStatus,
    default: OfferStatus.DISABLED
  })
  status: OfferStatus;

  @Column({ name: 'commission_description', type: 'text', nullable: true })
  commissionDescription?: string;

  @Column({ name: 'commission_model', type: 'jsonb' })
  commissionModel: CommissionModel;

  @Column({
    name: 'rating',
    type: 'decimal',
    precision: 2,
    scale: 1,
    nullable: true
  })
  rating?: number;

  @Column({ name: 'active_affiliates', type: 'int', default: 0 })
  activeAffiliates: number;

  @Column({ name: 'created_by', type: 'int', nullable: true })
  createdBy?: number;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator?: UserEntity;

  @Column({ name: 'updated_by', type: 'int', nullable: true })
  updatedBy?: number;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updater?: UserEntity;

  @OneToMany(() => OfferPromotionEntity, promotion => promotion.offer)
  promotions: OfferPromotionEntity[];
}
