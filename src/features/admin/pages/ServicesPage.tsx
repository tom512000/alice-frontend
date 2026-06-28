import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { servicesActions } from '@/features/services/servicesSlice';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { ServiceRead } from '@/types/entities';

export function ServicesPage() {
  const dispatch = useAppDispatch();
  const { toastSuccess, toastError } = useToast();
  const { items, loading, saving } = useAppSelector((s) => s.services);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ServiceRead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceRead | null>(null);
  const [serviceName, setServiceName] = useState('');

  useEffect(() => { dispatch(servicesActions.fetchList({ page: 1, itemsPerPage: 100 })); }, []);

  function openCreate() { setEditTarget(null); setServiceName(''); setModalOpen(true); }
  function openEdit(s: ServiceRead) { setEditTarget(s); setServiceName(s.serviceName); setModalOpen(true); }

  async function handleSave() {
    const payload = { serviceName };
    const result = editTarget
      ? await dispatch(servicesActions.updateOne({ id: editTarget.id, data: payload }))
      : await dispatch(servicesActions.createOne(payload));
    if (servicesActions.createOne.fulfilled.match(result) || servicesActions.updateOne.fulfilled.match(result)) {
      toastSuccess(editTarget ? 'Service mis à jour.' : 'Service créé.');
      setModalOpen(false);
      dispatch(servicesActions.fetchList({ page: 1, itemsPerPage: 100 }));
    } else toastError('Erreur.');
  }

  return (
    <div>
      <PageHeader title="Services" actions={<Button size="sm" onClick={openCreate} icon={<Plus className="h-4 w-4" />}>Nouveau service</Button>} />
      <Card className="max-w-2xl">
        <CardBody>
          {loading ? <p className="text-sm text-gray-400">Chargement…</p> : (
            <ul className="divide-y divide-gray-100">
              {items.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-3">
                  <p className="text-sm font-medium">{s.serviceName}</p>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(s)} icon={<Pencil className="h-4 w-4" />} />
                    <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(s)} icon={<Trash2 className="h-4 w-4 text-red-500" />} />
                  </div>
                </li>
              ))}
              {items.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">Aucun service.</p>}
            </ul>
          )}
        </CardBody>
      </Card>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Modifier le service' : 'Nouveau service'}>
        <div className="space-y-3 p-4">
          <Input label="Nom du service *" value={serviceName} onChange={(e) => setServiceName(e.target.value)} />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} loading={saving} disabled={!serviceName.trim()}>Enregistrer</Button>
          </div>
        </div>
      </Modal>
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={async () => { const res = await dispatch(servicesActions.deleteOne(deleteTarget!.id)); setDeleteTarget(null); if (servicesActions.deleteOne.fulfilled.match(res)) { toastSuccess('Service supprimé.'); dispatch(servicesActions.fetchList({ page: 1, itemsPerPage: 100 })); } else toastError('Erreur.'); }} message={`Supprimer le service "${deleteTarget?.serviceName}" ?`} />
    </div>
  );
}
