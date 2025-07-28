import {
  Injectable,
  Logger,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class AdminGuardMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AdminGuardMiddleware.name);

  async use(req: Request, res: Response, next: NextFunction) {
    const path = req.originalUrl;

    // Skip if route doesn't start with /api/v2/admin
    if (!path.startsWith('/api/v2/admin')) {
      return next();
    }

    // Get session_id from cookies or fallback to query param
    const sessionId = req.cookies?.session_id || req.query?.session_id;

    if (!sessionId) {
      this.logger.debug('session_id cookie missing');
      return res.status(401).json({ message: 'Unauthorized: No session_id' });
    }

    // Call legacy API to verify session
    const verifyUrl = `${process.env.LEGACY_API_URL}/api/verify_session?session_id=${sessionId}`;
    const response = await axios.get(verifyUrl, {
      validateStatus: () => true,
    });

    // If session is invalid, block request
    if (!response?.data?.success) {
      this.logger.debug(
        `Invalid session for ID: ${sessionId}`,
        response?.data?.error
      );
      throw new UnauthorizedException(response?.data?.error);
    }

    next();
  }
}
