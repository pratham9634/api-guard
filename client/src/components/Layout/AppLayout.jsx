import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface-primary text-text-primary">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 flex flex-col min-w-0 md:pl-[260px]">
        <Topbar onMenuToggle={() => setSidebarOpen((v) => !v)} />
        <div className="p-6 md:p-8 flex-1 overflow-y-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
