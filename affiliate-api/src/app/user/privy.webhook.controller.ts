import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';

interface PrivyEmailVerifiedEvent {
  type: 'email_verified';
  projectId: number;
  email?: string;
  projectUserId?: string;
}

@Controller('webhooks/privy')
@ApiTags('webhooks')
export class PrivyWebhookController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async handle(@Body() body: PrivyEmailVerifiedEvent) {
    if (body?.type === 'email_verified' && body?.projectId) {
      await this.userService.markEmailVerifiedByEmailOrProjectUserId(body.projectId, {
        email: body.email,
        projectUserId: body.projectUserId,
      });
      return { ok: true };
    }
    return { ok: false };
  }
}


