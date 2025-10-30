import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrivyAuthService } from './privy-auth.service';

class VerifyDto { token!: string }

@ApiTags('Auth')
@Controller('auth/privy')
export class PrivyAuthController {
  constructor(private readonly privyService: PrivyAuthService) { }

  @Post('verify')
  async verify(@Body() dto: VerifyDto) {
    const { sessionUser, platformJwt } = await this.privyService.verifyPrivyTokenAndBuildSession(dto.token);
    return { accessToken: platformJwt, user: sessionUser };
  }
}



