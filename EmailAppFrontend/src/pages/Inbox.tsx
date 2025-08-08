import { useEffect, useState } from 'react';
import api from '../utils/axios';
import { Link } from 'react-router-dom';
import { TrashIcon, ArrowUturnLeftIcon, PaperClipIcon, ExclamationTriangleIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

// Email interface for type safety
interface Email {
  id: number;
  subject: string;
  sender: string;
  recipient: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  recipientEmail?: string;
  isHighPriority?: boolean;
  attachments?: Attachment[];
}

// Attachment interface
interface Attachment {
  id: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
}

const Inbox = () => {
  // State for all emails in the inbox
  const [emails, setEmails] = useState<Email[]>([]);
  // State for loading indicator
  const [loading, setLoading] = useState(true);
  // State for the currently selected email
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  // State for filters
  const [filters, setFilters] = useState({
    search: '',
    isRead: null as boolean | null,
    isHighPriority: null as boolean | null,
  });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [filters.search]);

  // Fetch emails on component mount and when filters change
  useEffect(() => {
    fetchEmails();
  }, [debouncedSearch, filters.isRead, filters.isHighPriority]);

  // Fetches inbox emails from the backend with filters
  const fetchEmails = async () => {
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (filters.isRead !== null) params.append('isRead', filters.isRead.toString());
      if (filters.isHighPriority !== null) params.append('isHighPriority', filters.isHighPriority.toString());

      const response = await api.get(`/email/inbox?${params.toString()}`);
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
        await api.put(`/email/${email.id}/read`, {});
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
      await api.delete(`/email/${id}`);
      setEmails((prevEmails) => prevEmails.filter((email) => email.id !== id));
      if (selectedEmail?.id === id) {
        setSelectedEmail(null);
      }
    } catch (error) {
      console.error('Error deleting email:', error);
    }
  };

  // Handle attachment download
  const handleDownloadAttachment = async (attachmentId: number, fileName: string) => {
    try {
      const response = await api.get(`/email/attachments/${attachmentId}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading attachment:', error);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="h-full flex">
      {/* Email List Sidebar */}
      <div className="w-1/3 border-r border-border-light dark:border-border-dark overflow-y-auto card">
        <div className="p-4">
          <h2 className="text-lg font-medium text-text-light dark:text-text-dark mb-4">Inbox</h2>
          
          {/* Filter Controls */}
          <div className="space-y-4 mb-4">
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Search emails..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="input w-full rounded-md shadow-sm focus:border-primary focus:ring-primary sm:text-sm placeholder-text-secondary-light dark:placeholder-text-secondary-dark"
              />
            </div>
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilters({ ...filters, isRead: filters.isRead === false ? null : false })}
                className={`px-3 py-1 text-sm rounded-md ${
                  filters.isRead === false 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                Unread Only
              </button>
              <button
                onClick={() => setFilters({ ...filters, isHighPriority: filters.isHighPriority === true ? null : true })}
                className={`px-3 py-1 text-sm rounded-md ${
                  filters.isHighPriority === true 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                High Priority
              </button>
              <button
                onClick={() => setFilters({ search: '', isRead: null, isHighPriority: null })}
                className="px-3 py-1 text-sm rounded-md bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : Array.isArray(emails) && emails.length > 0 ? (
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
                    <div className="flex items-center space-x-2">
                      {email.isHighPriority && (
                        <ExclamationTriangleIcon className="h-4 w-4 text-orange-500 flex-shrink-0" />
                      )}
                      <p className={`text-sm text-text-light dark:text-text-dark truncate ${email.isHighPriority ? 'font-bold' : ''}`}>
                        {email.subject}
                      </p>
                    </div>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark truncate">From: {email.sender}</p>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark truncate">To: {email.recipientEmail || email.recipient}</p>
                    {email.attachments && email.attachments.length > 0 && (
                      <div className="flex items-center mt-1">
                        <PaperClipIcon className="h-3 w-3 text-text-secondary-light dark:text-text-secondary-dark mr-1" />
                        <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                          {email.attachments.length} attachment{email.attachments.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
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
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {selectedEmail.isHighPriority && (
                    <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />
                  )}
                  <h2 className={`text-xl font-semibold text-text-light dark:text-text-dark ${selectedEmail.isHighPriority ? 'text-orange-600 dark:text-orange-400' : ''}`}>
                    {selectedEmail.subject}
                  </h2>
                </div>
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
                  to={`/compose?replyTo=${encodeURIComponent(selectedEmail.sender)}&subject=${encodeURIComponent('Re: ' + selectedEmail.subject)}&body=${encodeURIComponent('\n\n--- Original Message ---\n' + selectedEmail.body)}`}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-primary text-white hover:bg-primary-light dark:bg-primary-dark dark:hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium shadow transition-colors"
                  title="Reply to this email"
                >
                  <ArrowUturnLeftIcon className="h-5 w-5" /> Reply
                </Link>
              </div>
            </div>

            {/* Attachments Section */}
            {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-sm font-medium text-text-light dark:text-text-dark mb-2 flex items-center">
                  <PaperClipIcon className="h-4 w-4 mr-2" />
                  Attachments ({selectedEmail.attachments.length})
                </h3>
                <div className="space-y-2">
                  {selectedEmail.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-600 rounded">
                      <div className="flex-1">
                        <p className="text-sm text-text-light dark:text-text-dark">{attachment.fileName}</p>
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                          {formatFileSize(attachment.fileSize)} • {new Date(attachment.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownloadAttachment(attachment.id, attachment.fileName)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary text-white hover:bg-primary-light dark:bg-primary-dark dark:hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary text-xs font-medium shadow transition-colors"
                        title="Download attachment"
                      >
                        <ArrowDownTrayIcon className="h-3 w-3" /> Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

export default Inbox; 