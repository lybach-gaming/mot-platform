"use client";

import { useEffect, useState } from 'react';
import { useUsers } from '../hooks/useUser';

export default function Index() {
  const { users, loading, error } = useUsers();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('isAuthed') : null;
    setIsAuthenticated(saved === 'true');
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') window.localStorage.setItem('isAuthed', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') window.localStorage.setItem('isAuthed', 'false');
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome</h1>
            <p className="mt-1 text-gray-600">Log in or browse users and view profiles.</p>
          </div>
          <div>
            {isAuthenticated ? (
              <button onClick={handleLogout} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Log out</button>
            ) : (
              <button onClick={handleLogin} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Log in</button>
            )}
          </div>
        </div>

        {!isAuthenticated && (
          <div className="mb-10 p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900">You are not logged in</h2>
            <p className="mt-2 text-gray-600">Click Log in above to simulate authentication.</p>
          </div>
        )}

        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Users</h2>
            {loading && <span className="text-gray-500 text-sm">Loading...</span>}
          </div>
          {error && <div className="text-red-600 mb-4">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((u) => (
              <a key={u.id} href={`/profile/${u.id}`} className="block p-4 border rounded hover:shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{u.displayName || u.username}</div>
                    <div className="text-sm text-gray-600">ID: {u.id}</div>
                  </div>
                  <span className="text-blue-600 text-sm">View</span>
                </div>
              </a>
            ))}
            {!loading && users.length === 0 && (
              <div className="text-gray-600">No users found.</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
