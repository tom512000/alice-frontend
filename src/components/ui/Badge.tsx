import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'ghost';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-green-50 text-green-700 border border-green-200',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  danger: 'bg-red-50 text-red-700 border border-red-200',
  info: 'bg-blue-50 text-blue-700 border border-blue-200',
  outline: 'border border-gray-300 text-gray-700 bg-transparent',
  ghost: 'text-gray-600 bg-transparent',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium font-poppins',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function AppointmentStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    scheduled: { label: 'Planifié', variant: 'info' },
    completed: { label: 'Terminé', variant: 'success' },
    cancelled: { label: 'Annulé', variant: 'danger' },
    no_show: { label: 'Absent', variant: 'warning' },
  };
  const { label, variant } = map[status] ?? { label: status, variant: 'default' };
  return <Badge variant={variant}>{label}</Badge>;
}

export function SurgicalStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    scheduled: { label: 'Planifiée', variant: 'info' },
    performed: { label: 'Réalisée', variant: 'success' },
    cancelled: { label: 'Annulée', variant: 'danger' },
    postponed: { label: 'Reportée', variant: 'warning' },
  };
  const { label, variant } = map[status] ?? { label: status, variant: 'default' };
  return <Badge variant={variant}>{label}</Badge>;
}
