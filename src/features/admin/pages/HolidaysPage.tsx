import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { holidaysActions } from '@/features/holidays/holidaysSlice';
import { usersActions } from '@/features/users/usersSlice';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatDate, formatName } from '@/lib/format';
import { Plus, Trash2 } from 'lucide-react';
import type { HolidayRead } from '@/types/entities';

export function HolidaysPage() {
  const dispatch = useAppDispatch();
  const { toastSuccess, toastError } = useToast();
  const { items, loading, totalItems, page, saving } = useAppSelector((s) => s.holidays);
  const users = useAppSelector((s) => s.users.items);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HolidayRead | null>(null);
  const [user, setUser] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('pending');

  function load(p = page) { dispatch(holidaysActions.fetchList({ page: p, itemsPerPage: 30 })); }
  useEffect(() => { load(1); dispatch(usersActions.fetchList({ page: 1, itemsPerPage: 100 })); }, []);

  async function handleSave() {
    const payload = { user, startDate, endDate, status };
    const result = await dispatch(holidaysActions.createOne(payload));
    if (holidaysActions.createOne.fulfilled.match(result)) {
      toastSuccess('Congé créé.');
      setModalOpen(false);
      load(1);
    } else toastError('Erreur.');
  }

  const STATUS_LABELS: Record<string, string> = { pending: 'En attente', approved: 'Approuvé', rejected: 'Refusé' };

  return (
    <div>
      <PageHeader title="Congés" subtitle={`${totalItems} congés`}
        actions={<Button size="sm" onClick={() => { setUser(''); setStartDate(''); setEndDate(''); setStatus('pending'); setModalOpen(true); }} icon={<Plus className="h-4 w-4" />}>Nouveau congé</Button>}
      />
      <Card className="max-w-3xl">
        <CardBody>
          {loading ? <p className="text-sm text-gray-400">Chargement…</p> : (
            <ul className="divide-y divide-gray-100">
              {items.map((h) => (
                <li key={h.id} className="flex items-start justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{formatName(h.user?.lastname, h.user?.firstname)}</p>
                    <p className="text-xs text-gray-500">{formatDate(h.startDate)} → {formatDate(h.endDate)}</p>
                    <span className="text-xs text-gray-400">{STATUS_LABELS[h.status] ?? h.status}</span>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(h)} icon={<Trash2 className="h-4 w-4 text-red-500" />} />
                </li>
              ))}
              {items.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">Aucun congé.</p>}
            </ul>
          )}
        </CardBody>
      </Card>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouveau congé">
        <div className="space-y-3 p-4">
          <Select label="Utilisateur *" value={user} onChange={(e) => setUser(e.target.value)} options={[{ value: '', label: '—' }, ...users.map((u) => ({ value: u['@id'], label: formatName(u.lastname, u.firstname) }))]} />
          <Input label="Date de début *" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label="Date de fin *" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <Select label="Statut" value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: 'pending', label: 'En attente' }, { value: 'approved', label: 'Approuvé' }, { value: 'rejected', label: 'Refusé' }]} />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} loading={saving} disabled={!user || !startDate || !endDate}>Enregistrer</Button>
          </div>
        </div>
      </Modal>
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={async () => { const res = await dispatch(holidaysActions.deleteOne(deleteTarget!.id)); setDeleteTarget(null); if (holidaysActions.deleteOne.fulfilled.match(res)) { toastSuccess('Congé supprimé.'); load(1); } else toastError('Erreur.'); }} message="Supprimer ce congé ?" />
    </div>
  );
}
