import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { Link } from 'react-router-dom';
import { PencilSquareIcon, TrashIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

// Email interface for type safety
interface Email {
  id: number;
  subject: string;
  recipient: {
    email: string;
  };
  recipientEmail?: string;
  body: string;
  timestamp: string;
}

const Drafts = () => {
  // State for draft emails
  const [emails, setEmails] = useState<Email[]>([]);
  // State for loading indicator
  const [loading, setLoading] = useState(true);
  // State for the currently selected draft
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const navigate = useNavigate();

  // Fetch draft emails on component mount
  useEffect(() => {
    fetchEmails();
  }, []);

  // Fetches draft emails from the backend
  const fetchEmails = async () => {
    try {
      const response = await api.get('/email/drafts');
      setEmails(response.data);
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handles selecting a draft
  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
  };

  // Handles deleting a draft
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

  // Handles editing a draft
  const handleEdit = async (email: Email) => {
    try {
      await api.put(`/email/${email.id}`, email);
      navigate(`/compose?id=${email.id}`);
    } catch (error) {
      console.error('Error updating email:', error);
    }
  };

  return (
    <div className="h-full flex">
      {/* Draft List Sidebar */}
      <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-medium text-text-light dark:text-text-dark">Drafts</h2>
        </div>
        {loading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : emails.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {emails.map((email) => (
              <li
                key={email.id}
                className={`p-4 hover:bg-surface-light dark:hover:bg-surface-dark hover:text-text-light dark:hover:text-text-dark cursor-pointer ${
                  selectedEmail?.id === email.id ? 'bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark' : ''
                }`}
                onClick={() => handleEmailClick(email)}
              >
                <div className="flex justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-light dark:text-text-dark truncate">
                      {email.subject || '(No subject)'}
                    </p>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark truncate">
                      To: {email.recipientEmail || email.recipient?.email || '(No recipient)'}
                    </p>
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
          <div className="p-4 text-center text-text-secondary-light dark:text-text-secondary-dark">No drafts</div>
        )}
      </div>

      {/* Draft Content Panel */}
      <div className="flex-1 overflow-y-auto">
        {selectedEmail ? (
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-text-light dark:text-text-dark">
                  {selectedEmail.subject || '(No subject)'}
                </h2>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  To: {selectedEmail.recipientEmail || selectedEmail.recipient?.email || '(No recipient)'}
                  <br />
                  Last modified: {new Date(selectedEmail.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="space-x-2 flex">
                <Link
                  to={`/compose?draft=${selectedEmail.id}`}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-primary text-white hover:bg-primary-light dark:bg-primary-dark dark:hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium shadow transition-colors"
                  title="Edit Draft"
                >
                  <PencilSquareIcon className="h-5 w-5" /> Edit
                </Link>
                <button
                  onClick={() => handleDelete(selectedEmail.id)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm font-medium shadow transition-colors"
                  title="Delete Draft"
                >
                  <TrashIcon className="h-5 w-5" /> Delete
                </button>
                <button
                  onClick={async () => {
                    if (!selectedEmail) return;

                    const recipient = selectedEmail.recipientEmail || selectedEmail.recipient?.email;
                    if (!recipient) {
                      alert('Recipient email is required to send.');
                      return;
                    }

                    try {
                      const userId = localStorage.getItem('userId');
                      await api.put(
                        `/email/${selectedEmail.id}`,
                        {
                          id: selectedEmail.id,
                          subject: selectedEmail.subject,
                          body: selectedEmail.body,
                          senderId: parseInt(userId || '0'),
                          recipientEmail: recipient,
                          isDraft: false,
                        },
                      );
                      navigate('/sent');
                    } catch (err) {
                      console.error('Failed to send draft:', err);
                      alert('Failed to send draft.');
                    }
                  }}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm font-medium shadow transition-colors"
                  title="Send Draft"
                >
                  <PaperAirplaneIcon className="h-5 w-5" /> Send
                </button>
              </div>
            </div>
            {/* Email Body */}
            <div className="mt-6 prose prose-sm max-w-none text-text-light dark:text-text-dark">
              <p>{selectedEmail.body}</p>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-text-secondary-light dark:text-text-secondary-dark">No draft selected</div>
        )}
      </div>
    </div>
  );
};

export default Drafts;