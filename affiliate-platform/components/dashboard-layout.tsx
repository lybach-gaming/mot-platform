'use client';

import type React from 'react';
import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import TopHeader from '@/components/top-header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <TopHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Content area */}
        <main className="flex-1 overflow-auto bg-background p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
