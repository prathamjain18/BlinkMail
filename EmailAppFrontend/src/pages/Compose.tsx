import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { PaperAirplaneIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

const Compose = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // State for form data
  const [formData, setFormData] = useState({
    recipient: '',
    subject: '',
    body: '',
  });
  // State for loading indicator
  const [loading, setLoading] = useState(false);
  // State for error messages
  const [error, setError] = useState('');
  // State for draft ID if editing an existing draft
  const [draftId, setDraftId] = useState<number | null>(null);

  // Fetches a draft by ID and populates the form
  const fetchDraft = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/email/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const draft = response.data;
      setFormData({
        recipient: draft.recipientEmail || draft.recipient?.email || '',
        subject: draft.subject || '',
        body: draft.body || '',
      });
      setDraftId(id);
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
      });
    }
  }, [location.search]);

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
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      const emailData = {
        subject: formData.subject || '(No Subject)',
        body: formData.body || '(No Content)',
        senderId: parseInt(userId || '0'),
        recipientEmail: formData.recipient.trim().toLowerCase(),
        isDraft: false,
      };

      if (draftId) {
        // Update existing draft and send
        await axios.put(
          `/api/email/${draftId}`,
          { ...emailData, id: draftId },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        // Send new email
        await axios.post(
          '/api/email/send',
          emailData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
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
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      const draftData = {
        subject: formData.subject || '(No Subject)',
        body: formData.body || '(No Content)',
        senderId: parseInt(userId || '0'),
        recipientEmail: formData.recipient.trim().toLowerCase(),
        isDraft: true,
      };

      if (draftId) {
        // Update existing draft
        await axios.put(
          `/api/email/${draftId}`,
          draftData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        // Save new draft
        await axios.post(
          '/api/email/draft',
          draftData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
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