import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { staysActions } from '../staysSlice';
import { patientsActions } from '@/features/patients/patientsSlice';
import { servicesActions } from '@/features/services/servicesSlice';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { FormSection, FormGrid, FormError } from '@/components/forms/FormSection';
import { useToast } from '@/components/ui/Toast';
import { formatName, formatDateInput } from '@/lib/format';
import { RoomPickerModal } from '@/features/rooms/components/RoomPickerModal';
import { Save, ArrowLeft, LayoutGrid } from 'lucide-react';

const schema = z.object({
  patient: z.string().min(1, 'Patient requis'),
  startDate: z.string().min(1, 'Date de début requise'),
  endDate: z.string().optional().nullable(),
  room: z.string().optional().nullable(),
  service: z.string().optional().nullable(),
  observation: z.string().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

export function StayFormPage() {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { saving, error } = useAppSelector((s) => s.stays);
  const patients = useAppSelector((s) => s.patients.items);
  const services = useAppSelector((s) => s.services.items);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const [roomPickerOpen, setRoomPickerOpen] = useState(false);

  useEffect(() => {
    dispatch(patientsActions.fetchList({ page: 1, itemsPerPage: 100 }));
    dispatch(servicesActions.fetchList({ page: 1, itemsPerPage: 100 }));
    if (isEdit && id) {
      dispatch(staysActions.fetchOne(id)).then((res) => {
        if (staysActions.fetchOne.fulfilled.match(res)) {
          const s = res.payload;
          reset({
            patient: typeof s.patient === 'string' ? s.patient : s.patient?.['@id'],
            startDate: formatDateInput(s.startDate),
            endDate: s.endDate ? formatDateInput(s.endDate) : '',
            room: s.room ?? '',
            service: s.service?.['@id'] ?? '',
            observation: s.observation ?? '',
          });
        }
      });
    } else {
      const patientParam = searchParams.get('patient');
      reset({
        startDate: new Date().toISOString().split('T')[0],
        patient: patientParam ? `/api/patients/${patientParam}` : '',
      });
    }
  }, [id, isEdit, dispatch, reset, searchParams]);

  async function onSubmit(data: FormData) {
    const payload = {
      patient: data.patient,
      startDate: data.startDate,
      endDate: data.endDate || null,
      room: data.room || null,
      service: data.service || null,
      observation: data.observation || null,
    };
    const result = isEdit && id
      ? await dispatch(staysActions.updateOne({ id, data: payload }))
      : await dispatch(staysActions.createOne(payload));

    if (staysActions.createOne.fulfilled.match(result) || staysActions.updateOne.fulfilled.match(result)) {
      toastSuccess(isEdit ? 'Séjour mis à jour.' : 'Séjour créé.');
      navigate(`/stays/${result.payload.id}`);
    } else {
      toastError('Erreur.');
    }
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Modifier le séjour' : 'Nouveau séjour'}
        actions={<Button variant="ghost" size="sm" onClick={() => navigate(-1)} icon={<ArrowLeft className="h-4 w-4" />}>Retour</Button>}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-2xl space-y-5">
          <FormError error={error} />
          <Card>
            <CardBody>
              <FormSection title="Séjour">
                <Select label="Patient *" {...register('patient')} options={[{ value: '', label: '—' }, ...patients.map((p) => ({ value: p['@id'], label: formatName(p.lastname, p.firstname) }))]} error={errors.patient?.message} />
                <FormGrid cols={2}>
                  <Input label="Date d'entrée *" type="date" {...register('startDate')} error={errors.startDate?.message} />
                  <Input label="Date de sortie" type="date" {...register('endDate')} />
                </FormGrid>
                <FormGrid cols={2}>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Input label="Chambre" {...register('room')} placeholder="Ex: 302" />
                    </div>
                    <Button type="button" variant="outline" onClick={() => setRoomPickerOpen(true)} icon={<LayoutGrid className="h-4 w-4" />}>
                      Plan
                    </Button>
                  </div>
                  <Select label="Service" {...register('service')} options={[{ value: '', label: '—' }, ...services.map((s) => ({ value: s['@id'], label: s.serviceName }))]} />
                </FormGrid>
                <Textarea label="Observation générale" {...register('observation')} rows={3} />
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

      <RoomPickerModal
        open={roomPickerOpen}
        onClose={() => setRoomPickerOpen(false)}
        onSelect={(room) => {
          setValue('room', room.name, { shouldDirty: true, shouldValidate: true });
          // Une salle appartient à un service : on aligne le champ Service dessus.
          const svcIri = typeof room.service === 'string' ? room.service : room.service?.['@id'];
          if (svcIri) setValue('service', svcIri, { shouldDirty: true });
        }}
        title="Choisir la chambre"
        currentValue={watch('room')}
        defaultServiceId={watch('service')}
      />
    </div>
  );
}
