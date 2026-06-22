import Modal from './Modal';
import { AlertTriangle, Info } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', isDanger = true }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="400px"
      footer={
        <>
          <button
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-surface-elevated hover:bg-surface-card-hover border border-border text-text-primary transition-colors focus:outline-none cursor-pointer"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors focus:outline-none text-white cursor-pointer ${
              isDanger ? 'bg-danger hover:bg-danger/90' : 'bg-accent-primary hover:bg-accent-primary/90'
            }`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <div className="flex gap-4 items-start">
        <div className={`p-2 rounded-full shrink-0 ${isDanger ? 'bg-danger/10 text-danger' : 'bg-accent-primary/10 text-accent-primary'}`}>
          {isDanger ? <AlertTriangle size={20} /> : <Info size={20} />}
        </div>
        <p className="text-sm text-text-secondary mt-1">{message}</p>
      </div>
    </Modal>
  );
}
