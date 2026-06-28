import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { pathologiesActions } from '@/features/pathologies/pathologiesSlice';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { PathologyRead } from '@/types/entities';

export function PathologiesPage() {
  const dispatch = useAppDispatch();
  const { toastSuccess, toastError } = useToast();
  const { items, loading, totalItems, page, saving } = useAppSelector((s) => s.pathologies);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PathologyRead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PathologyRead | null>(null);
  const [name, setName] = useState('');
  const [chronicPerDay, setChronicPerDay] = useState('');
  const [durationBetweenTakes, setDurationBetweenTakes] = useState('');

  function load(p = page) { dispatch(pathologiesActions.fetchList({ page: p, itemsPerPage: 30 })); }
  useEffect(() => { load(1); }, []);

  function openCreate() { setEditTarget(null); setName(''); setChronicPerDay(''); setDurationBetweenTakes(''); setModalOpen(true); }
  function openEdit(p: PathologyRead) { setEditTarget(p); setName(p.name); setChronicPerDay(p.chronicPerDay?.toString() ?? ''); setDurationBetweenTakes(p.durationBetweenTakes?.toString() ?? ''); setModalOpen(true); }

  async function handleSave() {
    const payload = { name, chronicPerDay: chronicPerDay ? Number(chronicPerDay) : null, durationBetweenTakes: durationBetweenTakes ? Number(durationBetweenTakes) : null };
    const result = editTarget
      ? await dispatch(pathologiesActions.updateOne({ id: editTarget.id, data: payload }))
      : await dispatch(pathologiesActions.createOne(payload));
    if (pathologiesActions.createOne.fulfilled.match(result) || pathologiesActions.updateOne.fulfilled.match(result)) {
      toastSuccess(editTarget ? 'Pathologie mise à jour.' : 'Pathologie créée.');
      setModalOpen(false);
      load(1);
    } else toastError('Erreur.');
  }

  return (
    <div>
      <PageHeader title="Pathologies" subtitle={`${totalItems} pathologies`}
        actions={<Button size="sm" onClick={openCreate} icon={<Plus className="h-4 w-4" />}>Nouvelle pathologie</Button>}
      />
      <Card className="max-w-3xl">
        <CardBody>
          {loading ? <p className="text-sm text-gray-400">Chargement…</p> : (
            <ul className="divide-y divide-gray-100">
              {items.map((p) => (
                <li key={p.id} className="flex items-start justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <div className="flex gap-3 mt-0.5">
                      {p.chronicPerDay != null && <span className="text-xs text-gray-500">{p.chronicPerDay} prise(s)/j</span>}
                      {p.durationBetweenTakes != null && <span className="text-xs text-gray-500">Intervalle: {p.durationBetweenTakes}h</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-4">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(p)} icon={<Pencil className="h-4 w-4" />} />
                    <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(p)} icon={<Trash2 className="h-4 w-4 text-red-500" />} />
                  </div>
                </li>
              ))}
              {items.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">Aucune pathologie.</p>}
            </ul>
          )}
        </CardBody>
      </Card>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Modifier la pathologie' : 'Nouvelle pathologie'}>
        <div className="space-y-3 p-4">
          <Input label="Nom *" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Prises chroniques par jour" type="number" value={chronicPerDay} onChange={(e) => setChronicPerDay(e.target.value)} />
          <Input label="Durée entre prises (heures)" type="number" value={durationBetweenTakes} onChange={(e) => setDurationBetweenTakes(e.target.value)} />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} loading={saving} disabled={!name.trim()}>Enregistrer</Button>
          </div>
        </div>
      </Modal>
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={async () => { const res = await dispatch(pathologiesActions.deleteOne(deleteTarget!.id)); setDeleteTarget(null); if (pathologiesActions.deleteOne.fulfilled.match(res)) { toastSuccess('Pathologie supprimée.'); load(1); } else toastError('Erreur.'); }} message={`Supprimer "${deleteTarget?.name}" ?`} />
    </div>
  );
}
