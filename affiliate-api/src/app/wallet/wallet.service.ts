import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { Wallet } from '../entity/wallet.entity';
import { UserWallet } from '../entity/user-wallet.entity';

@Injectable()
export class WalletService {
  private cooldownMs: number;

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Wallet) private readonly wallets: Repository<Wallet>,
    @InjectRepository(UserWallet) private readonly userWallets: Repository<UserWallet>,
  ) {
    const hours = Number(process.env.PRIMARY_WALLET_COOLDOWN_HOURS || 24);
    this.cooldownMs = Math.max(0, hours) * 60 * 60 * 1000;
    ; (global as any).walletService = this; // for PrivyAuthService sync hook
  }

  async ensureUserWithWallets(privyUserId: string, email: string | null, phone: string | null, wallets: Array<{ address: string; chainType: string; embedded?: boolean }>) {
    let user = await this.users.findOne({ where: { privyUserId } });
    if (!user) {
      user = this.users.create({ privyUserId, email, phone });
      await this.users.save(user);
    } else {
      const changed = user.email !== email || user.phone !== phone;
      if (changed) {
        user.email = email;
        user.phone = phone;
        await this.users.save(user);
      }
    }

    for (const w of wallets) {
      let wallet = await this.wallets.findOne({ where: { address: w.address } });
      if (!wallet) {
        wallet = this.wallets.create({ address: w.address, chain: w.chainType, isEmbedded: Boolean(w.embedded) });
        await this.wallets.save(wallet);
      }
      const existingLink = await this.userWallets.findOne({ where: { userId: user.id, walletId: wallet.id } });
      if (!existingLink) {
        const link = this.userWallets.create({ userId: user.id, walletId: wallet.id, isPrimary: false, lastPrimaryChangeAt: null });
        await this.userWallets.save(link);
      }
    }

    const links = await this.userWallets.find({ where: { userId: user.id } });
    if (!links.some((l) => l.isPrimary) && links.length > 0) {
      links[0].isPrimary = true;
      links[0].lastPrimaryChangeAt = Date.now();
      await this.userWallets.save(links[0]);
    }
  }

  async getWallets(privyUserId: string) {
    const user = await this.users.findOne({ where: { privyUserId } });
    if (!user) return { wallets: [], primaryWallet: null };
    const links = await this.userWallets.find({ where: { userId: user.id } });
    const ids = links.map((l) => l.walletId);
    const wallets = await this.wallets.findByIds(ids);
    const primary = links.find((l) => l.isPrimary);
    return { wallets, primaryWallet: primary ? wallets.find((w) => w.id === primary.walletId)?.address ?? null : null };
  }

  async connectExternal(privyUserId: string, address: string, chainType: string) {
    const user = await this.users.findOne({ where: { privyUserId } });
    if (!user) throw new BadRequestException('User not found');
    let wallet = await this.wallets.findOne({ where: { address } });
    if (!wallet) {
      wallet = this.wallets.create({ address, chain: chainType, isEmbedded: false });
      await this.wallets.save(wallet);
    }
    const existing = await this.userWallets.findOne({ where: { userId: user.id, walletId: wallet.id } });
    if (!existing) await this.userWallets.save(this.userWallets.create({ userId: user.id, walletId: wallet.id, isPrimary: false, lastPrimaryChangeAt: null }));
  }

  async disconnectExternal(privyUserId: string, address: string) {
    const user = await this.users.findOne({ where: { privyUserId } });
    if (!user) return;
    const wallet = await this.wallets.findOne({ where: { address } });
    if (!wallet) return;
    const link = await this.userWallets.findOne({ where: { userId: user.id, walletId: wallet.id } });
    if (!link) return;
    await this.userWallets.remove(link);
    const remaining = await this.userWallets.find({ where: { userId: user.id } });
    if (!remaining.some((l) => l.isPrimary) && remaining[0]) {
      remaining[0].isPrimary = true;
      remaining[0].lastPrimaryChangeAt = Date.now();
      await this.userWallets.save(remaining[0]);
    }
  }

  async setPrimary(privyUserId: string, address: string) {
    const user = await this.users.findOne({ where: { privyUserId } });
    if (!user) throw new BadRequestException('User not found');
    const wallet = await this.wallets.findOne({ where: { address } });
    if (!wallet) throw new BadRequestException('Wallet not found');
    const link = await this.userWallets.findOne({ where: { userId: user.id, walletId: wallet.id } });
    if (!link) throw new BadRequestException('Wallet not linked');
    const now = Date.now();
    if (this.cooldownMs && link.lastPrimaryChangeAt && now - (link.lastPrimaryChangeAt || 0) < this.cooldownMs) {
      throw new ForbiddenException('Primary wallet change is in cooldown');
    }
    // unset others
    const all = await this.userWallets.find({ where: { userId: user.id } });
    for (const l of all) l.isPrimary = false;
    await this.userWallets.save(all);
    // set
    link.isPrimary = true;
    link.lastPrimaryChangeAt = now;
    await this.userWallets.save(link);
  }
}










