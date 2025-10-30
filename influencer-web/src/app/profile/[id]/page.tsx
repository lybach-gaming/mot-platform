'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useUserProfile } from '../../../hooks/useUser';
import { useUserSettings } from '../../../hooks/useUser';
import { UserProfile } from '../../../components/UserProfile';
import { UserSettings } from '../../../components/UserSettings';
import { UserForm } from '../../../components/UserForm';

export default function ProfileByIdPage() {
  const params = useParams();
  const idParam = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const userId = Number(idParam);

  const { userProfile, loading: profileLoading, error: profileError } = useUserProfile(userId);
  const { userSettings, loading: settingsLoading, error: settingsError, updateSettings } = useUserSettings(userId);
  
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'edit'>('profile');

  const handleEditProfile = () => {
    setActiveTab('edit');
  };

  const handleSaveProfile = async (userData: any) => {
    try {
      console.log('Saving profile:', userData);
      setActiveTab('profile');
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleSaveSettings = async (settings: any) => {
    try {
      await updateSettings(settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  if (!Number.isFinite(userId)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Invalid profile ID</div>
          <p className="text-gray-600">Please provide a numeric user id in the URL.</p>
        </div>
      </div>
    );
  }

  if (profileLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (profileError || settingsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600">{profileError || settingsError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-2 text-gray-600">Manage your profile and account settings</p>
        </div>

        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        {activeTab === 'profile' && userProfile && (
          <UserProfile user={userProfile} onEdit={handleEditProfile} />
        )}

        {activeTab === 'settings' && userSettings && (
          <UserSettings
            settings={userSettings}
            onSave={handleSaveSettings}
            isLoading={settingsLoading}
          />
        )}

        {activeTab === 'edit' && userProfile && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
              <button
                onClick={() => {
                  setActiveTab('profile');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
            <UserForm
              user={{
                id: userProfile.id,
                projectId: 0,
                projectUserId: '',
                address: userProfile.address,
                email: userProfile.email,
                emailVerified: userProfile.emailVerified,
                chain: userProfile.chain,
                metadata: '',
                username: userProfile.username,
                displayName: userProfile.displayName,
                avatarUrl: userProfile.avatarUrl,
                bio: userProfile.bio,
                twoFactorEnabled: false,
                notificationsEmail: true,
                notificationsPush: true,
                theme: 'system',
                locale: 'en',
                createdAt: userProfile.createdAt,
                updatedAt: new Date(),
              }}
              onSubmit={handleSaveProfile}
              onCancel={() => {
                setActiveTab('profile');
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}


