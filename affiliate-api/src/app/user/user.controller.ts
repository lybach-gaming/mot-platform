import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserService } from './user.service';
import type { UpdateProfileDto, UpdateSettingsDto } from './user.service';

@Controller('user')
@ApiBearerAuth()
@ApiTags('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Profile Management
  @Get('me/profile')
  @UseGuards(AuthGuard)
  getMyProfile(@CurrentUser() user: any) {
    return this.userService.getMe(Number(user?.id));
  }

  @Patch('me/profile')
  @UseGuards(AuthGuard)
  updateMyProfile(@CurrentUser() user: any, @Body() body: UpdateProfileDto) {
    return this.userService.updateProfile(Number(user?.id), body);
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.userService.getByReferralSlug(slug);
  }

  // Preferences & Configuration
  @Get('me/preferences')
  @UseGuards(AuthGuard)
  getMyPreferences(@CurrentUser() user: any) {
    return this.userService.getMe(Number(user?.id));
  }

  @Patch('me/preferences')
  @UseGuards(AuthGuard)
  updateMyPreferences(@CurrentUser() user: any, @Body() body: UpdateSettingsDto) {
    return this.userService.updateSettings(Number(user?.id), body);
  }

  // Email
  @Post('email')
  @UseGuards(AuthGuard)
  setEmail(@CurrentUser() user: any, @Body() body: { email: string }) {
    return this.userService.setEmail(Number(user?.id), body.email);
  }

  // Optional fallback verification token flow
  @Post('email/verify/callback')
  @UseGuards(AuthGuard)
  verifyEmailCallback(@CurrentUser() user: any, @Body() _body: { token: string }) {
    return this.userService.markEmailVerified(Number(user?.id));
  }

  // Account Security Settings (placeholders)
  @Get('me/sessions')
  @UseGuards(AuthGuard)
  listSessions() {
    return { sessions: [] };
  }

  @Delete('me/sessions/:sessionId')
  @UseGuards(AuthGuard)
  revokeSession(@Param('sessionId') _sessionId: string) {
    return { revoked: true };
  }

  @Post('me/2fa/setup')
  @UseGuards(AuthGuard)
  setupTOTP() {
    return { otpauthUrl: null };
  }

  @Post('me/2fa/enable')
  @UseGuards(AuthGuard)
  enableTOTP(@Body() _body: { code: string }) {
    return { enabled: false };
  }

  @Post('me/2fa/disable')
  @UseGuards(AuthGuard)
  disableTOTP(@Body() _body: { code?: string }) {
    return { disabled: true };
  }

  @Get('me/wallets')
  @UseGuards(AuthGuard)
  getLinkedWallets() {
    return { wallets: [] };
  }

  @Delete('me/wallets/:address')
  @UseGuards(AuthGuard)
  unlinkWallet(@Param('address') _address: string) {
    return { unlinked: true };
  }

  @Post('me/password')
  @UseGuards(AuthGuard)
  changePassword() {
    return { supported: false };
  }
}
