import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { SettingService } from '../../app/setting/setting.service';
import { SettingType } from '../constants/setting-key';
import { AppLogger } from '../../core/logger/app-logger';

@Injectable()
export class AttachUserMiddleware implements NestMiddleware {
  private readonly logger = new AppLogger(AttachUserMiddleware.name);

  constructor(private readonly settingService: SettingService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      try {
        const jwtSecret = await this.settingService.getSetting(SettingType.JwtKey);
        if (!jwtSecret) {
          this.logger.warn('⚠️ JWT secret not found in settings');
          return next();
        }

        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded;
      } catch (err) {
        //
      }
    }

    next();
  }
}
