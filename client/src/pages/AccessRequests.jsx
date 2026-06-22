import { useState, useEffect, useCallback } from 'react';
import { Check, X, Inbox, Building2, User, FileText, Calendar, Trash2 } from 'lucide-react';
import * as api from '../api/client';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import AlertModal from '../components/AlertModal';
import Modal from '../components/Modal';

export default function AccessRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [alertError, setAlertError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getAccessRequests();
      setRequests(res.data || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch access requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = (request) => {
    setConfirmDialog({
      title: 'Approve Request & Create Client',
      message: `Are you sure you want to approve the request for ${request.companyName}? This will automatically create a new Client, generate a Client Admin user for ${request.email}, and email them their credentials.`,
      onConfirm: async () => {
        try {
          await api.approveAccessRequest(request._id);
          fetchRequests();
        } catch (err) {
          setAlertError(err.message);
        }
      }
    });
  };

  const handleReject = (request) => {
    setConfirmDialog({
      title: 'Reject Request',
      message: `Are you sure you want to reject the access request from ${request.email}? They will not be notified, but their request will be marked as rejected.`,
      onConfirm: async () => {
        try {
          await api.rejectAccessRequest(request._id);
          fetchRequests();
        } catch (err) {
          setAlertError(err.message);
        }
      }
    });
  };

  const handleDelete = (request) => {
    setConfirmDialog({
      title: 'Permanently Delete Request',
      message: `Are you sure you want to permanently delete the access request from ${request.email}? This action cannot be undone.`,
      isDanger: true,
      confirmText: "Permanently Delete",
      onConfirm: async () => {
        try {
          await api.deleteAccessRequest(request._id);
          fetchRequests();
        } catch (err) {
          setAlertError(err.message);
        }
      }
    });
  };

  const columns = [
    { 
        key: 'companyName', 
        label: 'Company', 
        render: (v, row) => (
            <div className="flex flex-col">
                <span className="font-semibold text-text-primary">{v}</span>
                <span className="text-xs text-text-secondary">{row.name}</span>
            </div>
        )
    },
    { key: 'email', label: 'Contact Email' },
    { 
        key: 'status', 
        label: 'Status', 
        render: (v) => {
            const variant = v === 'approved' ? 'success' : v === 'rejected' ? 'danger' : 'warning';
            return <StatusBadge label={v} variant={variant} />;
        }
    },
    { key: 'createdAt', label: 'Requested On', render: (v) => new Date(v).toLocaleDateString() },
    {
      key: '_id',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2 items-center">
            <button
                className="text-xs font-semibold px-2 py-1 bg-surface-card border border-border rounded text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                onClick={(e) => { e.stopPropagation(); setSelectedRequest(row); }}
            >
                View
            </button>
            {row.status === 'pending' && (
                <>
                <button
                    className="inline-flex items-center justify-center p-1.5 rounded-lg text-success hover:bg-success/10 transition-colors focus:outline-none"
                    title="Approve & Create Client"
                    onClick={(e) => { e.stopPropagation(); handleApprove(row); }}
                >
                    <Check size={16} />
                </button>
                <button
                    className="inline-flex items-center justify-center p-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors focus:outline-none"
                    title="Reject Request"
                    onClick={(e) => { e.stopPropagation(); handleReject(row); }}
                >
                    <X size={16} />
                </button>
                </>
            )}
            <button
                className="inline-flex items-center justify-center p-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors focus:outline-none cursor-pointer"
                title="Permanently Delete Request"
                onClick={(e) => { e.stopPropagation(); handleDelete(row); }}
            >
                <Trash2 size={16} />
            </button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Access Requests</h1>
          <p className="text-sm text-text-secondary mt-1">Review and approve requests from prospective clients</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-3.5 mb-6 text-sm rounded-lg border bg-danger/10 border-danger/20 text-danger animate-fade-in">
          <X size={16} /> {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={requests}
        loading={loading}
        emptyTitle="No access requests"
        emptyDescription="You're all caught up! There are no pending access requests at this time."
      />

      <ConfirmModal
        isOpen={!!confirmDialog}
        onClose={() => setConfirmDialog(null)}
        title={confirmDialog?.title}
        message={confirmDialog?.message}
        onConfirm={confirmDialog?.onConfirm}
        isDanger={confirmDialog?.isDanger}
        confirmText={confirmDialog?.confirmText || "Confirm"}
      />

      <AlertModal
        isOpen={!!alertError}
        onClose={() => setAlertError('')}
        message={alertError}
      />

      {/* View Request Details Modal */}
      <Modal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title="Request Details"
        maxWidth="500px"
      >
        {selectedRequest && (
            <div className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider flex items-center gap-1.5"><Building2 size={14}/> Company</span>
                        <span className="text-sm text-text-primary font-medium">{selectedRequest.companyName}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider flex items-center gap-1.5"><User size={14}/> Contact Person</span>
                        <span className="text-sm text-text-primary font-medium">{selectedRequest.name}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider flex items-center gap-1.5"><Inbox size={14}/> Email</span>
                        <a href={`mailto:${selectedRequest.email}`} className="text-sm text-accent-primary hover:underline">{selectedRequest.email}</a>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider flex items-center gap-1.5"><Calendar size={14}/> Submitted On</span>
                        <span className="text-sm text-text-primary">{new Date(selectedRequest.createdAt).toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider flex items-center gap-1.5"><FileText size={14}/> Intended Use Case</span>
                    <div className="p-3 bg-surface-input border border-border rounded-lg text-sm text-text-secondary whitespace-pre-wrap">
                        {selectedRequest.useCase}
                    </div>
                </div>
            </div>
        )}
      </Modal>
    </div>
  );
}
