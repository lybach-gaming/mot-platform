export interface User {
  id: number;
  projectId: number;
  projectUserId?: string;
  address?: string;
  email?: string;
  emailVerified: boolean;
  chain?: string;
  metadata?: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  twoFactorEnabled: boolean;
  notificationsEmail: boolean;
  notificationsPush: boolean;
  theme: 'light' | 'dark' | 'system';
  locale: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  projectId: number;
  projectUserId?: string;
  address?: string;
  email?: string;
  chain?: string;
  metadata?: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  twoFactorEnabled?: boolean;
  notificationsEmail?: boolean;
  notificationsPush?: boolean;
  theme?: 'light' | 'dark' | 'system';
  locale?: string;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  id: number;
}

export interface UserProfile {
  id: number;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  email?: string;
  emailVerified: boolean;
  address?: string;
  chain?: string;
  createdAt: Date;
}

export interface UserSettings {
  id: number;
  twoFactorEnabled: boolean;
  notificationsEmail: boolean;
  notificationsPush: boolean;
  theme: 'light' | 'dark' | 'system';
  locale: string;
}

