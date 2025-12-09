import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Wallet } from './wallet.entity';

@Entity({ name: 'user_wallets' })
@Index(['userId', 'walletId'], { unique: true })
export class UserWallet {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'wallet_id', type: 'uuid' })
  walletId!: string;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary!: boolean;

  @Column({ name: 'last_primary_change_at', type: 'bigint', nullable: true })
  lastPrimaryChangeAt!: number | null;

  @ManyToOne(() => User, (u) => u.userWallets)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Wallet, (w) => w.userWallets)
  @JoinColumn({ name: 'wallet_id' })
  wallet!: Wallet;
}










