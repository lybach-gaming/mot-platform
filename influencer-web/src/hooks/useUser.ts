import { useState, useEffect, useCallback } from 'react';
import { User, CreateUserRequest, UpdateUserRequest, UserProfile, UserSettings } from '../types/user';

// Mock API functions - replace with actual API calls
const mockUsers: User[] = [
  {
    id: 1,
    projectId: 1001,
    projectUserId: 'user_001',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    email: 'john.doe@example.com',
    emailVerified: true,
    chain: 'ethereum',
    metadata: '{"role": "influencer", "tier": "gold"}',
    username: 'johndoe',
    displayName: 'John Doe',
    avatarUrl: 'https://via.placeholder.com/150',
    bio: 'Crypto enthusiast and content creator',
    twoFactorEnabled: false,
    notificationsEmail: true,
    notificationsPush: true,
    theme: 'system',
    locale: 'en',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 2,
    projectId: 1002,
    projectUserId: 'user_002',
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    email: 'jane.smith@example.com',
    emailVerified: true,
    chain: 'polygon',
    metadata: '{"role": "affiliate", "tier": "silver"}',
    username: 'janesmith',
    displayName: 'Jane Smith',
    avatarUrl: 'https://via.placeholder.com/150',
    bio: 'DeFi expert and community manager',
    twoFactorEnabled: true,
    notificationsEmail: true,
    notificationsPush: false,
    theme: 'dark',
    locale: 'en',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
  },
];

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
const fetchUsers = async (): Promise<User[]> => {
  await delay(500);
  return [...mockUsers];
};

const fetchUser = async (id: number): Promise<User | null> => {
  await delay(300);
  return mockUsers.find(user => user.id === id) || null;
};

const createUser = async (userData: CreateUserRequest): Promise<User> => {
  await delay(800);
  const newUser: User = {
    ...userData,
    id: Math.max(...mockUsers.map(u => u.id)) + 1,
    emailVerified: false,
    twoFactorEnabled: userData.twoFactorEnabled || false,
    notificationsEmail: userData.notificationsEmail ?? true,
    notificationsPush: userData.notificationsPush ?? true,
    theme: userData.theme || 'system',
    locale: userData.locale || 'en',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockUsers.push(newUser);
  return newUser;
};

const updateUser = async (userData: UpdateUserRequest): Promise<User> => {
  await delay(600);
  const userIndex = mockUsers.findIndex(user => user.id === userData.id);
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  const updatedUser: User = {
    ...mockUsers[userIndex],
    ...userData,
    updatedAt: new Date(),
  };
  mockUsers[userIndex] = updatedUser;
  return updatedUser;
};

const deleteUser = async (id: number): Promise<void> => {
  await delay(400);
  const userIndex = mockUsers.findIndex(user => user.id === id);
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  mockUsers.splice(userIndex, 1);
};

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  const createUserHandler = useCallback(async (userData: CreateUserRequest) => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await createUser(userData);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserHandler = useCallback(async (userData: UpdateUserRequest) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await updateUser(userData);
      setUsers(prev => prev.map(user => user.id === updatedUser.id ? updatedUser : user));
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUserHandler = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    users,
    loading,
    error,
    loadUsers,
    createUser: createUserHandler,
    updateUser: updateUserHandler,
    deleteUser: deleteUserHandler,
  };
};

export const useUser = (id: number) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUser(id);
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const updateUserHandler = useCallback(async (userData: UpdateUserRequest) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await updateUser(userData);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      loadUser();
    }
  }, [id, loadUser]);

  return {
    user,
    loading,
    error,
    loadUser,
    updateUser: updateUserHandler,
  };
};

export const useUserProfile = (id: number) => {
  const { user, loading, error } = useUser(id);
  
  const userProfile: UserProfile | null = user ? {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    email: user.email,
    emailVerified: user.emailVerified,
    address: user.address,
    chain: user.chain,
    createdAt: user.createdAt,
  } : null;

  return {
    userProfile,
    loading,
    error,
  };
};

export const useUserSettings = (id: number) => {
  const { user, loading, error, updateUser } = useUser(id);
  
  const userSettings: UserSettings | null = user ? {
    id: user.id,
    twoFactorEnabled: user.twoFactorEnabled,
    notificationsEmail: user.notificationsEmail,
    notificationsPush: user.notificationsPush,
    theme: user.theme,
    locale: user.locale,
  } : null;

  const updateSettings = useCallback(async (settings: UserSettings) => {
    return updateUser(settings);
  }, [updateUser]);

  return {
    userSettings,
    loading,
    error,
    updateSettings,
  };
};
