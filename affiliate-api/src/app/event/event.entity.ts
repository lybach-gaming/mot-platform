import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../shared/base/base-entity';
import { UserEntity } from '../user/user.entity';
import { decimalTransformer } from '../../shared/utils/decimal-transformer';

@Entity({ name: 'events' })
export class EventEntity extends CustomBaseEntity {

  @Column({ name: 'project_id', type: 'int' })
  @Index()
  projectId: number;

  @Column({ name: 'name', type: 'varchar' })
  @Index()
  name: string;

  @Column({
    name: 'value',
    type: 'decimal',
    precision: 18,
    scale: 8,
    nullable: true,
    transformer: decimalTransformer
  })
  value?: number;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId?: number;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @Column({ name: 'address', type: 'varchar', nullable: true })
  @Index()
  address?: string;

  @Column({ name: 'email', type: 'varchar', nullable: true })
  email?: string;

  @Column({ name: 'referred_by_code', type: 'varchar', nullable: true })
  referredByCode?: string;

  @Column({ name: 'referred_by_address', type: 'varchar', nullable: true })
  @Index()
  referredByAddress?: string;

  // Note: Only createdAt is tracked for events (no updatedAt in schema)
  // but CustomBaseEntity provides both - updatedAt will just not be used
}
