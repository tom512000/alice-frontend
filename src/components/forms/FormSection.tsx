import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface FormSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function FormSection({ title, children, className }: FormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {title && (
        <h3 className="font-lexend text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

export function FormGrid({ children, cols = 2 }: { children: ReactNode; cols?: 1 | 2 | 3 }) {
  return (
    <div className={cn('grid gap-4', cols === 1 ? 'grid-cols-1' : cols === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3')}>
      {children}
    </div>
  );
}

interface FormErrorProps {
  error: string | null | undefined;
}

export function FormError({ error }: FormErrorProps) {
  if (!error) return null;
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-poppins">
      {error}
    </div>
  );
}
