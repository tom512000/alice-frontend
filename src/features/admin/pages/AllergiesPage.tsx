import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { allergiesActions } from '@/features/allergies/allergiesSlice';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { AllergyRead } from '@/types/entities';

export function AllergiesPage() {
  const dispatch = useAppDispatch();
  const { toastSuccess, toastError } = useToast();
  const { items, loading, totalItems, page, saving } = useAppSelector((s) => s.allergies);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AllergyRead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AllergyRead | null>(null);
  const [name, setName] = useState('');

  function load(p = page) { dispatch(allergiesActions.fetchList({ page: p, itemsPerPage: 30 })); }
  useEffect(() => { load(1); }, []);

  function openCreate() { setEditTarget(null); setName(''); setModalOpen(true); }
  function openEdit(a: AllergyRead) { setEditTarget(a); setName(a.name); setModalOpen(true); }

  async function handleSave() {
    const payload = { name };
    const result = editTarget
      ? await dispatch(allergiesActions.updateOne({ id: editTarget.id, data: payload }))
      : await dispatch(allergiesActions.createOne(payload));
    if (allergiesActions.createOne.fulfilled.match(result) || allergiesActions.updateOne.fulfilled.match(result)) {
      toastSuccess(editTarget ? 'Allergie mise à jour.' : 'Allergie créée.');
      setModalOpen(false);
      load(1);
    } else toastError('Erreur.');
  }

  return (
    <div>
      <PageHeader title="Allergènes" subtitle={`${totalItems} allergènes`}
        actions={<Button size="sm" onClick={openCreate} icon={<Plus className="h-4 w-4" />}>Nouvel allergène</Button>}
      />
      <Card className="max-w-2xl">
        <CardBody>
          {loading ? <p className="text-sm text-gray-400">Chargement…</p> : (
            <ul className="divide-y divide-gray-100">
              {items.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-3">
                  <p className="text-sm font-medium">{a.name}</p>
                  <div className="flex gap-1 ml-4">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(a)} icon={<Pencil className="h-4 w-4" />} />
                    <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(a)} icon={<Trash2 className="h-4 w-4 text-red-500" />} />
                  </div>
                </li>
              ))}
              {items.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">Aucun allergène.</p>}
            </ul>
          )}
        </CardBody>
      </Card>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Modifier l\'allergène' : 'Nouvel allergène'}>
        <div className="space-y-3 p-4">
          <Input label="Nom *" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} loading={saving} disabled={!name.trim()}>Enregistrer</Button>
          </div>
        </div>
      </Modal>
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={async () => { const res = await dispatch(allergiesActions.deleteOne(deleteTarget!.id)); setDeleteTarget(null); if (allergiesActions.deleteOne.fulfilled.match(res)) { toastSuccess('Allergène supprimé.'); load(1); } else toastError('Erreur.'); }} message={`Supprimer "${deleteTarget?.name}" ?`} />
    </div>
  );
}
