import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { medicalHistoriesActions } from '../medicalHistoriesSlice';
import { patientsActions } from '@/features/patients/patientsSlice';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { FormSection, FormGrid, FormError } from '@/components/forms/FormSection';
import { useToast } from '@/components/ui/Toast';
import { formatName, MEDICAL_HISTORY_TYPE_LABELS } from '@/lib/format';
import { Save, ArrowLeft } from 'lucide-react';

const schema = z.object({
  patient: z.string().min(1, 'Patient requis'),
  type: z.string().min(1, 'Type requis'),
  description: z.string().min(1, 'Description requise'),
  diagnosisYear: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  isActive: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export function MedicalHistoryFormPage() {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { saving, error } = useAppSelector((s) => s.medicalHistories);
  const patients = useAppSelector((s) => s.patients.items);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) as any, defaultValues: { isActive: true } });

  useEffect(() => {
    dispatch(patientsActions.fetchList({ page: 1, itemsPerPage: 100 }));
    if (isEdit && id) {
      dispatch(medicalHistoriesActions.fetchOne(id)).then((res) => {
        if (medicalHistoriesActions.fetchOne.fulfilled.match(res)) {
          const h = res.payload;
          reset({
            patient: typeof h.patient === 'string' ? h.patient : h.patient?.['@id'],
            type: h.type,
            description: h.description,
            diagnosisYear: h.diagnosisYear,
            isActive: h.isActive,
          });
        }
      });
    } else {
      const patientParam = searchParams.get('patient');
      reset({ patient: patientParam ? `/api/patients/${patientParam}` : '', type: 'disease', isActive: true });
    }
  }, [id, isEdit, dispatch, reset, searchParams]);

  async function onSubmit(data: FormData) {
    const payload = {
      patient: data.patient,
      type: data.type,
      description: data.description,
      diagnosisYear: data.diagnosisYear || null,
      isActive: data.isActive ?? true,
    };
    const result = isEdit && id
      ? await dispatch(medicalHistoriesActions.updateOne({ id, data: payload }))
      : await dispatch(medicalHistoriesActions.createOne(payload));

    if (medicalHistoriesActions.createOne.fulfilled.match(result) || medicalHistoriesActions.updateOne.fulfilled.match(result)) {
      toastSuccess(isEdit ? 'Antécédent mis à jour.' : 'Antécédent créé.');
      navigate('/medical-histories');
    } else {
      toastError('Erreur.');
    }
  }

  const types = Object.entries(MEDICAL_HISTORY_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }));

  return (
    <div>
      <PageHeader title={isEdit ? 'Modifier l\'antécédent' : 'Nouvel antécédent médical'}
        actions={<Button variant="ghost" size="sm" onClick={() => navigate(-1)} icon={<ArrowLeft className="h-4 w-4" />}>Retour</Button>}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-2xl space-y-5">
          <FormError error={error} />
          <Card>
            <CardBody>
              <FormSection title="Antécédent">
                <FormGrid cols={2}>
                  <Select label="Patient *" {...register('patient')} options={[{ value: '', label: '—' }, ...patients.map((p) => ({ value: p['@id'], label: formatName(p.lastname, p.firstname) }))]} error={errors.patient?.message} />
                  <Select label="Type *" {...register('type')} options={types} error={errors.type?.message} />
                </FormGrid>
                <FormGrid cols={2}>
                  <Input label="Année de diagnostic" type="number" {...register('diagnosisYear')} placeholder="ex: 2020" />
                  <div className="flex items-center gap-2 pt-6">
                    <input type="checkbox" id="isActive" {...register('isActive')} className="h-4 w-4" />
                    <label htmlFor="isActive" className="text-sm">Actif</label>
                  </div>
                </FormGrid>
                <Textarea label="Description *" {...register('description')} rows={4} error={errors.description?.message} />
              </FormSection>
            </CardBody>
          </Card>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>Annuler</Button>
            <Button type="submit" loading={saving} icon={<Save className="h-4 w-4" />}>{isEdit ? 'Mettre à jour' : 'Créer'}</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
