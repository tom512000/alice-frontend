import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { medicinesActions } from '@/features/medicines/medicinesSlice';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { MedicineRead } from '@/types/entities';

export function MedicinesPage() {
  const dispatch = useAppDispatch();
  const { toastSuccess, toastError } = useToast();
  const { items, loading, totalItems, page, saving } = useAppSelector((s) => s.medicines);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<MedicineRead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MedicineRead | null>(null);
  const [name, setName] = useState('');
  const [dci, setDci] = useState('');
  const [dosage, setDosage] = useState('');
  const [form, setForm] = useState('');

  function load(p = page) { dispatch(medicinesActions.fetchList({ page: p, itemsPerPage: 30 })); }
  useEffect(() => { load(1); }, []);

  function openCreate() { setEditTarget(null); setName(''); setDci(''); setDosage(''); setForm(''); setModalOpen(true); }
  function openEdit(m: MedicineRead) { setEditTarget(m); setName(m.name); setDci(m.dci ?? ''); setDosage(m.dosage ?? ''); setForm(m.pharmaceuticalForm ?? ''); setModalOpen(true); }

  async function handleSave() {
    const payload = { name, dci: dci || null, dosage: dosage || null, pharmaceuticalForm: form || null };
    const result = editTarget
      ? await dispatch(medicinesActions.updateOne({ id: editTarget.id, data: payload }))
      : await dispatch(medicinesActions.createOne(payload));
    if (medicinesActions.createOne.fulfilled.match(result) || medicinesActions.updateOne.fulfilled.match(result)) {
      toastSuccess(editTarget ? 'Médicament mis à jour.' : 'Médicament créé.');
      setModalOpen(false);
      load(1);
    } else toastError('Erreur.');
  }

  return (
    <div>
      <PageHeader title="Médicaments" subtitle={`${totalItems} médicaments`}
        actions={<Button size="sm" onClick={openCreate} icon={<Plus className="h-4 w-4" />}>Nouveau médicament</Button>}
      />
      <Card className="max-w-3xl">
        <CardBody>
          {loading ? <p className="text-sm text-gray-400">Chargement…</p> : (
            <ul className="divide-y divide-gray-100">
              {items.map((m) => (
                <li key={m.id} className="flex items-start justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{m.name}</p>
                    <div className="flex gap-2 mt-0.5">
                      {m.dci && <span className="text-xs text-blue-600">DCI: {m.dci}</span>}
                      {m.dosage && <span className="text-xs text-gray-500">Dosage: {m.dosage}</span>}
                      {m.pharmaceuticalForm && <span className="text-xs text-gray-400">{m.pharmaceuticalForm}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-4">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(m)} icon={<Pencil className="h-4 w-4" />} />
                    <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(m)} icon={<Trash2 className="h-4 w-4 text-red-500" />} />
                  </div>
                </li>
              ))}
              {items.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">Aucun médicament.</p>}
            </ul>
          )}
        </CardBody>
      </Card>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Modifier le médicament' : 'Nouveau médicament'}>
        <div className="space-y-3 p-4">
          <Input label="Nom *" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="DCI (dénomination commune)" value={dci} onChange={(e) => setDci(e.target.value)} />
          <Input label="Dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} />
          <Input label="Forme pharmaceutique" value={form} onChange={(e) => setForm(e.target.value)} />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} loading={saving} disabled={!name.trim()}>Enregistrer</Button>
          </div>
        </div>
      </Modal>
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={async () => { const res = await dispatch(medicinesActions.deleteOne(deleteTarget!.id)); setDeleteTarget(null); if (medicinesActions.deleteOne.fulfilled.match(res)) { toastSuccess('Médicament supprimé.'); load(1); } else toastError('Erreur.'); }} message={`Supprimer "${deleteTarget?.name}" ?`} />
    </div>
  );
}
