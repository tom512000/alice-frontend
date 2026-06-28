import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { appointmentsActions } from '../appointmentsSlice';
import { patientsActions } from '@/features/patients/patientsSlice';
import { usersActions } from '@/features/users/usersSlice';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FormSection, FormGrid, FormError } from '@/components/forms/FormSection';
import { useToast } from '@/components/ui/Toast';
import { formatName, formatDateTimeInput } from '@/lib/format';
import { Save, ArrowLeft } from 'lucide-react';

const schema = z.object({
  patient: z.string().min(1, 'Patient requis'),
  doctor: z.string().min(1, 'Médecin requis'),
  scheduledAt: z.string().min(1, 'Date requise'),
  durationMinutes: z.coerce.number().positive().optional().nullable(),
  reason: z.string().optional().nullable(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']),
  notes: z.string().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

export function AppointmentFormPage() {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { current, saving, error } = useAppSelector((s) => s.appointments);
  const patients = useAppSelector((s) => s.patients.items);
  const doctors = useAppSelector((s) => s.users.items);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { status: 'scheduled' },
  });

  useEffect(() => {
    dispatch(patientsActions.fetchList({ page: 1, itemsPerPage: 100 }));
    dispatch(usersActions.fetchList({ page: 1, itemsPerPage: 100 }));
    if (isEdit && id) {
      dispatch(appointmentsActions.fetchOne(id)).then((res) => {
        if (appointmentsActions.fetchOne.fulfilled.match(res)) {
          const a = res.payload;
          reset({
            patient: typeof a.patient === 'string' ? a.patient : a.patient?.['@id'],
            doctor: typeof a.doctor === 'string' ? a.doctor : a.doctor?.['@id'],
            scheduledAt: formatDateTimeInput(a.scheduledAt),
            durationMinutes: a.durationMinutes,
            reason: a.reason ?? '',
            status: a.status,
            notes: a.notes ?? '',
          });
        }
      });
    } else {
      const patientParam = searchParams.get('patient');
      if (patientParam) {
        reset((prev) => ({ ...prev, patient: `/api/patients/${patientParam}` }));
      }
    }
  }, [id, isEdit, dispatch, reset, searchParams]);

  async function onSubmit(data: FormData) {
    const payload = {
      patient: data.patient,
      doctor: data.doctor,
      scheduledAt: new Date(data.scheduledAt).toISOString(),
      durationMinutes: data.durationMinutes || null,
      reason: data.reason || null,
      status: data.status,
      notes: data.notes || null,
    };

    const result = isEdit && id
      ? await dispatch(appointmentsActions.updateOne({ id, data: payload }))
      : await dispatch(appointmentsActions.createOne(payload));

    if (appointmentsActions.createOne.fulfilled.match(result) || appointmentsActions.updateOne.fulfilled.match(result)) {
      toastSuccess(isEdit ? 'RDV mis à jour.' : 'RDV créé.');
      navigate('/appointments');
    } else {
      toastError('Erreur lors de la sauvegarde.');
    }
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
        actions={<Button variant="ghost" size="sm" onClick={() => navigate(-1)} icon={<ArrowLeft className="h-4 w-4" />}>Retour</Button>}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-2xl space-y-5">
          <FormError error={error} />
          <Card>
            <CardBody>
              <FormSection title="Rendez-vous">
                <FormGrid cols={2}>
                  <Select
                    label="Patient *"
                    {...register('patient')}
                    options={[{ value: '', label: '— Sélectionner —' }, ...patients.map((p) => ({ value: p['@id'], label: formatName(p.lastname, p.firstname) }))]}
                    error={errors.patient?.message}
                  />
                  <Select
                    label="Médecin *"
                    {...register('doctor')}
                    options={[{ value: '', label: '— Sélectionner —' }, ...doctors.map((d) => ({ value: d['@id'], label: formatName(d.lastname, d.firstname) }))]}
                    error={errors.doctor?.message}
                  />
                </FormGrid>
                <FormGrid cols={2}>
                  <Input label="Date et heure *" type="datetime-local" {...register('scheduledAt')} error={errors.scheduledAt?.message} />
                  <Input label="Durée (minutes)" type="number" {...register('durationMinutes')} />
                </FormGrid>
                <Input label="Motif" {...register('reason')} />
                <Select
                  label="Statut"
                  {...register('status')}
                  options={[
                    { value: 'scheduled', label: 'Planifié' },
                    { value: 'completed', label: 'Terminé' },
                    { value: 'cancelled', label: 'Annulé' },
                    { value: 'no_show', label: 'Absent' },
                  ]}
                  error={errors.status?.message}
                />
                <Input label="Notes" {...register('notes')} />
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
