import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { surgicalOperationsActions } from '../surgicalOperationsSlice';
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
import { RoomPickerModal } from '@/features/rooms/components/RoomPickerModal';
import { Save, ArrowLeft, LayoutGrid } from 'lucide-react';

const schema = z.object({
  patient: z.string().min(1, 'Patient requis'),
  leadSurgeon: z.string().min(1, 'Chirurgien requis'),
  anesthesiologist: z.string().optional().nullable(),
  operationType: z.string().min(1, 'Type requis'),
  status: z.string().min(1),
  scheduledAt: z.string().min(1, 'Date requise'),
  performedAt: z.string().optional().nullable(),
  durationMinutes: z.coerce.number().positive().optional().nullable(),
  operatingRoom: z.string().optional().nullable(),
  anesthesiaType: z.string().optional().nullable(),
  ccamCode: z.string().optional().nullable(),
  preoperativeNotes: z.string().optional().nullable(),
  operativeReport: z.string().optional().nullable(),
  complications: z.string().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

const ANESTHESIA_TYPES = ['générale', 'locorégionale', 'rachianesthésie', 'péridurale', 'locale', 'sédation'];

export function SurgicalOperationFormPage() {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { saving, error } = useAppSelector((s) => s.surgicalOperations);
  const patients = useAppSelector((s) => s.patients.items);
  const users = useAppSelector((s) => s.users.items);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) as any, defaultValues: { status: 'scheduled' } });

  const [roomPickerOpen, setRoomPickerOpen] = useState(false);

  useEffect(() => {
    dispatch(patientsActions.fetchList({ page: 1, itemsPerPage: 100 }));
    dispatch(usersActions.fetchList({ page: 1, itemsPerPage: 100 }));
    if (isEdit && id) {
      dispatch(surgicalOperationsActions.fetchOne(id)).then((res) => {
        if (surgicalOperationsActions.fetchOne.fulfilled.match(res)) {
          const op = res.payload;
          reset({
            patient: typeof op.patient === 'string' ? op.patient : op.patient?.['@id'],
            leadSurgeon: typeof op.leadSurgeon === 'string' ? op.leadSurgeon : op.leadSurgeon?.['@id'],
            anesthesiologist: op.anesthesiologist ? (typeof op.anesthesiologist === 'string' ? op.anesthesiologist : op.anesthesiologist?.['@id']) : '',
            operationType: op.operationType,
            status: op.status,
            scheduledAt: formatDateTimeInput(op.scheduledAt),
            performedAt: op.performedAt ? formatDateTimeInput(op.performedAt) : '',
            durationMinutes: op.durationMinutes,
            operatingRoom: op.operatingRoom ?? '',
            anesthesiaType: op.anesthesiaType ?? '',
            ccamCode: op.ccamCode ?? '',
            preoperativeNotes: op.preoperativeNotes ?? '',
            operativeReport: op.operativeReport ?? '',
            complications: op.complications ?? '',
          });
        }
      });
    } else {
      const patientParam = searchParams.get('patient');
      reset({ scheduledAt: new Date().toISOString().slice(0, 16), patient: patientParam ? `/api/patients/${patientParam}` : '', status: 'scheduled' });
    }
  }, [id, isEdit, dispatch, reset, searchParams]);

  async function onSubmit(data: FormData) {
    const payload = {
      ...data,
      scheduledAt: new Date(data.scheduledAt).toISOString(),
      performedAt: data.performedAt ? new Date(data.performedAt).toISOString() : null,
      anesthesiologist: data.anesthesiologist || null,
      durationMinutes: data.durationMinutes || null,
      operatingRoom: data.operatingRoom || null,
      anesthesiaType: data.anesthesiaType || null,
      ccamCode: data.ccamCode || null,
      preoperativeNotes: data.preoperativeNotes || null,
      operativeReport: data.operativeReport || null,
      complications: data.complications || null,
    };
    const result = isEdit && id
      ? await dispatch(surgicalOperationsActions.updateOne({ id, data: payload }))
      : await dispatch(surgicalOperationsActions.createOne(payload));

    if (surgicalOperationsActions.createOne.fulfilled.match(result) || surgicalOperationsActions.updateOne.fulfilled.match(result)) {
      toastSuccess(isEdit ? 'Intervention mise à jour.' : 'Intervention créée.');
      navigate('/surgical-operations');
    } else {
      toastError('Erreur.');
    }
  }

  const userOptions = [{ value: '', label: '—' }, ...users.map((u) => ({ value: u['@id'], label: formatName(u.lastname, u.firstname) }))];

  return (
    <div>
      <PageHeader title={isEdit ? 'Modifier l\'intervention' : 'Nouvelle intervention chirurgicale'}
        actions={<Button variant="ghost" size="sm" onClick={() => navigate(-1)} icon={<ArrowLeft className="h-4 w-4" />}>Retour</Button>}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-3xl space-y-5">
          <FormError error={error} />
          <Card>
            <CardBody>
              <FormSection title="Informations principales">
                <FormGrid cols={2}>
                  <Select label="Patient *" {...register('patient')} options={[{ value: '', label: '—' }, ...patients.map((p) => ({ value: p['@id'], label: formatName(p.lastname, p.firstname) }))]} error={errors.patient?.message} />
                  <Input label="Type d'intervention *" {...register('operationType')} error={errors.operationType?.message} />
                </FormGrid>
                <FormGrid cols={2}>
                  <Select label="Chirurgien principal *" {...register('leadSurgeon')} options={userOptions} error={errors.leadSurgeon?.message} />
                  <Select label="Anesthésiste" {...register('anesthesiologist')} options={userOptions} />
                </FormGrid>
                <FormGrid cols={3}>
                  <Input label="Date prévue *" type="datetime-local" {...register('scheduledAt')} error={errors.scheduledAt?.message} />
                  <Input label="Date réalisée" type="datetime-local" {...register('performedAt')} />
                  <Input label="Durée (minutes)" type="number" {...register('durationMinutes')} />
                </FormGrid>
                <FormGrid cols={3}>
                  <Select label="Statut" {...register('status')} options={[{ value: 'scheduled', label: 'Planifiée' }, { value: 'performed', label: 'Réalisée' }, { value: 'cancelled', label: 'Annulée' }, { value: 'postponed', label: 'Reportée' }]} />
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Input label="Salle d'opération" {...register('operatingRoom')} placeholder="Ex : Bloc A - Salle 2" />
                    </div>
                    <Button type="button" variant="outline" onClick={() => setRoomPickerOpen(true)} icon={<LayoutGrid className="h-4 w-4" />}>
                      Plan
                    </Button>
                  </div>
                  <Input label="Code CCAM" {...register('ccamCode')} />
                </FormGrid>
                <Select label="Anesthésie" {...register('anesthesiaType')} options={[{ value: '', label: '— Aucune —' }, ...ANESTHESIA_TYPES.map((t) => ({ value: t, label: t }))]} />
              </FormSection>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <FormSection title="Rapport opératoire">
                <Textarea label="Notes préopératoires" {...register('preoperativeNotes')} rows={3} />
                <Textarea label="Compte-rendu opératoire" {...register('operativeReport')} rows={5} />
                <Textarea label="Complications" {...register('complications')} rows={2} />
              </FormSection>
            </CardBody>
          </Card>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>Annuler</Button>
            <Button type="submit" loading={saving} icon={<Save className="h-4 w-4" />}>{isEdit ? 'Mettre à jour' : 'Créer'}</Button>
          </div>
        </div>
      </form>

      <RoomPickerModal
        open={roomPickerOpen}
        onClose={() => setRoomPickerOpen(false)}
        onSelect={(room) => setValue('operatingRoom', room.name, { shouldDirty: true, shouldValidate: true })}
        title="Choisir la salle d'opération"
        currentValue={watch('operatingRoom')}
        preferBloc
      />
    </div>
  );
}
