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

  return (
    <html lang="en">
      <head>
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
          <div id="topbar">
            <Image
             className='mr-12'
              src="/full-logo.png"
              alt="Logo"
              width={150}
              height={40}
              priority
            />
            <button
              onClick={toggleSidebar}
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

          <div style={{ display: 'flex', flex: 1 }}>
            <div
              id="sidebar"
              style={{
                width: collapsed ? '60px' : '250px',
                transition: 'width 0.3s',
                overflow: 'hidden',
              }}
            >
              <Sidebar navigation={navigation as NavigationItem[]} />
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
