import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrivyClient } from '@privy-io/server-auth';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { Wallet } from '../entity/wallet.entity';
import { UserWallet } from '../entity/user-wallet.entity';

@Injectable()
export class PrivyAuthService {
  private client: PrivyClient;
  private jwtSecret: string;

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Wallet) private readonly wallets: Repository<Wallet>,
    @InjectRepository(UserWallet) private readonly userWallets: Repository<UserWallet>,
  ) {
    const appId = process.env.PRIVY_APP_ID;
    const appSecret = process.env.PRIVY_APP_SECRET;
    if (!appId || !appSecret) throw new Error('Missing PRIVY env');
    this.client = new PrivyClient({ appId, appSecret });
    this.jwtSecret = process.env.JWT_SECRET || 'dev-secret';
  }

  async verifyAndUpsert(privyToken: string) {
    const verified = await this.client.verifyAuthToken(privyToken).catch(() => null);
    if (!verified) throw new UnauthorizedException('Invalid Privy token');
    const { user } = verified;

    let u = await this.users.findOne({ where: { privyUserId: user.id } });
    if (!u) {
      u = this.users.create({ privyUserId: user.id, email: user.email?.address ?? null, phone: user.phone?.number ?? null });
      await this.users.save(u);
    } else {
      const changed = (u.email ?? null) !== (user.email?.address ?? null) || (u.phone ?? null) !== (user.phone?.number ?? null);
      if (changed) { u.email = user.email?.address ?? null; u.phone = user.phone?.number ?? null; await this.users.save(u); }
    }

    const wallets = (user?.wallets || []) as any[];
    for (const w of wallets) {
      const addr = w.address;
      let wallet = await this.wallets.findOne({ where: { address: addr } });
      if (!wallet) {
        wallet = this.wallets.create({ address: addr, chain: w.chain_type || w.chainType || 'solana', isEmbedded: Boolean(w.embedded || w.type === 'embedded') });
        await this.wallets.save(wallet);
      }
      const link = await this.userWallets.findOne({ where: { userId: u.id, walletId: wallet.id } });
      if (!link) await this.userWallets.save(this.userWallets.create({ userId: u.id, walletId: wallet.id, isPrimary: false, lastPrimaryChangeAt: null }));
    }

    const links = await this.userWallets.find({ where: { userId: u.id } });
    if (!links.some((l) => l.isPrimary) && links[0]) {
      links[0].isPrimary = true; links[0].lastPrimaryChangeAt = Date.now(); await this.userWallets.save(links[0]);
    }

    // return lightweight session user from DB
    const primaryLink = await this.userWallets.findOne({ where: { userId: u.id, isPrimary: true } });
    return {
      user: { id: u.id, privyUserId: u.privyUserId, email: u.email, phone: u.phone },
      primaryWallet: primaryLink ? (await this.wallets.findOne({ where: { id: primaryLink.walletId } }))?.address ?? null : null,
    };
  }
}










