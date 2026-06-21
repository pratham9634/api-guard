import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon,
  title = 'No data found',
  description = '',
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center animate-fade-in">
      <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-accent-primary/10 text-accent-primary mb-6">
        {icon || <Inbox size={28} />}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-base text-text-secondary max-w-[360px] mb-6">{description}</p>
      )}
      {action && action}
    </div>
  );
}
