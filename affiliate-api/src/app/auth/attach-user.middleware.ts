import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AttachUserMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AttachUserMiddleware.name);
  private readonly jwtSecret: string;

  constructor(private readonly configService: ConfigService) {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required for authentication');
    }
    this.jwtSecret = secret;
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      if (!token) {
        return next();
      }
      try {
        const decoded = jwt.verify(token, this.jwtSecret);
        req.user = decoded;
      } catch (err) {
        this.logger.debug('JWT verification failed:', err);
      }
    }
    next();
  }
}
