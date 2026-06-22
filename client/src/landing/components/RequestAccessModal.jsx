import { useState } from 'react';
import Modal from '../../components/Modal';
import { AlertCircle, CheckCircle } from 'lucide-react';
import * as api from '../../api/client';

export default function RequestAccessModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', companyName: '', useCase: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!form.name || !form.email || !form.companyName || !form.useCase) {
        setError('Please fill out all fields');
        return;
    }

    setLoading(true);
    try {
      await api.requestAccess(form);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ name: '', email: '', companyName: '', useCase: '' });
    setError('');
    setSuccess(false);
    onClose();
  };

  if (success) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Request Submitted" maxWidth="450px">
        <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">You're on the list!</h3>
            <p className="text-text-secondary">
                We've received your request to access API Guard. Our team will review your details and send your credentials to <strong>{form.email}</strong> shortly.
            </p>
            <button
              className="mt-6 w-full py-2.5 rounded-lg bg-surface-elevated border border-border text-text-primary font-semibold hover:bg-surface-card-hover transition-colors"
              onClick={handleClose}
            >
              Close
            </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Request Access to API Guard"
      footer={
        <>
          <button
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-surface-elevated hover:bg-surface-card-hover border border-border text-text-primary transition-colors"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-accent-primary hover:bg-accent-primary/90 text-white transition-colors disabled:opacity-50"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-text-secondary mb-2">
            API Guard is currently available by invitation only for B2B clients. Please provide your details, and we'll provision a workspace for your team.
        </p>

        {error && (
          <div className="flex items-center gap-2.5 p-3 text-sm rounded-lg border bg-danger/10 border-danger/20 text-danger">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text-secondary">Full Name *</label>
            <input
                className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 outline-none"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="John Doe"
            />
            </div>
            <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text-secondary">Work Email *</label>
            <input
                className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 outline-none"
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="john@company.com"
            />
            </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-text-secondary">Company Name *</label>
          <input
            className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 outline-none"
            value={form.companyName}
            onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
            placeholder="Acme Corp"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-text-secondary">How do you plan to use API Guard? *</label>
          <textarea
            className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 outline-none resize-none h-24"
            value={form.useCase}
            onChange={e => setForm(f => ({ ...f, useCase: e.target.value }))}
            placeholder="We want to monitor our production payment APIs..."
          />
        </div>
      </div>
    </Modal>
  );
}
