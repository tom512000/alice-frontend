import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { auditActions } from '../auditSlice';
import { DataTable, type Column } from '@/components/data-table/DataTable';
import { PageHeader } from '@/components/layout/Layout';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatDateTime, AUDIT_ACTION_LABELS } from '@/lib/format';
import type { AuditLogRead } from '@/types/entities';

const ACTION_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  create: 'success',
  update: 'info',
  delete: 'danger',
  read: 'default',
};

export function AuditLogListPage() {
  const dispatch = useAppDispatch();
  const { items, loading, totalItems, page } = useAppSelector((s) => s.audit);
  const [action, setAction] = useState('');
  const [entityClass, setEntityClass] = useState('');

  function load(p = 1) {
    dispatch(
      auditActions.fetchList({
        page: p,
        itemsPerPage: 30,
        ...(action ? { action } : {}),
        ...(entityClass ? { entityClass } : {}),
      })
    );
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, entityClass]);

  const columns: Column<AuditLogRead>[] = [
    { key: 'createdAt', header: 'Date', render: (r) => <span className="whitespace-nowrap">{formatDateTime(r.createdAt)}</span> },
    {
      key: 'action',
      header: 'Action',
      render: (r) => <Badge variant={ACTION_VARIANT[r.action] ?? 'default'}>{AUDIT_ACTION_LABELS[r.action] ?? r.action}</Badge>,
    },
    {
      key: 'entity',
      header: 'Entité',
      render: (r) => (
        <span className="font-medium">
          {r.entityClass}
          {r.entityId != null && <span className="text-gray-400"> #{r.entityId}</span>}
        </span>
      ),
    },
    { key: 'username', header: 'Utilisateur', render: (r) => <span>{r.username ?? '—'}</span> },
    {
      key: 'changes',
      header: 'Champs modifiés',
      render: (r) =>
        r.changes && Object.keys(r.changes).length > 0 ? (
          <span className="text-xs text-gray-500 font-mono">{Object.keys(r.changes).join(', ')}</span>
        ) : (
          <span className="text-gray-300">—</span>
        ),
    },
    { key: 'ipAddress', header: 'IP', render: (r) => <span className="text-xs text-gray-400 font-mono">{r.ipAddress ?? '—'}</span> },
  ];

  return (
    <div>
      <PageHeader title="Journal d'audit" subtitle={`${totalItems} événements tracés`} />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="w-48">
          <Select
            label="Action"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            options={[
              { value: '', label: 'Toutes' },
              ...Object.entries(AUDIT_ACTION_LABELS).map(([value, label]) => ({ value, label })),
            ]}
          />
        </div>
        <div className="w-56">
          <Input label="Entité" value={entityClass} onChange={(e) => setEntityClass(e.target.value)} placeholder="Ex: Patient" />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        totalItems={totalItems}
        page={page}
        onPageChange={(p) => load(p)}
        getRowKey={(r) => r.id}
        emptyTitle="Aucun événement"
      />
    </div>
  );
}
