import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { consentsActions } from '../consentsSlice';
import { patientsActions } from '@/features/patients/patientsSlice';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { FormSection, FormGrid, FormError } from '@/components/forms/FormSection';
import { useToast } from '@/components/ui/Toast';
import { formatName, formatDateTimeInput, CONSENT_TYPE_LABELS, CONSENT_STATUS_LABELS } from '@/lib/format';
import { Save, ArrowLeft } from 'lucide-react';
import type { ConsentType, ConsentStatus } from '@/types/entities';

const schema = z.object({
  patient: z.string().min(1, 'Patient requis'),
  type: z.string().min(1),
  status: z.string().min(1),
  recordedAt: z.string().min(1, 'Date requise'),
  notes: z.string().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

export function ConsentFormPage() {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { saving, error } = useAppSelector((s) => s.consents);
  const patients = useAppSelector((s) => s.patients.items);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'care', status: 'granted' },
  });

  useEffect(() => {
    dispatch(patientsActions.fetchList({ page: 1, itemsPerPage: 100 }));
    if (isEdit && id) {
      dispatch(consentsActions.fetchOne(id)).then((res) => {
        if (consentsActions.fetchOne.fulfilled.match(res)) {
          const c = res.payload;
          reset({
            patient: typeof c.patient === 'string' ? c.patient : c.patient?.['@id'],
            type: c.type,
            status: c.status,
            recordedAt: formatDateTimeInput(c.recordedAt),
            notes: c.notes ?? '',
          });
        }
      });
    } else {
      const patientParam = searchParams.get('patient');
      reset({
        type: 'care',
        status: 'granted',
        recordedAt: new Date().toISOString().slice(0, 16),
        patient: patientParam ? `/api/patients/${patientParam}` : '',
      });
    }
  }, [id, isEdit, dispatch, reset, searchParams]);

  async function onSubmit(data: FormData) {
    const payload = {
      ...data,
      type: data.type as ConsentType,
      status: data.status as ConsentStatus,
      recordedAt: new Date(data.recordedAt).toISOString(),
      notes: data.notes || null,
    };
    const result = isEdit && id
      ? await dispatch(consentsActions.updateOne({ id, data: payload }))
      : await dispatch(consentsActions.createOne(payload));

    if (consentsActions.createOne.fulfilled.match(result) || consentsActions.updateOne.fulfilled.match(result)) {
      toastSuccess(isEdit ? 'Consentement mis à jour.' : 'Consentement enregistré.');
      navigate('/consents');
    } else {
      toastError('Erreur.');
    }
  }

  return (
    <div>
      <PageHeader title={isEdit ? 'Modifier le consentement' : 'Nouveau consentement'}
        actions={<Button variant="ghost" size="sm" onClick={() => navigate(-1)} icon={<ArrowLeft className="h-4 w-4" />}>Retour</Button>}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-2xl space-y-5">
          <FormError error={error} />
          <Card>
            <CardBody>
              <FormSection title="Consentement (RGPD)">
                <Select label="Patient *" {...register('patient')} options={[{ value: '', label: '—' }, ...patients.map((p) => ({ value: p['@id'], label: formatName(p.lastname, p.firstname) }))]} error={errors.patient?.message} />
                <FormGrid cols={2}>
                  <Select label="Type" {...register('type')} options={Object.entries(CONSENT_TYPE_LABELS).map(([value, label]) => ({ value, label }))} error={errors.type?.message} />
                  <Select label="Statut" {...register('status')} options={Object.entries(CONSENT_STATUS_LABELS).map(([value, label]) => ({ value, label }))} error={errors.status?.message} />
                </FormGrid>
                <Input label="Date de recueil *" type="datetime-local" {...register('recordedAt')} error={errors.recordedAt?.message} />
                <Textarea label="Notes" {...register('notes')} rows={3} />
              </FormSection>
            </CardBody>
          </Card>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>Annuler</Button>
            <Button type="submit" loading={saving} icon={<Save className="h-4 w-4" />}>{isEdit ? 'Mettre à jour' : 'Enregistrer'}</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
