import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { TrashIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';

// Email interface for type safety
interface Email {
  id: number;
  subject: string;
  sender: string;
  recipient: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  recipientEmail?: string;
}

const Inbox = () => {
  // State for all emails in the inbox
  const [emails, setEmails] = useState<Email[]>([]);
  // State for loading indicator
  const [loading, setLoading] = useState(true);
  // State for the currently selected email
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  // Fetch emails on component mount
  useEffect(() => {
    fetchEmails();
  }, []);

  // Fetches inbox emails from the backend
  const fetchEmails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/email/inbox', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmails(response.data);
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handles selecting an email and marking it as read if necessary
  const handleEmailClick = async (email: Email) => {
    setSelectedEmail(email);
    if (!email.isRead) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(
          `/api/email/${email.id}/read`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setEmails((prevEmails) =>
          prevEmails.map((e) => (e.id === email.id ? { ...e, isRead: true } : e))
        );
      } catch (error) {
        console.error('Error marking email as read:', error);
      }
    }
  };

  // Handles deleting an email
  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/email/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      {/* Email List Sidebar */}
      <div className="w-1/3 border-r border-border-light dark:border-border-dark overflow-y-auto card">
        <div className="p-4">
          <h2 className="text-lg font-medium text-text-light dark:text-text-dark">Inbox</h2>
        </div>
        {loading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : emails.length > 0 ? (
          <ul className="divide-y divide-border-light dark:divide-border-dark">
            {emails.map((email) => (
              <li
                key={email.id}
                className={`p-4 hover:bg-surface-light dark:hover:bg-surface-dark hover:text-text-light dark:hover:text-text-dark cursor-pointer ${
                  selectedEmail?.id === email.id ? 'bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark' : ''
                } ${!email.isRead ? 'font-semibold' : ''}`}
                onClick={() => handleEmailClick(email)}
              >
                <div className="flex justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-light dark:text-text-dark truncate">{email.subject}</p>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark truncate">From: {email.sender}</p>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark truncate">To: {email.recipientEmail || email.recipient}</p>
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
          <div className="p-4 text-center text-text-secondary-light dark:text-text-secondary-dark">No emails in inbox</div>
        )}
      </div>

      {/* Email Content Panel */}
      <div className="flex-1 overflow-y-auto card ml-4">
        {selectedEmail ? (
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-text-light dark:text-text-dark">{selectedEmail.subject}</h2>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  From: {selectedEmail.sender}
                  <br />
                  To: {selectedEmail.recipientEmail || selectedEmail.recipient}
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
                  to={`/compose?replyTo=${encodeURIComponent(selectedEmail.sender)}&subject=${encodeURIComponent('Re: ' + selectedEmail.subject)}&body=${encodeURIComponent('\n\n--- Original Message ---\n' + selectedEmail.content)}`}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-primary text-white hover:bg-primary-light dark:bg-primary-dark dark:hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium shadow transition-colors"
                  title="Reply to this email"
                >
                  <ArrowUturnLeftIcon className="h-5 w-5" /> Reply
                </Link>
              </div>
            </div>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{selectedEmail.content}</p>
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

export default Inbox; 