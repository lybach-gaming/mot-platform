import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { UserEntity } from './user.entity';

export interface UpdateProfileDto {
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  country?: string;
  timezone?: string;
  referralSlug?: string;
}

export interface UpdateSettingsDto {
  twoFactorEnabled?: boolean;
  notificationsEmail?: boolean;
  notificationsPush?: boolean;
  theme?: 'light' | 'dark' | 'system';
  locale?: string;
  timezone?: string;
  payoutCurrency?: string;
  privacy?: Record<string, unknown> | null;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>
  ) {}

  async getByIdOrThrow(id: number): Promise<UserEntity> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getMe(userId: number): Promise<UserEntity> {
    return this.getByIdOrThrow(userId);
  }

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<UserEntity> {
    await this.repo.update({ id: userId }, dto);
    return this.getByIdOrThrow(userId);
  }

  async updateSettings(userId: number, dto: UpdateSettingsDto): Promise<UserEntity> {
    const update: Partial<UserEntity> = {};
    if (dto.twoFactorEnabled !== undefined) update.twoFactorEnabled = dto.twoFactorEnabled;
    if (dto.notificationsEmail !== undefined) update.notificationsEmail = dto.notificationsEmail;
    if (dto.notificationsPush !== undefined) update.notificationsPush = dto.notificationsPush;
    if (dto.theme !== undefined) update.theme = dto.theme;
    if (dto.locale !== undefined) update.locale = dto.locale;
    if (dto.timezone !== undefined) update.timezone = dto.timezone;
    if (dto.payoutCurrency !== undefined) update.payoutCurrency = dto.payoutCurrency;
    if (dto.privacy !== undefined) update.privacy = dto.privacy as Record<string, unknown> | null;
    await this.repo.update({ id: userId }, update as QueryDeepPartialEntity<UserEntity>);
    return this.getByIdOrThrow(userId);
  }

  async setEmail(userId: number, email: string): Promise<UserEntity> {
    await this.repo.update({ id: userId }, { email, emailVerified: false });
    return this.getByIdOrThrow(userId);
  }

  async markEmailVerified(userId: number): Promise<UserEntity> {
    await this.repo.update({ id: userId }, { emailVerified: true });
    return this.getByIdOrThrow(userId);
  }

  async getByReferralSlug(slug: string): Promise<UserEntity | null> {
    return this.repo.findOne({ where: { referralSlug: slug } });
  }

  async markEmailVerifiedByEmailOrProjectUserId(projectId: number, identifier: { email?: string; projectUserId?: string }): Promise<void> {
    const where: { projectId: number; email?: string; projectUserId?: string } = { projectId };
    if (identifier.email) where.email = identifier.email;
    if (identifier.projectUserId) where.projectUserId = identifier.projectUserId;
    const user = await this.repo.findOne({ where });
    if (user && !user.emailVerified) {
      await this.repo.update({ id: user.id }, { emailVerified: true });
    }
  }
}


