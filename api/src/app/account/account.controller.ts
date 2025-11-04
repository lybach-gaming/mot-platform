import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AccountService } from './account.service';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';

@Controller('/v2')
@ApiBearerAuth()
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('/get-user-by-id')
  @UseGuards(AuthGuard)
  getUserById(@CurrentUser('user_id') userId: number) {
    return this.accountService.getUserById(userId);
  }

  @Patch('/update-user-preferences')
  @UseGuards(AuthGuard)
  updateUserPreferences(
    @CurrentUser('user_id') userId: number,
    @Body() dto: UpdateUserPreferencesDto,
  ) {
    return this.accountService.updateUserPreferences(userId, dto);
  }
}
