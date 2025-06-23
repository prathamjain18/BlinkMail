import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import HamburgerIcon from './HamburgerIcon';

const Layout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-background-light dark:bg-background-dark px-6 md:hidden">
          <button onClick={toggleSidebar} className="text-text-light dark:text-text-dark">
            <HamburgerIcon />
            <span className="sr-only">Toggle sidebar</span>
          </button>
        </header>
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;