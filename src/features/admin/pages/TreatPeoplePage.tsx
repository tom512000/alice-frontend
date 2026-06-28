import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { treatPeopleActions } from '@/features/treatPeople/treatPeopleSlice';
import { patientsActions } from '@/features/patients/patientsSlice';
import { DataTable, type Column } from '@/components/data-table/DataTable';
import { PageHeader } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatDate, formatName } from '@/lib/format';
import { Plus, Trash2 } from 'lucide-react';
import type { TreatPersonRead } from '@/types/entities';

export function TreatPeoplePage() {
  const dispatch = useAppDispatch();
  const { toastSuccess, toastError } = useToast();
  const { items, loading, totalItems, page, saving } = useAppSelector((s) => s.treatPeople);
  const patients = useAppSelector((s) => s.patients.items);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TreatPersonRead | null>(null);
  const [patient, setPatient] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [initialDate, setInitialDate] = useState(new Date().toISOString().split('T')[0]);

  function load(p = page) { dispatch(treatPeopleActions.fetchList({ page: p, itemsPerPage: 30 })); }
  useEffect(() => { load(1); dispatch(patientsActions.fetchList({ page: 1, itemsPerPage: 100 })); }, []);

  async function handleSave() {
    const payload = { patient: patient || null, lastName, firstName: firstName || null, relationship: relationship || null, phone: phone || null, initialDate };
    const result = await dispatch(treatPeopleActions.createOne(payload));
    if (treatPeopleActions.createOne.fulfilled.match(result)) {
      toastSuccess('Personne traitante créée.');
      setModalOpen(false);
      load(1);
    } else toastError('Erreur.');
  }

  function openCreate() { setPatient(''); setLastName(''); setFirstName(''); setRelationship(''); setPhone(''); setInitialDate(new Date().toISOString().split('T')[0]); setModalOpen(true); }

  const columns: Column<TreatPersonRead>[] = [
    { key: 'patient', header: 'Patient', render: (r) => <span className="font-medium">{r.patient ? formatName(r.patient.lastname, r.patient.firstname) : '—'}</span> },
    { key: 'lastName', header: 'Nom', render: (r) => <span>{formatName(r.lastName, r.firstName ?? '')}</span> },
    { key: 'relationship', header: 'Lien', render: (r) => <span className="text-xs text-gray-500">{r.relationship ?? '—'}</span> },
    { key: 'phone', header: 'Téléphone', render: (r) => <span className="text-xs font-mono">{r.phone ?? '—'}</span> },
    { key: 'initialDate', header: 'Depuis', render: (r) => <span className="text-xs text-gray-500">{formatDate(r.initialDate)}</span> },
  ];

  return (
    <div>
      <PageHeader title="Personnes traitantes" subtitle={`${totalItems} personnes`}
        actions={<Button size="sm" onClick={openCreate} icon={<Plus className="h-4 w-4" />}>Ajouter</Button>}
      />
      <DataTable columns={columns} data={items} loading={loading} totalItems={totalItems} page={page}
        onPageChange={(p) => load(p)} getRowKey={(r) => r.id} emptyTitle="Aucune personne traitante"
        actions={(row) => (
          <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(row)} icon={<Trash2 className="h-4 w-4 text-red-500" />} />
        )}
      />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouvelle personne traitante">
        <div className="space-y-3 p-4">
          <Select label="Patient associé" value={patient} onChange={(e) => setPatient(e.target.value)} options={[{ value: '', label: '— Aucun —' }, ...patients.map((p) => ({ value: p['@id'], label: formatName(p.lastname, p.firstname) }))]} />
          <Input label="Nom *" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <Input label="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <Input label="Lien / Fonction" value={relationship} onChange={(e) => setRelationship(e.target.value)} placeholder="ex: médecin traitant, kinésithérapeute…" />
          <Input label="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Date de début *" type="date" value={initialDate} onChange={(e) => setInitialDate(e.target.value)} />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} loading={saving} disabled={!lastName || !initialDate}>Enregistrer</Button>
          </div>
        </div>
      </Modal>
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={async () => { const res = await dispatch(treatPeopleActions.deleteOne(deleteTarget!.id)); setDeleteTarget(null); if (treatPeopleActions.deleteOne.fulfilled.match(res)) { toastSuccess('Supprimé.'); load(1); } else toastError('Erreur.'); }} message="Supprimer cette personne traitante ?" />
    </div>
  );
}
