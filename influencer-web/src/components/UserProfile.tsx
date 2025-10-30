import React from 'react';
import { UserProfile as UserProfileType } from '../types/user';

interface UserProfileProps {
  user: UserProfileType;
  onEdit?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onEdit }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
        {onEdit && (
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="flex items-start space-x-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.displayName || user.username || 'User'}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-2xl text-gray-600">
                {user.displayName?.charAt(0) || user.username?.charAt(0) || 'U'}
              </span>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {user.displayName || user.username || 'No name set'}
            </h3>
            {user.username && user.displayName && (
              <p className="text-gray-600">@{user.username}</p>
            )}
          </div>

          {user.bio && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Bio</h4>
              <p className="text-gray-600">{user.bio}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.email && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Email</h4>
                <div className="flex items-center space-x-2">
                  <p className="text-gray-600">{user.email}</p>
                  {user.emailVerified ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Unverified
                    </span>
                  )}
                </div>
              </div>
            )}

            {user.address && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Address</h4>
                <p className="text-gray-600 font-mono text-sm">{user.address}</p>
              </div>
            )}

            {user.chain && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Chain</h4>
                <p className="text-gray-600 capitalize">{user.chain}</p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Member Since</h4>
              <p className="text-gray-600">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
