import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserWallet } from './user-wallet.entity';

@Entity({ name: 'wallets' })
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', nullable: false })
  address!: string;

  @Column({ name: 'chain', type: 'varchar', nullable: false })
  chain!: string;

  @Column({ name: 'is_embedded', type: 'boolean', default: false })
  isEmbedded!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => UserWallet, (uw) => uw.wallet)
  userWallets!: UserWallet[];
}










