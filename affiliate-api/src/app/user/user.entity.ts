import { Column, Entity, Index } from 'typeorm';
// import { ApiProperty } from '@nestjs/swagger';
import { CustomBaseEntity } from '../../shared/base/base-entity';

@Entity({ name: 'users' })
export class UserEntity extends CustomBaseEntity {

  @Column({ name: 'project_id', type: 'int' })
  @Index()
  projectId: number;

  @Column({ name: 'project_user_id', type: 'varchar', nullable: true })
  projectUserId?: string;

  @Column({ name: 'address', type: 'varchar', nullable: true })
  @Index()
  address?: string;

  @Column({ name: 'email', type: 'varchar', nullable: true })
  @Index()
  email?: string;

  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified = false;

  @Column({ name: 'chain', type: 'varchar', nullable: true })
  chain?: string;

  @Column({ name: 'metadata', type: 'text', nullable: true })
  metadata?: string;

  @Column({ name: 'username', type: 'varchar', nullable: true })
  username?: string;

  @Column({ name: 'display_name', type: 'varchar', nullable: true })
  displayName?: string;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl?: string;

  @Column({ name: 'bio', type: 'text', nullable: true })
  bio?: string;

  @Column({ name: 'country', type: 'varchar', nullable: true })
  country?: string;

  @Column({ name: 'timezone', type: 'varchar', nullable: true })
  timezone?: string;

  @Column({ name: 'referral_slug', type: 'varchar', nullable: true, unique: true })
  @Index({ unique: true })
  referralSlug?: string;

  @Column({ name: 'two_factor_enabled', type: 'boolean', default: false })
  twoFactorEnabled = false;

  @Column({ name: 'notifications_email', type: 'boolean', default: true })
  notificationsEmail = true;

  @Column({ name: 'notifications_push', type: 'boolean', default: true })
  notificationsPush = true;

  @Column({ name: 'theme', type: 'varchar', default: 'system' })
  theme: 'light' | 'dark' | 'system' = 'system';

  @Column({ name: 'locale', type: 'varchar', default: 'en' })
  locale = 'en';

  @Column({ name: 'payout_currency', type: 'varchar', nullable: true })
  payoutCurrency?: string;

  @Column({ name: 'privacy', type: 'json', nullable: true })
  privacy?: Record<string, unknown> | null;

  // createdAt and updatedAt are inherited from TimestampBaseEntity
}


