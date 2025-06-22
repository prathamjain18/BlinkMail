import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  InboxIcon,
  PaperAirplaneIcon,
  PencilSquareIcon,
  HomeIcon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

interface LayoutProps {
  children: ReactNode;
  onLogout?: () => void;
}

const Layout = ({ children, onLogout }: LayoutProps) => {
  const location = useLocation();
  // State for sidebar visibility on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // State for dark mode
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  // State for displaying the user's name
  const [userName, setUserName] = useState('User');

  // Toggle dark mode and persist preference in localStorage
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newMode;
    });
  };

  // On mount and when darkMode changes, update the document class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // On mount, retrieve user name from localStorage
  useEffect(() => {
    const firstName = localStorage.getItem('firstName') || '';
    const lastName = localStorage.getItem('lastName') || '';
    if (firstName || lastName) {
      setUserName(`${firstName} ${lastName}`.trim());
    } else {
      setUserName('User');
    }
  }, []);

  // Navigation links for the sidebar
  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Inbox', href: '/inbox', icon: InboxIcon },
    { name: 'Sent', href: '/sent', icon: PaperAirplaneIcon },
    { name: 'Drafts', href: '/drafts', icon: PencilSquareIcon },
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark flex">
      {/* Sidebar navigation */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 card transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-64'}
        md:translate-x-0 md:static md:inset-0`}
      >
        <div className="flex h-16 items-center justify-center border-b border-border-light dark:border-border-dark">
          <h1 className="text-xl font-bold text-primary dark:text-primary-light">Email App</h1>
        </div>
        <div className="flex flex-col items-center py-6">
          <UserCircleIcon className="h-14 w-14 text-text-secondary-light dark:text-text-secondary-dark mb-2" />
          <span className="text-text-light dark:text-text-dark font-semibold">{userName}</span>
        </div>
        <nav className="mt-2 px-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                  ${isActive ? 'bg-primary text-white' : 'text-text-light dark:text-text-dark hover:bg-surface-light dark:hover:bg-surface-dark hover:text-primary dark:hover:text-primary-light'}`}
              >
                <item.icon
                  className={`mr-3 h-6 w-6 flex-shrink-0
                    ${isActive ? 'text-white' : 'text-text-secondary-light group-hover:text-primary dark:group-hover:text-primary-light'}`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen md:pl-64">
        {/* Header with navigation and actions */}
        <header className="card flex items-center h-16 px-4 justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            {/* Sidebar toggle button for mobile */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-surface-light dark:hover:bg-surface-dark"
              onClick={() => setSidebarOpen((open) => !open)}
            >
              <svg className="h-6 w-6 text-text-light dark:text-text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-lg font-medium text-text-light dark:text-text-dark">
              {navigation.find((item) => item.href === location.pathname)?.name || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Dark mode toggle button */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-surface-light dark:hover:bg-surface-dark transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <SunIcon className="h-5 w-5 text-yellow-400" />
              ) : (
                <MoonIcon className="h-5 w-5 text-text-light dark:text-text-dark" />
              )}
            </button>
            {/* Compose email button */}
            <Link
              to="/compose"
              className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-light dark:bg-primary-dark dark:hover:bg-primary"
            >
              <PencilSquareIcon className="mr-2 h-5 w-5" />
              Compose
            </Link>
            {/* Logout button, if provided */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="inline-flex items-center rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="py-6 flex-1 bg-background dark:bg-background-dark transition-colors duration-300">
          <div className="px-2 sm:px-4 lg:px-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 