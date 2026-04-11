'use client';

import { useState, type ReactNode } from 'react';
import { Header } from '@/components/shared/header';
import { Sidebar } from '@/components/shared/sidebar';

interface AdminShellProps {
  children: ReactNode;
}

export const AdminShell = ({ children }: AdminShellProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-slate-50 text-slate-900">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-5 lg:py-8">
          <div className="w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
};