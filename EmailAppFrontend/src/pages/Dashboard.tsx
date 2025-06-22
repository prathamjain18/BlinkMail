import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { InboxIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

// Email interface for type safety
interface Email {
  id: number;
  subject: string;
  sender: string;
  recipient: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

const Dashboard = () => {
  // State for recent emails
  const [recentEmails, setRecentEmails] = useState<Email[]>([]);
  // State for loading indicator
  const [loading, setLoading] = useState(true);

  // Fetch recent emails on component mount
  useEffect(() => {
    const fetchRecentEmails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/email/inbox', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecentEmails(response.data.slice(0, 5)); // Show only the 5 most recent emails
      } catch (error) {
        console.error('Error fetching emails:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentEmails();
  }, []);

  return (
    <div className="p-4 space-y-10">
      {/* Quick navigation cards */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <Link
          to="/inbox"
          className="flex-1 min-h-[110px] bg-white dark:bg-gray-800 rounded-xl card shadow-sm transition-all duration-200 hover:shadow-lg hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary p-6 flex items-center"
        >
          <div className="flex-shrink-0">
            <InboxIcon className="h-7 w-7 text-text-secondary-light dark:text-text-secondary-dark" />
          </div>
          <div className="ml-5">
            <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">Inbox</h3>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">View your received emails</p>
          </div>
        </Link>

        <Link
          to="/sent"
          className="flex-1 min-h-[110px] bg-white dark:bg-gray-800 rounded-xl card shadow-sm transition-all duration-200 hover:shadow-lg hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary p-6 flex items-center"
        >
          <div className="flex-shrink-0">
            <PaperAirplaneIcon className="h-7 w-7 text-text-secondary-light dark:text-text-secondary-dark" />
          </div>
          <div className="ml-5">
            <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">Sent</h3>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">View your sent emails</p>
          </div>
        </Link>
      </div>

      {/* Recent emails list */}
      <div className="card rounded-xl shadow-sm">
        <div className="px-4 py-4 sm:px-6 border-b border-border-light dark:border-border-dark">
          <h3 className="text-lg font-semibold leading-6 text-text-light dark:text-text-dark">Recent Emails</h3>
        </div>
        <div>
          {loading ? (
            <div className="px-4 py-5 sm:px-6 text-center">Loading...</div>
          ) : recentEmails.length > 0 ? (
            <ul className="divide-y divide-border-light dark:divide-border-dark">
              {recentEmails.map((email) => (
                <li key={email.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-light dark:text-text-dark truncate">{email.subject}</p>
                      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark truncate">From: {email.sender}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        {new Date(email.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-8 sm:px-6 text-center bg-surface-light dark:bg-surface-dark rounded-b-xl text-text-secondary-light dark:text-text-secondary-dark">No recent emails</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 