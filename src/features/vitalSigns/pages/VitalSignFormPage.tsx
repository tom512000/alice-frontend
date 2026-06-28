import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { vitalSignsActions } from '../vitalSignsSlice';
import { patientsActions } from '@/features/patients/patientsSlice';
import { usersActions } from '@/features/users/usersSlice';
import { staysActions } from '@/features/stays/staysSlice';
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

const n = z.coerce.number().optional().nullable();
const schema = z.object({
  patient: z.string().min(1, 'Patient requis'),
  stay: z.string().optional().nullable(),
  recordedBy: z.string().min(1, 'Soignant requis'),
  recordedAt: z.string().min(1, 'Date requise'),
  temperature: z.string().optional().nullable(),
  systolicBp: n,
  diastolicBp: n,
  heartRate: n,
  oxygenSaturation: z.string().optional().nullable(),
  respiratoryRate: n,
  weight: z.string().optional().nullable(),
  height: z.string().optional().nullable(),
  bloodGlucose: z.string().optional().nullable(),
  painScore: n,
  notes: z.string().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

export function VitalSignFormPage() {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { saving, error } = useAppSelector((s) => s.vitalSigns);
  const patients = useAppSelector((s) => s.patients.items);
  const users = useAppSelector((s) => s.users.items);
  const stays = useAppSelector((s) => s.stays.items);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) as any });

  useEffect(() => {
    dispatch(patientsActions.fetchList({ page: 1, itemsPerPage: 100 }));
    dispatch(usersActions.fetchList({ page: 1, itemsPerPage: 100 }));
    dispatch(staysActions.fetchList({ page: 1, itemsPerPage: 100 }));
    if (isEdit && id) {
      dispatch(vitalSignsActions.fetchOne(id)).then((res) => {
        if (vitalSignsActions.fetchOne.fulfilled.match(res)) {
          const v = res.payload;
          reset({ ...v,
            patient: typeof v.patient === 'string' ? v.patient : v.patient?.['@id'],
            recordedBy: typeof v.recordedBy === 'string' ? v.recordedBy : v.recordedBy?.['@id'],
            stay: v.stay ? (typeof v.stay === 'string' ? v.stay : v.stay?.['@id']) : '',
            recordedAt: formatDateTimeInput(v.recordedAt),
          });
        }
      });
    } else {
      const patientParam = searchParams.get('patient');
      reset({
        recordedAt: new Date().toISOString().slice(0, 16),
        patient: patientParam ? `/api/patients/${patientParam}` : '',
      });
    }
  }, [id, isEdit, dispatch, reset, searchParams]);

  async function onSubmit(data: FormData) {
    const payload = {
      ...data,
      recordedAt: new Date(data.recordedAt).toISOString(),
      stay: data.stay || null,
      notes: data.notes || null,
    };
    const result = isEdit && id
      ? await dispatch(vitalSignsActions.updateOne({ id, data: payload }))
      : await dispatch(vitalSignsActions.createOne(payload));

    if (vitalSignsActions.createOne.fulfilled.match(result) || vitalSignsActions.updateOne.fulfilled.match(result)) {
      toastSuccess('Constantes enregistrées.');
      navigate('/vital-signs');
    } else {
      toastError('Erreur.');
    }
  }

  return (
    <div>
      <PageHeader title={isEdit ? 'Modifier les constantes' : 'Saisir les constantes vitales'}
        actions={<Button variant="ghost" size="sm" onClick={() => navigate(-1)} icon={<ArrowLeft className="h-4 w-4" />}>Retour</Button>}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-3xl space-y-5">
          <FormError error={error} />
          <Card>
            <CardBody>
              <FormSection title="Patient & Date">
                <FormGrid cols={2}>
                  <Select label="Patient *" {...register('patient')} options={[{ value: '', label: '—' }, ...patients.map((p) => ({ value: p['@id'], label: formatName(p.lastname, p.firstname) }))]} error={errors.patient?.message} />
                  <Select label="Saisi par *" {...register('recordedBy')} options={[{ value: '', label: '—' }, ...users.map((u) => ({ value: u['@id'], label: formatName(u.lastname, u.firstname) }))]} error={errors.recordedBy?.message} />
                </FormGrid>
                <FormGrid cols={2}>
                  <Input label="Date et heure *" type="datetime-local" {...register('recordedAt')} error={errors.recordedAt?.message} />
                  <Select label="Séjour lié" {...register('stay')} options={[{ value: '', label: '— Aucun —' }, ...stays.map((s) => ({ value: s['@id'], label: `${formatName(s.patient?.lastname, s.patient?.firstname)} — ${s.startDate}` }))]} />
                </FormGrid>
              </FormSection>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <FormSection title="Mesures">
                <FormGrid cols={3}>
                  <Input label="Température (°C)" type="number" step="0.1" {...register('temperature')} placeholder="36.5" />
                  <Input label="TA systolique" type="number" {...register('systolicBp')} placeholder="120" />
                  <Input label="TA diastolique" type="number" {...register('diastolicBp')} placeholder="80" />
                  <Input label="Fréquence cardiaque" type="number" {...register('heartRate')} placeholder="72" />
                  <Input label="SpO2 (%)" type="number" step="0.1" {...register('oxygenSaturation')} placeholder="98" />
                  <Input label="Fréquence resp." type="number" {...register('respiratoryRate')} placeholder="16" />
                  <Input label="Poids (kg)" type="number" step="0.1" {...register('weight')} placeholder="70" />
                  <Input label="Taille (cm)" type="number" step="0.1" {...register('height')} placeholder="170" />
                  <Input label="Glycémie (mmol/L)" type="number" step="0.01" {...register('bloodGlucose')} />
                  <Input label="Douleur EVA (0-10)" type="number" min={0} max={10} {...register('painScore')} />
                </FormGrid>
                <Textarea label="Notes" {...register('notes')} rows={2} />
              </FormSection>
            </CardBody>
          </Card>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>Annuler</Button>
            <Button type="submit" loading={saving} icon={<Save className="h-4 w-4" />}>Enregistrer</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
