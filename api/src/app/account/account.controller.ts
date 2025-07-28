import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AccountService } from './account.service';

@Controller('/v2')
@ApiBearerAuth()
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('/get_user_by_id')
  @UseGuards(AuthGuard)
  getUserById(@CurrentUser('user_id') userId: number) {
    return this.accountService.getUserById(userId);
  }

  @Get('/admin/test')
  get(@CurrentUser('user_id') userId: number) {
    return { success: true };
  }
}
