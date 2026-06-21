const VARIANT_CLASSES = {
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-danger-bg text-danger',
  info: 'bg-info-bg text-info',
  neutral: 'bg-surface-elevated/50 text-text-secondary',
  accent: 'bg-accent-primary/10 text-accent-primary',
};

export default function StatusBadge({ status, variant, label, className = '' }) {
  const resolvedVariant = variant || getVariantFromStatus(status);
  const resolvedLabel = label || status;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap uppercase tracking-wide ${VARIANT_CLASSES[resolvedVariant] || VARIANT_CLASSES.neutral} ${className}`}
    >
      {resolvedLabel}
    </span>
  );
}

function getVariantFromStatus(status) {
  if (!status) return 'neutral';
  const s = String(status).toLowerCase();
  if (s === 'active' || s === 'true') return 'success';
  if (s === 'inactive' || s === 'false') return 'danger';
  if (s === 'revoked') return 'warning';
  if (s === 'expired') return 'neutral';
  return 'neutral';
}
