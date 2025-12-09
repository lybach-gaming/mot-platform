import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { WalletService } from './wallet.service';

class ConnectDto { address!: string; chainType!: string }
class DisconnectDto { address!: string }
class SetPrimaryDto { address!: string }

@ApiTags('Wallets')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) { }

  @Get()
  async getWallets(@CurrentUser('privy_user_id') privyUserId: string) {
    return this.walletService.getWallets(privyUserId);
  }

  @Post('connect')
  async connect(@CurrentUser('privy_user_id') privyUserId: string, @Body() dto: ConnectDto) {
    await this.walletService.connectExternal(privyUserId, dto.address, dto.chainType);
    return { ok: true };
  }

  @Post('disconnect')
  async disconnect(@CurrentUser('privy_user_id') privyUserId: string, @Body() dto: DisconnectDto) {
    await this.walletService.disconnectExternal(privyUserId, dto.address);
    return { ok: true };
  }

  @Post('primary')
  async setPrimary(@CurrentUser('privy_user_id') privyUserId: string, @Body() dto: SetPrimaryDto) {
    await this.walletService.setPrimary(privyUserId, dto.address);
    return { ok: true };
  }
}










