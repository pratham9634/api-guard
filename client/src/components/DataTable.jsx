import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'No data',
  emptyDescription = '',
  emptyAction,
  onRowClick,
  className = '',
}) {
  if (loading) {
    return (
      <div className={`w-full overflow-x-auto rounded-xl border border-border ${className}`}>
        <table className="w-full text-sm">
          <thead className="bg-surface-secondary">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 border-b border-border">
                    <div
                      className="h-3.5 rounded-md animate-shimmer"
                      style={{
                        width: `${60 + Math.random() * 40}%`,
                        background: 'linear-gradient(90deg, var(--color-surface-elevated) 25%, var(--color-surface-card-hover) 50%, var(--color-surface-elevated) 75%)',
                        backgroundSize: '200% 100%',
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-border ${className}`}>
      <table className="w-full text-sm">
        <thead className="bg-surface-secondary">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border whitespace-nowrap"
                style={col.width ? { width: col.width } : undefined}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row._id || row.id || idx}
              onClick={() => onRowClick?.(row)}
              className={`transition-colors hover:bg-surface-card-hover ${onRowClick ? 'cursor-pointer' : ''} last:border-b-0`}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 border-b border-border text-text-primary">
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
