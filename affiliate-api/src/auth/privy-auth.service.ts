import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrivyClient } from '@privy-io/server-auth';
import { WalletService } from '../wallet/wallet.service';

export interface SessionUser {
  privyUserId: string;
  email?: string | null;
  phone?: string | null;
  wallets: Array<{ address: string; chainType: string; embedded?: boolean }>;
  primaryWallet?: string | null;
}

@Injectable()
export class PrivyAuthService {
  private client: PrivyClient;
  private jwtSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    const appId = this.configService.get<string>('PRIVY_APP_ID');
    const appSecret = this.configService.get<string>('PRIVY_APP_SECRET');
    if (!appId || !appSecret) {
      throw new Error('Missing PRIVY_APP_ID/PRIVY_APP_SECRET');
    }
    this.client = new PrivyClient({ appId, appSecret });
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) throw new Error('Missing JWT_SECRET');
    this.jwtSecret = secret;
  }

  async verifyPrivyTokenAndBuildSession(privyToken: string): Promise<{
    sessionUser: SessionUser;
    platformJwt: string;
  }> {
    const verified = await this.client.verifyAuthToken(privyToken).catch(() => null);
    if (!verified) throw new UnauthorizedException('Invalid Privy token');

    const { user } = verified; // includes id, email, phone, wallets
    const wallets = (user?.wallets || []).map((w: any) => ({
      address: w.address,
      chainType: w.chain_type || w.chainType || 'solana',
      embedded: Boolean(w.embedded || w.type === 'embedded'),
    }));

    const sessionUser: SessionUser = {
      privyUserId: user.id,
      email: user.email?.address ?? null,
      phone: user.phone?.number ?? null,
      wallets,
      primaryWallet: wallets[0]?.address ?? null,
    };

    // sync to current store (in-memory now; swap with DB later)
    try {
      // lazy import to avoid circulars in constructor
      const walletService = (global as any).walletService as WalletService | undefined;
      if (walletService) {
        walletService.ensureUser({ privyUserId: sessionUser.privyUserId, wallets });
      }
    } catch {}

    const platformJwt = await this.signPlatformJwt(sessionUser);
    return { sessionUser, platformJwt };
  }

  async signPlatformJwt(payload: SessionUser): Promise<string> {
    return this.jwtService.signAsync(payload as any, {
      secret: this.jwtSecret,
      expiresIn: '7d',
    });
  }
}



