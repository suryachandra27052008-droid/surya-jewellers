'use client';

import Sidebar from './Sidebar';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden print:block print:h-auto print:overflow-visible" style={{ background: '#f8f9fb' }}>
      <div className="h-full shrink-0 print:hidden"><Sidebar /></div>
      <main className="flex-1 overflow-y-auto print:overflow-visible">
        <div className="p-6 lg:p-8 max-w-[1400px] print:p-0">
          {children}
        </div>
      </main>
    </div>
  );
}
