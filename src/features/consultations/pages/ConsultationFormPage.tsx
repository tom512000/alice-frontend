import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { consultationsActions } from '../consultationsSlice';
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
import { formatName, formatDateTimeInput } from '@/lib/format';
import { Save, ArrowLeft } from 'lucide-react';

const schema = z.object({
  patient: z.string().min(1, 'Patient requis'),
  user: z.string().min(1, 'Médecin requis'),
  consultationDate: z.string().min(1, 'Date requise'),
  details: z.string().optional().nullable(),
  recommendations: z.string().optional().nullable(),
  price: z.coerce.number().min(0).optional().nullable(),
});

type FormData = z.infer<typeof schema>;

export function ConsultationFormPage() {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { saving, error } = useAppSelector((s) => s.consultations);
  const patients = useAppSelector((s) => s.patients.items);
  const doctors = useAppSelector((s) => s.users.items);
  const currentUser = useAppSelector((s) => s.auth.user);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) as any });

  useEffect(() => {
    dispatch(patientsActions.fetchList({ page: 1, itemsPerPage: 100 }));
    dispatch(usersActions.fetchList({ page: 1, itemsPerPage: 100 }));
    if (isEdit && id) {
      dispatch(consultationsActions.fetchOne(id)).then((res) => {
        if (consultationsActions.fetchOne.fulfilled.match(res)) {
          const c = res.payload;
          reset({
            patient: typeof c.patient === 'string' ? c.patient : c.patient?.['@id'],
            user: typeof c.user === 'string' ? c.user : c.user?.['@id'],
            consultationDate: formatDateTimeInput(c.consultationDate),
            details: c.details ?? '',
            recommendations: c.recommendations ?? '',
            price: c.price ? parseFloat(c.price) : null,
          });
        }
      });
    } else {
      const patientParam = searchParams.get('patient');
      reset({
        consultationDate: new Date().toISOString().slice(0, 16),
        patient: patientParam ? `/api/patients/${patientParam}` : '',
        user: '',
      });
    }
  }, [id, isEdit, dispatch, reset, searchParams]);

  async function onSubmit(data: FormData) {
    const payload = {
      patient: data.patient,
      user: data.user,
      consultationDate: new Date(data.consultationDate).toISOString(),
      details: data.details || null,
      recommendations: data.recommendations || null,
      price: data.price ? String(data.price) : null,
    };
    const result = isEdit && id
      ? await dispatch(consultationsActions.updateOne({ id, data: payload }))
      : await dispatch(consultationsActions.createOne(payload));

    if (consultationsActions.createOne.fulfilled.match(result) || consultationsActions.updateOne.fulfilled.match(result)) {
      toastSuccess(isEdit ? 'Consultation mise à jour.' : 'Consultation créée.');
      navigate(`/consultations/${result.payload.id}`);
    } else {
      toastError('Erreur.');
    }
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Modifier la consultation' : 'Nouvelle consultation'}
        actions={<Button variant="ghost" size="sm" onClick={() => navigate(-1)} icon={<ArrowLeft className="h-4 w-4" />}>Retour</Button>}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-2xl space-y-5">
          <FormError error={error} />
          <Card>
            <CardBody>
              <FormSection title="Consultation">
                <FormGrid cols={2}>
                  <Select label="Patient *" {...register('patient')} options={[{ value: '', label: '—' }, ...patients.map((p) => ({ value: p['@id'], label: formatName(p.lastname, p.firstname) }))]} error={errors.patient?.message} />
                  <Select label="Médecin *" {...register('user')} options={[{ value: '', label: '—' }, ...doctors.map((d) => ({ value: d['@id'], label: formatName(d.lastname, d.firstname) }))]} error={errors.user?.message} />
                </FormGrid>
                <FormGrid cols={2}>
                  <Input label="Date et heure *" type="datetime-local" {...register('consultationDate')} error={errors.consultationDate?.message} />
                  <Input label="Prix (€)" type="number" step="0.01" {...register('price')} />
                </FormGrid>
                <Textarea label="Détails" {...register('details')} rows={4} />
                <Textarea label="Recommandations" {...register('recommendations')} rows={3} />
              </FormSection>
            </CardBody>
          </Card>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>Annuler</Button>
            <Button type="submit" loading={saving} icon={<Save className="h-4 w-4" />}>
              {isEdit ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
