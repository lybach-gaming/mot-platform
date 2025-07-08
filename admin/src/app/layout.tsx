'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import navigation from '../../data/navigation.json';
import Image from 'next/image';
import './global.css';
import { NavigationItem } from '@/types/navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = () => setCollapsed(!collapsed);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const userMenu: NavigationItem[] = [
    { label: 'Profile', url: '/profile', icon: 'fas fa-user' },
    { label: 'Reset Password', url: '/resetpassword', icon: 'fas fa-key' },
    { label: 'Logout', url: '/logout', icon: 'fas fa-sign-out-alt' },
  ];

  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-pX...YOUR_HASH..."
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
          }}
        >
          <div
            id="topbar"
            className="flex items-center justify-between px-4 py-2 bg-sidebar text-white"
          >
            <div className="flex items-center space-x-4">
              <Image
                src={collapsed ? '/half-logo.png' : '/full-logo.png'}
                alt="Logo"
                width={collapsed ? 50 : 150}
                height={collapsed ? 75 : 40}
                priority
              />
              <button
                onClick={() => toggleSidebar()}
                className="
        text-[var(--color-accent)]
        hover:text-white
        p-2
        transition-colors
        duration-200
      "
                aria-label="Toggle sidebar"
              >
                <i className="fas fa-bars text-xl"></i>
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 text-white hover:text-[var(--color-accent)] focus:outline-none"
              >
                <i className="fa fa-user-circle text-xl"></i>
                <span className="hidden sm:inline">Hi, Admin</span>
                <i
                  className={`fas fa-chevron-down text-xs transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                ></i>
              </button>

              {dropdownOpen && (
                <div className="absolute bg-[var(--color-navigation-dropdown-bg)] right-0 mt-2 w-48 text-white rounded-sm shadow z-50">
                  {userMenu.map((item) => (
                    <a
                      key={item.label}
                      href={item.url}
                      className="flex items-center px-4 py-2 hover:bg-[var(--color-accent)]"
                    >
                      {item.icon && <i className={`${item.icon} mr-2`}></i>}
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flex: 1 }}>
            <div
              id="sidebar"
              style={{
                width: collapsed ? '65px' : '250px',
                transition: 'width 0.3s',
                overflow: 'hidden',
              }}
            >
              <Sidebar
                navigation={navigation as NavigationItem[]}
                collapsed={collapsed}
              />
            </div>

            <div id="content" style={{ flex: 1 }}>
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
