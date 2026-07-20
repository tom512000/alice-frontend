import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { prescriptionsActions } from '../prescriptionsSlice';
import { consultationsActions } from '@/features/consultations/consultationsSlice';
import { usersActions } from '@/features/users/usersSlice';
import { treatmentsActions } from '@/features/treatments/treatmentsSlice';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FormSection, FormGrid, FormError } from '@/components/forms/FormSection';
import { ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatName } from '@/lib/format';
import { Save, ArrowLeft, X } from 'lucide-react';
import type { TreatmentRead, PrescriptionWrite } from '@/types/entities';

const schema = z.object({
  user: z.string().min(1, 'Prescripteur requis'),
  consultation: z.string().min(1, 'Consultation requise'),
  number: z.string().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

export function PrescriptionFormPage() {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { saving, error } = useAppSelector((s) => s.prescriptions);
  const consultations = useAppSelector((s) => s.consultations.items);
  const users = useAppSelector((s) => s.users.items);
  const allTreatments = useAppSelector((s) => s.treatments.items);
  const [selectedTreatments, setSelectedTreatments] = useState<TreatmentRead[]>([]);
  const [allergyWarning, setAllergyWarning] = useState<string | null>(null);
  const [pendingData, setPendingData] = useState<FormData | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    dispatch(consultationsActions.fetchList({ page: 1, itemsPerPage: 100 }));
    dispatch(usersActions.fetchList({ page: 1, itemsPerPage: 100 }));
    dispatch(treatmentsActions.fetchList({ page: 1, itemsPerPage: 100 }));
    if (isEdit && id) {
      dispatch(prescriptionsActions.fetchOne(id)).then((res) => {
        if (prescriptionsActions.fetchOne.fulfilled.match(res)) {
          const p = res.payload;
          reset({
            user: typeof p.user === 'string' ? p.user : p.user?.['@id'],
            consultation: typeof p.consultation === 'string' ? p.consultation : p.consultation?.['@id'],
            number: p.number ?? '',
          });
          setSelectedTreatments((p.treatments ?? []) as TreatmentRead[]);
        }
      });
    } else {
      const consultationParam = searchParams.get('consultation');
      reset({ consultation: consultationParam ? `/api/consultations/${consultationParam}` : '' });
    }
  }, [id, isEdit, dispatch, reset, searchParams]);

  function addTreatment(treatmentIri: string) {
    const t = allTreatments.find((t) => t['@id'] === treatmentIri);
    if (t && !selectedTreatments.some((st) => st['@id'] === treatmentIri)) {
      setSelectedTreatments((prev) => [...prev, t]);
    }
  }

  function removeTreatment(iri: string) {
    setSelectedTreatments((prev) => prev.filter((t) => t['@id'] !== iri));
  }

  async function submitPrescription(data: FormData, override: boolean) {
    const payload: PrescriptionWrite = {
      user: data.user,
      consultation: data.consultation,
      number: data.number || null,
      treatments: selectedTreatments.map((t) => t['@id']),
      overrideAllergyWarning: override,
    };
    const result = isEdit && id
      ? await dispatch(prescriptionsActions.updateOne({ id, data: payload }))
      : await dispatch(prescriptionsActions.createOne(payload));

    if (prescriptionsActions.createOne.fulfilled.match(result) || prescriptionsActions.updateOne.fulfilled.match(result)) {
      toastSuccess(isEdit ? 'Prescription mise à jour.' : 'Prescription créée.');
      navigate('/prescriptions');
      return;
    }

    // Alerte allergie croisée renvoyée par le backend (HTTP 422) → proposer la surcharge.
    const message = typeof result.payload === 'string' ? result.payload : '';
    if (!override && /allerg/i.test(message)) {
      setPendingData(data);
      setAllergyWarning(message);
    } else {
      toastError('Erreur.');
    }
  }

  async function onSubmit(data: FormData) {
    await submitPrescription(data, false);
  }

  async function confirmOverride() {
    if (!pendingData) return;
    const data = pendingData;
    setAllergyWarning(null);
    setPendingData(null);
    await submitPrescription(data, true);
  }

  const availableTreatments = allTreatments.filter((t) => !selectedTreatments.some((st) => st['@id'] === t['@id']));

  return (
    <div>
      <PageHeader title={isEdit ? 'Modifier la prescription' : 'Nouvelle prescription'}
        actions={<Button variant="ghost" size="sm" onClick={() => navigate(-1)} icon={<ArrowLeft className="h-4 w-4" />}>Retour</Button>}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-2xl space-y-5">
          <FormError error={error} />
          <Card>
            <CardBody>
              <FormSection title="Prescription">
                <FormGrid cols={2}>
                  <Select label="Prescripteur *" {...register('user')} options={[{ value: '', label: '—' }, ...users.map((u) => ({ value: u['@id'], label: formatName(u.lastname, u.firstname) }))]} error={errors.user?.message} />
                  <Select label="Consultation *" {...register('consultation')} options={[{ value: '', label: '—' }, ...consultations.map((c) => ({ value: c['@id'], label: `Consultation #${c.id} — ${formatName(c.patient?.lastname, c.patient?.firstname)}` }))]} error={errors.consultation?.message} />
                </FormGrid>
                <Input label="Numéro" {...register('number')} />
              </FormSection>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <FormSection title="Traitements">
                <div className="flex gap-2">
                  <select className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" onChange={(e) => { if (e.target.value) addTreatment(e.target.value); e.target.value = ''; }} defaultValue="">
                    <option value="">— Ajouter un traitement —</option>
                    {availableTreatments.map((t) => <option key={t['@id']} value={t['@id']}>{t.name}</option>)}
                  </select>
                </div>
                {selectedTreatments.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {selectedTreatments.map((t) => (
                      <li key={t['@id']} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                        <span className="text-sm font-medium">{t.name}</span>
                        <button type="button" onClick={() => removeTreatment(t['@id'])} className="text-gray-400 hover:text-red-500">
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {selectedTreatments.length === 0 && <p className="text-sm text-gray-400 mt-2">Aucun traitement sélectionné.</p>}
              </FormSection>
            </CardBody>
          </Card>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>Annuler</Button>
            <Button type="submit" loading={saving} icon={<Save className="h-4 w-4" />}>{isEdit ? 'Mettre à jour' : 'Créer'}</Button>
          </div>
        </div>
      </form>

      <ConfirmModal
        open={!!allergyWarning}
        onClose={() => { setAllergyWarning(null); setPendingData(null); }}
        onConfirm={confirmOverride}
        loading={saving}
        title="⚠️ Alerte allergie croisée"
        message={`${allergyWarning ?? ''}\n\nVoulez-vous tout de même valider cette prescription ?`}
        confirmLabel="Prescrire malgré tout"
      />
    </div>
  );
}
