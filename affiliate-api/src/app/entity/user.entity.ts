import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserWallet } from './user-wallet.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'privy_user_id', type: 'varchar', nullable: false })
  privyUserId!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone!: string | null;

  @Column({ name: 'two_fa_enabled', type: 'boolean', default: false })
  twoFaEnabled!: boolean;

  @Column({ name: 'kyc_status', type: 'varchar', default: 'none' })
  kycStatus!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => UserWallet, (uw: UserWallet) => uw.user)
  userWallets!: UserWallet[];
}


