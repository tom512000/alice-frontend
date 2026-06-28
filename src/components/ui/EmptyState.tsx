import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      {icon && (
        <div className="mb-4 rounded-full bg-gray-100 p-4 text-gray-400">
          {icon}
        </div>
      )}
      <h3 className="font-lexend text-base font-semibold text-gray-700 mb-1">{title}</h3>
      {description && (
        <p className="font-poppins text-sm text-gray-500 mb-5 max-w-xs">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
