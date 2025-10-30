import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AttachUserMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AttachUserMiddleware.name);
  private readonly jwtSecret: string;

  constructor(private readonly configService: ConfigService) {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET is required');
    this.jwtSecret = secret;
  }

  async use(req: any, _res: any, next: () => void) {
    const authHeader = req.headers?.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      if (token) {
        try {
          const decoded = jwt.verify(token, this.jwtSecret);
          req.user = decoded;
        } catch (err) {
          this.logger.debug('JWT verification failed');
        }
      }
    }
    next();
  }
}



