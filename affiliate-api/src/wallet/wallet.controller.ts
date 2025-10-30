import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../common/auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
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
  getWallets(@CurrentUser('privyUserId') privyUserId: string) {
    return this.walletService.getWallets(privyUserId);
  }

  @Post('connect')
  connect(@CurrentUser('privyUserId') privyUserId: string, @Body() dto: ConnectDto) {
    this.walletService.connectExternal(privyUserId, { address: dto.address, chainType: dto.chainType });
    return { ok: true };
  }

  @Post('disconnect')
  disconnect(@CurrentUser('privyUserId') privyUserId: string, @Body() dto: DisconnectDto) {
    this.walletService.disconnectExternal(privyUserId, dto.address);
    return { ok: true };
  }

  @Post('primary')
  setPrimary(@CurrentUser('privyUserId') privyUserId: string, @Body() dto: SetPrimaryDto) {
    this.walletService.setPrimary(privyUserId, dto.address);
    return { ok: true };
  }
}



