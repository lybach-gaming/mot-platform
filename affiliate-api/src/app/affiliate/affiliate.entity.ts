import { Column, Entity, Index } from 'typeorm';
import { CustomBaseEntity } from '../../shared/base/base-entity';

@Entity({ name: 'affiliates' })
export class AffiliateEntity extends CustomBaseEntity {

  @Column({ name: 'project_id', type: 'int' })
  @Index()
  projectId: number;

  @Column({ name: 'project_user_id', type: 'varchar', nullable: true })
  projectUserId?: string;

  @Column({ name: 'address', type: 'varchar', nullable: true })
  @Index()
  address?: string;

  @Column({ name: 'referral_code', type: 'varchar', nullable: true, unique: true })
  @Index({ unique: true })
  referralCode?: string;

  @Column({ name: 'metadata', type: 'json', nullable: true })
  metadata?: Record<string, unknown> | null;

  @Column({ name: 'stats', type: 'json', nullable: true })
  stats?: Record<string, unknown> | null;

  // createdAt and updatedAt are inherited from CustomBaseEntity
}
