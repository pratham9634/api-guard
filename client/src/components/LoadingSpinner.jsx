export default function LoadingSpinner({ size = 40, className = '' }) {
  return (
    <div
      className={`rounded-full border-3 border-border border-t-accent-primary animate-spin-slow mx-auto ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-primary">
      <LoadingSpinner size={48} />
    </div>
  );
}
