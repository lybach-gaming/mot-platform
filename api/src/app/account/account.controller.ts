import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AccountService } from './account.service';
import {
  GetUserByIdResponseDto,
  UpdateUserPreferencesResponseDto,
} from './dto/account.dto';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';

@Controller('/v2')
@ApiBearerAuth()
@ApiTags('Account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('/get-user-by-id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get user by id',
    description: 'This endpoint retrieves user details for the authenticated user.',
  })
  @ApiOkResponse({
    description: 'The user details have been successfully retrieved.',
    type: GetUserByIdResponseDto,
  })
  getUserById(@CurrentUser('user_id') userId: number) {
    return this.accountService.getUserById(userId);
  }

  @Patch('/update-user-preferences')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Update user preferences',
    description: 'This endpoint updates the locale and timezone for the authenticated user.',
  })
  @ApiOkResponse({
    description: 'User preferences updated successfully.',
    type: UpdateUserPreferencesResponseDto,
  })
  updateUserPreferences(
    @CurrentUser('user_id') userId: number,
    @Body() dto: UpdateUserPreferencesDto,
  ) {
    return this.accountService.updateUserPreferences(userId, dto);
  }
}
