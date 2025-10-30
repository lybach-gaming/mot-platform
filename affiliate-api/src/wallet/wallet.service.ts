import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface LinkedWallet { address: string; chainType: string; embedded?: boolean }

interface UserRecord {
  privyUserId: string;
  primaryWallet?: string | null;
  wallets: LinkedWallet[];
  lastPrimaryChangeAt?: number;
}

@Injectable()
export class WalletService {
  private users = new Map<string, UserRecord>();
  private cooldownMs: number;

  constructor(private readonly config: ConfigService) {
    const hours = Number(this.config.get('PRIMARY_WALLET_COOLDOWN_HOURS') || 24);
    this.cooldownMs = Math.max(0, hours) * 60 * 60 * 1000;
  }

  ensureUser(user: { privyUserId: string; wallets?: LinkedWallet[] }) {
    if (!this.users.has(user.privyUserId)) {
      this.users.set(user.privyUserId, {
        privyUserId: user.privyUserId,
        primaryWallet: user.wallets?.[0]?.address ?? null,
        wallets: user.wallets ?? [],
      });
    }
    return this.users.get(user.privyUserId)!;
  }

  getWallets(privyUserId: string) {
    const rec = this.users.get(privyUserId);
    return rec ? { wallets: rec.wallets, primaryWallet: rec.primaryWallet ?? null } : { wallets: [], primaryWallet: null };
  }

  connectExternal(privyUserId: string, wallet: LinkedWallet) {
    const rec = this.ensureUser({ privyUserId });
    if (rec.wallets.some(w => w.address === wallet.address)) return;
    rec.wallets.push(wallet);
    if (!rec.primaryWallet) rec.primaryWallet = wallet.address;
  }

  disconnectExternal(privyUserId: string, address: string) {
    const rec = this.users.get(privyUserId);
    if (!rec) return;
    rec.wallets = rec.wallets.filter(w => w.address !== address);
    if (rec.primaryWallet === address) rec.primaryWallet = rec.wallets[0]?.address ?? null;
  }

  setPrimary(privyUserId: string, address: string) {
    const rec = this.users.get(privyUserId);
    if (!rec) throw new BadRequestException('User not found');
    if (!rec.wallets.some(w => w.address === address)) {
      throw new BadRequestException('Wallet not linked');
    }
    const now = Date.now();
    if (this.cooldownMs && rec.lastPrimaryChangeAt && now - rec.lastPrimaryChangeAt < this.cooldownMs) {
      throw new ForbiddenException('Primary wallet change is in cooldown');
    }
    rec.primaryWallet = address;
    rec.lastPrimaryChangeAt = now;
  }
}



