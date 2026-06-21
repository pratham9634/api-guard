export default function StatCard({ icon, label, value, subtitle, className = '' }) {
  return (
    <div
      className={`glass-card rounded-xl p-5 relative overflow-hidden group transition-all duration-250 hover:-translate-y-0.5 hover:shadow-lg hover:border-accent-primary/30 ${className}`}
    >
      {/* Top accent bar on hover */}
      <div className="absolute top-0 left-0 right-0 h-0.5 accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-250" />

      {icon && (
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-accent-primary/10 text-accent-primary mb-3">
          {icon}
        </div>
      )}
      <div className="text-sm text-text-secondary mb-1">{label}</div>
      <div className="text-3xl font-bold leading-tight accent-text">{value}</div>
      {subtitle && <div className="text-xs text-text-tertiary mt-1">{subtitle}</div>}
    </div>
  );
}
