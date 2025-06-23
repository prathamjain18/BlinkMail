import { NavLink } from 'react-router-dom';
import {
  InboxIcon,
  PaperAirplaneIcon,
  PencilSquareIcon,
  DocumentDuplicateIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline';
import './Sidebar.css';
import { useState, useEffect } from 'react';
import { MdDarkMode, MdLightMode } from 'react-icons/md';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Get user info from localStorage
  const [userName, setUserName] = useState('');
  useEffect(() => {
    const firstName = localStorage.getItem('firstName');
    const lastName = localStorage.getItem('lastName');
    const email = localStorage.getItem('email');
    if (firstName || lastName) {
      setUserName(`${firstName || ''} ${lastName || ''}`.trim());
    } else if (email) {
      setUserName(email);
    } else {
      setUserName('Account');
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((v) => !v);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '/login';
  };

  const navLinkClasses =
    'flex items-center gap-3 rounded-lg px-3 py-2 text-text-secondary-light dark:text-text-secondary-dark transition-all hover:text-text-light dark:hover:text-text-dark';
  const activeClassName = ' bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark';

  return (
    <>
      <div
        className={`sidebar ${isOpen ? 'open' : ''} flex h-full max-h-screen flex-col gap-2 bg-background-light dark:bg-background-dark border-r border-gray-200 dark:border-gray-800 w-64 md:relative`}
      >
        <div className="flex h-[60px] items-center px-6">
          <NavLink to="/" className="flex items-center gap-2 font-semibold">
            <InboxIcon className="h-6 w-6" />
            <span>BlinkMail</span>
          </NavLink>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            <NavLink to="/compose" className={({ isActive }) => navLinkClasses + (isActive ? activeClassName : '')}>
              <PencilSquareIcon className="h-4 w-4" />
              Compose
            </NavLink>
            <NavLink to="/inbox" className={({ isActive }) => navLinkClasses + (isActive ? activeClassName : '')}>
              <InboxIcon className="h-4 w-4" />
              Inbox
            </NavLink>
            <NavLink to="/sent" className={({ isActive }) => navLinkClasses + (isActive ? activeClassName : '')}>
              <PaperAirplaneIcon className="h-4 w-4" />
              Sent
            </NavLink>
            <NavLink to="/drafts" className={({ isActive }) => navLinkClasses + (isActive ? activeClassName : '')}>
              <DocumentDuplicateIcon className="h-4 w-4" />
              Drafts
            </NavLink>
          </nav>
        </div>
        <div className="mt-auto p-4 flex flex-col gap-2">
          {/* User info display */}
          <div className="mb-2 px-3 py-2 rounded-lg bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark font-medium flex items-center gap-2">
            <span className="inline-block h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center font-bold uppercase">
              {userName ? userName[0] : '?'}
            </span>
            <span className="truncate">{userName}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-text-secondary-light dark:text-text-secondary-dark transition-all hover:text-text-light dark:hover:text-text-dark w-full"
          >
            <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
            Logout
          </button>
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-3 rounded-lg px-3 py-2 mt-2 text-text-secondary-light dark:text-text-secondary-dark transition-all hover:text-text-light dark:hover:text-text-dark w-full border border-border-light dark:border-border-dark"
          >
            {/* Swap the icons and label */}
            {isDarkMode ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>
      {/* Overlay */}
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
    </>
  );
};

export default Sidebar; 