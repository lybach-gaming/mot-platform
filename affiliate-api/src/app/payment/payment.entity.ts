import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../shared/base/base-entity';
import { UserEntity } from '../user/user.entity';

@Entity({ name: 'payments' })
@Index(['projectId', 'transactionHash'], { unique: true })
@Index(['projectId', 'invitedByAddress'])
export class PaymentEntity extends CustomBaseEntity {

  @Column({ name: 'project_id', type: 'int' })
  @Index()
  projectId: number;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId?: number;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @Column({ name: 'address', type: 'varchar', nullable: true })
  address?: string;

  @Column({ name: 'email', type: 'varchar', nullable: true })
  email?: string;

  @Column({ name: 'invited_by_id', type: 'varchar', nullable: true })
  invitedById?: string;

  @Column({ name: 'invited_by_address', type: 'varchar', nullable: true })
  invitedByAddress?: string;

  @Column({ name: 'value', type: 'decimal', precision: 30, scale: 8, default: 0 })
  value: number;

  @Column({ name: 'quantity', type: 'int', nullable: true })
  quantity?: number;

  @Column({ name: 'chain', type: 'varchar', nullable: true })
  chain?: string;

  @Column({ name: 'transaction_hash', type: 'varchar', nullable: true })
  transactionHash?: string;

  // Note: Only createdAt is tracked for payments (no updatedAt in schema)
  // but CustomBaseEntity provides both - updatedAt will just not be used
}
