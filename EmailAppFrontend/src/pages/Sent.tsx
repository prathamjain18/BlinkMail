import { useEffect, useState } from 'react';
import api from '../utils/axios';
import { Link } from 'react-router-dom';
import { TrashIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';

// Email interface for type safety
interface Email {
  id: number;
  subject: string;
  sender: string;
  recipient: string;
  recipientEmail?: string;
  body: string;
  timestamp: string;
  isRead: boolean;
}

const Sent = () => {
  // State for sent emails
  const [emails, setEmails] = useState<Email[]>([]);
  // State for loading indicator
  const [loading, setLoading] = useState(true);
  // State for the currently selected email
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  // Fetch sent emails on component mount
  useEffect(() => {
    fetchEmails();
  }, []);

  // Fetches sent emails from the backend
  const fetchEmails = async () => {
    try {
      const response = await api.get('/email/sent');
      setEmails(response.data);
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handles selecting an email
  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
  };

  // Handles deleting an email
  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/email/${id}`);
      setEmails((prevEmails) => prevEmails.filter((email) => email.id !== id));
      if (selectedEmail?.id === id) {
        setSelectedEmail(null);
      }
    } catch (error) {
      console.error('Error deleting email:', error);
    }
  };

  return (
    <div className="h-full flex">
      {/* Sent Email List Sidebar */}
      <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-medium text-text-light dark:text-text-dark">Sent Emails</h2>
        </div>
        {loading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : Array.isArray(emails) && emails.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {emails.map((email) => (
              <li
                key={email.id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-surface-dark cursor-pointer ${
                  selectedEmail?.id === email.id ? 'bg-gray-50 dark:bg-surface-dark' : ''
                }`}
                onClick={() => handleEmailClick(email)}
              >
                <div className="flex justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-light dark:text-text-dark truncate">{email.subject}</p>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark truncate">To: {email.recipient}</p>
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
          <div className="p-4 text-center text-gray-500">No sent emails</div>
        )}
      </div>

      {/* Sent Email Content Panel */}
      <div className="flex-1 overflow-y-auto">
        {selectedEmail ? (
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-text-light dark:text-text-dark">{selectedEmail.subject}</h2>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  From: {selectedEmail.sender}
                  <br />
                  To: {selectedEmail.recipient}
                  <br />
                  Date: {new Date(selectedEmail.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(selectedEmail.id)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm font-medium shadow transition-colors"
                  title="Delete Email"
                >
                  <TrashIcon className="h-5 w-5" /> Delete
                </button>
                <Link
                  to={`/compose?replyTo=${encodeURIComponent(selectedEmail.recipient)}&subject=${encodeURIComponent('Re: ' + selectedEmail.subject)}&body=${encodeURIComponent('\n\n--- Original Message ---\n' + selectedEmail.body)}`}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-primary text-white hover:bg-primary-light dark:bg-primary-dark dark:hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium shadow transition-colors"
                  title="Reply to this email"
                >
                  <ArrowUturnLeftIcon className="h-5 w-5" /> Reply
                </Link>
              </div>
            </div>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{selectedEmail.body}</p>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-text-secondary-light dark:text-text-secondary-dark">
            Select an email to view its content
          </div>
        )}
      </div>
    </div>
  );
};

export default Sent; 