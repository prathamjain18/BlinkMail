import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/axios';
import { PaperAirplaneIcon, DocumentDuplicateIcon, PaperClipIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// Attachment interface
interface Attachment {
  id: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
}

const Compose = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // State for form data
  const [formData, setFormData] = useState({
    recipient: '',
    subject: '',
    body: '',
    isHighPriority: false,
  });
  // State for loading indicator
  const [loading, setLoading] = useState(false);
  // State for error messages
  const [error, setError] = useState('');
  // State for draft ID if editing an existing draft
  const [draftId, setDraftId] = useState<number | null>(null);
  // State for attachments
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]);

  // Fetches a draft by ID and populates the form
  const fetchDraft = async (id: number) => {
    try {
      const response = await api.get(`/email/${id}`);
      const draft = response.data;
      setFormData({
        recipient: draft.recipientEmail || draft.recipient?.email || '',
        subject: draft.subject || '',
        body: draft.body || '',
        isHighPriority: draft.isHighPriority || false,
      });
      setDraftId(id);
      if (draft.attachments) {
        setExistingAttachments(draft.attachments);
      }
    } catch (error) {
      console.error('Error fetching draft:', error);
      setError('Failed to load draft. Please try again.');
    }
  };

  // On mount, check if editing a draft (via query param)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const draftIdParam = params.get('draft');
    const replyTo = params.get('replyTo');
    const replySubject = params.get('subject');
    const replyBody = params.get('body');
    if (draftIdParam) {
      fetchDraft(parseInt(draftIdParam));
    } else if (replyTo || replySubject || replyBody) {
      setFormData({
        recipient: replyTo || '',
        subject: replySubject || '',
        body: replyBody || '',
        isHighPriority: false,
      });
    }
  }, [location.search]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Remove existing attachment
  const removeExistingAttachment = (attachmentId: number) => {
    setExistingAttachments(prev => prev.filter(a => a.id !== attachmentId));
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handles sending the email (or updating a draft)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.recipient) {
      setError('Recipient email is required.');
      setLoading(false);
      return;
    }

    try {
      const userId = localStorage.getItem('userId');
      
      const emailData = {
        subject: formData.subject || '(No Subject)',
        body: formData.body || '(No Content)',
        senderId: parseInt(userId || '0'),
        recipientEmail: formData.recipient.trim().toLowerCase(),
        isDraft: false,
        isHighPriority: formData.isHighPriority,
      };

      let emailId: number;

      if (draftId) {
        // Update existing draft and send
        await api.put(`/email/${draftId}`, { ...emailData, id: draftId });
        emailId = draftId;
      } else {
        // Send new email
        const response = await api.post('/email/send', emailData);
        emailId = response.data.id;
      }

      // Upload attachments
      for (const file of attachments) {
        const formData = new FormData();
        formData.append('file', file);
        await api.post(`/email/${emailId}/attachments`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      navigate('/sent');
    } catch (err: any) {
      console.error('Error sending email:', err);
      if (err.response?.data) {
        setError(`Failed to send email: ${err.response.data}`);
      } else {
        setError('Failed to send email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handles saving the email as a draft
  const handleSaveDraft = async () => {
    setLoading(true);
    setError('');

    if (!formData.recipient) {
      setError('Recipient email is required.');
      setLoading(false);
      return;
    }

    try {
      const userId = localStorage.getItem('userId');

      const draftData = {
        subject: formData.subject || '(No Subject)',
        body: formData.body || '(No Content)',
        senderId: parseInt(userId || '0'),
        recipientEmail: formData.recipient.trim().toLowerCase(),
        isDraft: true,
        isHighPriority: formData.isHighPriority,
      };

      let emailId: number;

      if (draftId) {
        // Update existing draft
        await api.put(`/email/${draftId}`, draftData);
        emailId = draftId;
      } else {
        // Save new draft
        const response = await api.post('/email/draft', draftData);
        emailId = response.data.id;
      }

      // Upload attachments
      for (const file of attachments) {
        const formData = new FormData();
        formData.append('file', file);
        await api.post(`/email/${emailId}/attachments`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      navigate('/drafts');
    } catch (err: any) {
      console.error('Error saving draft:', err);
      let msg = 'Failed to save draft. Please try again.';
      if (err.response?.data) {
        msg = `Failed to save draft: ${typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data)}`;
      }
      setError(msg);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="card">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-text-light dark:text-text-dark mb-4">Compose Email</h2>
          {error && (
            <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900 p-4">
              <div className="text-sm text-red-700 dark:text-red-200">{error}</div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="recipient" className="block text-sm font-medium text-text-light dark:text-text-dark">
                To
              </label>
              <input
                type="email"
                id="recipient"
                className="input mt-1 block w-full rounded-md shadow-sm focus:border-primary focus:ring-primary sm:text-sm placeholder-text-secondary-light dark:placeholder-text-secondary-dark"
                value={formData.recipient}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-text-light dark:text-text-dark">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                required
                className="input mt-1 block w-full rounded-md shadow-sm focus:border-primary focus:ring-primary sm:text-sm placeholder-text-secondary-light dark:placeholder-text-secondary-dark"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                  checked={formData.isHighPriority}
                  onChange={(e) => setFormData({ ...formData, isHighPriority: e.target.checked })}
                />
                <span className="ml-2 text-sm text-text-light dark:text-text-dark flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 text-orange-500 mr-1" />
                  High Priority
                </span>
              </label>
            </div>

            <div>
              <label htmlFor="body" className="block text-sm font-medium text-text-light dark:text-text-dark">
                Message
              </label>
              <textarea
                id="body"
                rows={10}
                required
                className="input mt-1 block w-full rounded-md shadow-sm focus:border-primary focus:ring-primary sm:text-sm placeholder-text-secondary-light dark:placeholder-text-secondary-dark"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              />
            </div>

            {/* File Upload Section */}
            <div>
              <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                Attachments
              </label>
              <div className="flex items-center space-x-2">
                <label className="cursor-pointer inline-flex items-center gap-1 px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-surface-dark dark:text-text-dark dark:hover:bg-surface-light focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium shadow transition-colors">
                  <PaperClipIcon className="h-5 w-5" />
                  Add Files
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>

              {/* New Attachments List */}
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  <h4 className="text-sm font-medium text-text-light dark:text-text-dark">New Attachments:</h4>
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm text-text-light dark:text-text-dark">{file.name} ({formatFileSize(file.size)})</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Existing Attachments List */}
              {existingAttachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  <h4 className="text-sm font-medium text-text-light dark:text-text-dark">Existing Attachments:</h4>
                  {existingAttachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm text-text-light dark:text-text-dark">{attachment.fileName} ({formatFileSize(attachment.fileSize)})</span>
                      <button
                        type="button"
                        onClick={() => removeExistingAttachment(attachment.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={loading}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-surface-dark dark:text-text-dark dark:hover:bg-surface-light focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium shadow transition-colors"
                title="Save as Draft"
              >
                <DocumentDuplicateIcon className="h-5 w-5" /> Save Draft
              </button>
              <button
                type="submit"
                disabled={loading || !formData.recipient}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-light dark:bg-primary-dark dark:hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium shadow transition-colors"
                title="Send Email"
              >
                <PaperAirplaneIcon className="h-5 w-5" /> {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Compose; 