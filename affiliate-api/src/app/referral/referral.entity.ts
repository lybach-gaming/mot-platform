import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../shared/base/base-entity';
import { UserEntity } from '../user/user.entity';

@Entity({ name: 'referrals' })
@Index(['projectId', 'transactionHash'], { unique: true })
export class ReferralEntity extends CustomBaseEntity {

  @Column({ name: 'project_id', type: 'int' })
  @Index()
  projectId: number;

  @Column({ name: 'referee_user_id', type: 'int', nullable: true })
  refereeUserId?: number;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'referee_user_id' })
  refereeUser?: UserEntity;

  @Column({ name: 'referee_address', type: 'varchar', nullable: true })
  @Index()
  refereeAddress?: string;

  @Column({ name: 'referee_email', type: 'varchar', nullable: true })
  refereeEmail?: string;

  @Column({ name: 'referrer_project_user_id', type: 'varchar', nullable: true })
  referrerProjectUserId?: string;

  @Column({ name: 'referrer_address', type: 'varchar', nullable: true })
  @Index()
  referrerAddress?: string;

  @Column({ name: 'transaction_hash', type: 'varchar', nullable: true })
  transactionHash?: string;

  @Column({ name: 'chain', type: 'varchar', nullable: true })
  chain?: string;

  @Column({ name: 'minter', type: 'varchar', nullable: true })
  minter?: string;

  @Column({ name: 'verified', type: 'boolean', default: false })
  verified = false;

  @Column({ name: 'disqualified', type: 'boolean', default: false })
  disqualified = false;

  // Note: Only createdAt is tracked for referrals (no updatedAt in schema)
  // but CustomBaseEntity provides both - updatedAt will just not be used
}
