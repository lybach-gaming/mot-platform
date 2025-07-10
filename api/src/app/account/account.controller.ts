import { Controller, Get, UseGuards } from '@nestjs/common';
import { AccountService } from './account.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('/v2')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('/get_user_by_id')
  @UseGuards(AuthGuard)
  getUserById(@CurrentUser('user_id') userId: number) {
    return this.accountService.getUserById(userId);
  }
}
