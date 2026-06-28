import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { medicalExamsActions } from '../medicalExamsSlice';
import { patientsActions } from '@/features/patients/patientsSlice';
import { usersActions } from '@/features/users/usersSlice';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { FormSection, FormGrid, FormError } from '@/components/forms/FormSection';
import { useToast } from '@/components/ui/Toast';
import { formatName, formatDateInput, EXAM_TYPE_LABELS } from '@/lib/format';
import { Save, ArrowLeft } from 'lucide-react';

const schema = z.object({
  patient: z.string().min(1, 'Patient requis'),
  prescribedBy: z.string().min(1, 'Prescripteur requis'),
  type: z.string().min(1, 'Type requis'),
  requestDate: z.string().min(1, 'Date requise'),
  resultDate: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  results: z.string().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

export function MedicalExamFormPage() {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { saving, error } = useAppSelector((s) => s.medicalExams);
  const patients = useAppSelector((s) => s.patients.items);
  const users = useAppSelector((s) => s.users.items);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    dispatch(patientsActions.fetchList({ page: 1, itemsPerPage: 100 }));
    dispatch(usersActions.fetchList({ page: 1, itemsPerPage: 100 }));
    if (isEdit && id) {
      dispatch(medicalExamsActions.fetchOne(id)).then((res) => {
        if (medicalExamsActions.fetchOne.fulfilled.match(res)) {
          const e = res.payload;
          reset({
            patient: typeof e.patient === 'string' ? e.patient : e.patient?.['@id'],
            prescribedBy: typeof e.prescribedBy === 'string' ? e.prescribedBy : e.prescribedBy?.['@id'],
            type: e.type,
            requestDate: formatDateInput(e.requestDate),
            resultDate: e.resultDate ? formatDateInput(e.resultDate) : '',
            description: e.description ?? '',
            results: e.results ?? '',
          });
        }
      });
    } else {
      const patientParam = searchParams.get('patient');
      reset({
        requestDate: new Date().toISOString().split('T')[0],
        patient: patientParam ? `/api/patients/${patientParam}` : '',
        type: 'blood_test',
      });
    }
  }, [id, isEdit, dispatch, reset, searchParams]);

  async function onSubmit(data: FormData) {
    const payload = { ...data, resultDate: data.resultDate || null, description: data.description || null, results: data.results || null };
    const result = isEdit && id
      ? await dispatch(medicalExamsActions.updateOne({ id, data: payload }))
      : await dispatch(medicalExamsActions.createOne(payload));

    if (medicalExamsActions.createOne.fulfilled.match(result) || medicalExamsActions.updateOne.fulfilled.match(result)) {
      toastSuccess(isEdit ? 'Examen mis à jour.' : 'Examen créé.');
      navigate('/medical-exams');
    } else {
      toastError('Erreur.');
    }
  }

  const examTypes = Object.entries(EXAM_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }));

  return (
    <div>
      <PageHeader title={isEdit ? 'Modifier l\'examen' : 'Nouvel examen médical'}
        actions={<Button variant="ghost" size="sm" onClick={() => navigate(-1)} icon={<ArrowLeft className="h-4 w-4" />}>Retour</Button>}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-2xl space-y-5">
          <FormError error={error} />
          <Card>
            <CardBody>
              <FormSection title="Examen">
                <FormGrid cols={2}>
                  <Select label="Patient *" {...register('patient')} options={[{ value: '', label: '—' }, ...patients.map((p) => ({ value: p['@id'], label: formatName(p.lastname, p.firstname) }))]} error={errors.patient?.message} />
                  <Select label="Prescrit par *" {...register('prescribedBy')} options={[{ value: '', label: '—' }, ...users.map((u) => ({ value: u['@id'], label: formatName(u.lastname, u.firstname) }))]} error={errors.prescribedBy?.message} />
                </FormGrid>
                <FormGrid cols={3}>
                  <Select label="Type *" {...register('type')} options={examTypes} error={errors.type?.message} />
                  <Input label="Date de demande *" type="date" {...register('requestDate')} error={errors.requestDate?.message} />
                  <Input label="Date de résultat" type="date" {...register('resultDate')} />
                </FormGrid>
                <Textarea label="Description / Indication" {...register('description')} rows={3} />
                <Textarea label="Résultats" {...register('results')} rows={4} />
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
