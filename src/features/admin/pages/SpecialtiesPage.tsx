import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { specialtiesActions } from '@/features/specialties/specialtiesSlice';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { SpecialtyRead } from '@/types/entities';

export function SpecialtiesPage() {
  const dispatch = useAppDispatch();
  const { toastSuccess, toastError } = useToast();
  const { items, loading, saving } = useAppSelector((s) => s.specialties);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SpecialtyRead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SpecialtyRead | null>(null);
  const [name, setName] = useState('');

  useEffect(() => { dispatch(specialtiesActions.fetchList({ page: 1, itemsPerPage: 100 })); }, []);

  function openCreate() { setEditTarget(null); setName(''); setModalOpen(true); }
  function openEdit(s: SpecialtyRead) { setEditTarget(s); setName(s.name); setModalOpen(true); }

  async function handleSave() {
    const payload = { name };
    const result = editTarget
      ? await dispatch(specialtiesActions.updateOne({ id: editTarget.id, data: payload }))
      : await dispatch(specialtiesActions.createOne(payload));
    if (specialtiesActions.createOne.fulfilled.match(result) || specialtiesActions.updateOne.fulfilled.match(result)) {
      toastSuccess(editTarget ? 'Spécialité mise à jour.' : 'Spécialité créée.');
      setModalOpen(false);
      dispatch(specialtiesActions.fetchList({ page: 1, itemsPerPage: 100 }));
    } else toastError('Erreur.');
  }

  return (
    <div>
      <PageHeader title="Spécialités" actions={<Button size="sm" onClick={openCreate} icon={<Plus className="h-4 w-4" />}>Nouvelle spécialité</Button>} />
      <Card className="max-w-2xl">
        <CardBody>
          {loading ? <p className="text-sm text-gray-400">Chargement…</p> : (
            <ul className="divide-y divide-gray-100">
              {items.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-3">
                  <p className="text-sm font-medium">{s.name}</p>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(s)} icon={<Pencil className="h-4 w-4" />} />
                    <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(s)} icon={<Trash2 className="h-4 w-4 text-red-500" />} />
                  </div>
                </li>
              ))}
              {items.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">Aucune spécialité.</p>}
            </ul>
          )}
        </CardBody>
      </Card>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Modifier la spécialité' : 'Nouvelle spécialité'}>
        <div className="space-y-3 p-4">
          <Input label="Nom *" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} loading={saving} disabled={!name.trim()}>Enregistrer</Button>
          </div>
        </div>
      </Modal>
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={async () => { const res = await dispatch(specialtiesActions.deleteOne(deleteTarget!.id)); setDeleteTarget(null); if (specialtiesActions.deleteOne.fulfilled.match(res)) { toastSuccess('Spécialité supprimée.'); dispatch(specialtiesActions.fetchList({ page: 1, itemsPerPage: 100 })); } else toastError('Erreur.'); }} message={`Supprimer la spécialité "${deleteTarget?.name}" ?`} />
    </div>
  );
}
