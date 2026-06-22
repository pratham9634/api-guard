import Modal from './Modal';
import { AlertCircle } from 'lucide-react';

export default function AlertModal({ isOpen, onClose, title = "Error", message }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="400px"
      footer={
        <button
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-surface-elevated hover:bg-surface-card-hover border border-border text-text-primary transition-colors focus:outline-none cursor-pointer"
          onClick={onClose}
        >
          OK
        </button>
      }
    >
      <div className="flex gap-4 items-start">
        <div className="p-2 rounded-full shrink-0 bg-danger/10 text-danger">
          <AlertCircle size={20} />
        </div>
        <p className="text-sm text-text-secondary mt-1 whitespace-pre-wrap">{message}</p>
      </div>
    </Modal>
  );
}
