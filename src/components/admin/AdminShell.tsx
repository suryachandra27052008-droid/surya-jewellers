'use client';

import Sidebar from './Sidebar';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f8f9fb' }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-[1400px]">
          {children}
        </div>
      </main>
    </div>
  );
}
