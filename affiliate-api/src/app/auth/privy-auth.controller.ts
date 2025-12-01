import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrivyAuthService } from './privy-auth.service';

class VerifyDto { token!: string }

@ApiTags('Auth')
@Controller('auth/privy')
export class PrivyAuthController {
  constructor(private readonly service: PrivyAuthService) { }

  @Post('verify')
  async verify(@Body() dto: VerifyDto) {
    const result = await this.service.verifyAndUpsert(dto.token);
    return result;
  }
}










