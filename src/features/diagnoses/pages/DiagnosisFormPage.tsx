import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { diagnosesActions } from '../diagnosesSlice';
import { patientsActions } from '@/features/patients/patientsSlice';
import { usersActions } from '@/features/users/usersSlice';
import { icd10Actions } from '@/features/icd10/icd10Slice';
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
  physician: z.string().min(1, 'Médecin requis'),
  diagnosedAt: z.string().min(1, 'Date requise'),
  label: z.string().min(1, 'Libellé requis'),
  icd10Code: z.string().optional().nullable(),
  type: z.string().min(1),
  certainty: z.string().min(1),
  notes: z.string().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

const TYPES = ['principal', 'associated', 'secondary', 'complication', 'differential'];
const CERTAINTIES = ['confirmed', 'suspected', 'excluded'];
const TYPE_LABELS: Record<string, string> = { principal: 'Principal', associated: 'Associé', secondary: 'Secondaire', complication: 'Complication', differential: 'Différentiel' };
const CERTAINTY_LABELS: Record<string, string> = { confirmed: 'Confirmé', suspected: 'Suspecté', excluded: 'Exclu' };

export function DiagnosisFormPage() {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { saving, error } = useAppSelector((s) => s.diagnoses);
  const patients = useAppSelector((s) => s.patients.items);
  const users = useAppSelector((s) => s.users.items);
  const icd10Codes = useAppSelector((s) => s.icd10.items);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'principal', certainty: 'confirmed' },
  });

  const icd10Reg = register('icd10Code');

  useEffect(() => {
    dispatch(patientsActions.fetchList({ page: 1, itemsPerPage: 100 }));
    dispatch(usersActions.fetchList({ page: 1, itemsPerPage: 100 }));
    dispatch(icd10Actions.fetchList({ page: 1, itemsPerPage: 200, order: { code: 'asc' } }));
    if (isEdit && id) {
      dispatch(diagnosesActions.fetchOne(id)).then((res) => {
        if (diagnosesActions.fetchOne.fulfilled.match(res)) {
          const d = res.payload;
          reset({
            patient: typeof d.patient === 'string' ? d.patient : d.patient?.['@id'],
            physician: typeof d.physician === 'string' ? d.physician : d.physician?.['@id'],
            diagnosedAt: formatDateTimeInput(d.diagnosedAt),
            label: d.label,
            icd10Code: d.icd10Code ?? '',
            type: d.type,
            certainty: d.certainty,
            notes: d.notes ?? '',
          });
        }
      });
    } else {
      const patientParam = searchParams.get('patient');
      reset({
        diagnosedAt: new Date().toISOString().slice(0, 16),
        patient: patientParam ? `/api/patients/${patientParam}` : '',
        type: 'principal', certainty: 'confirmed',
      });
    }
  }, [id, isEdit, dispatch, reset, searchParams]);

  async function onSubmit(data: FormData) {
    const payload = {
      ...data,
      diagnosedAt: new Date(data.diagnosedAt).toISOString(),
      icd10Code: data.icd10Code || null,
      notes: data.notes || null,
    };
    const result = isEdit && id
      ? await dispatch(diagnosesActions.updateOne({ id, data: payload }))
      : await dispatch(diagnosesActions.createOne(payload));

    if (diagnosesActions.createOne.fulfilled.match(result) || diagnosesActions.updateOne.fulfilled.match(result)) {
      toastSuccess(isEdit ? 'Diagnostic mis à jour.' : 'Diagnostic créé.');
      navigate('/diagnoses');
    } else {
      toastError('Erreur.');
    }
  }

  return (
    <div>
      <PageHeader title={isEdit ? 'Modifier le diagnostic' : 'Nouveau diagnostic'}
        actions={<Button variant="ghost" size="sm" onClick={() => navigate(-1)} icon={<ArrowLeft className="h-4 w-4" />}>Retour</Button>}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-2xl space-y-5">
          <FormError error={error} />
          <Card>
            <CardBody>
              <FormSection title="Diagnostic">
                <FormGrid cols={2}>
                  <Select label="Patient *" {...register('patient')} options={[{ value: '', label: '—' }, ...patients.map((p) => ({ value: p['@id'], label: formatName(p.lastname, p.firstname) }))]} error={errors.patient?.message} />
                  <Select label="Médecin *" {...register('physician')} options={[{ value: '', label: '—' }, ...users.map((u) => ({ value: u['@id'], label: formatName(u.lastname, u.firstname) }))]} error={errors.physician?.message} />
                </FormGrid>
                <FormGrid cols={2}>
                  <Input label="Date *" type="datetime-local" {...register('diagnosedAt')} error={errors.diagnosedAt?.message} />
                  <Select
                    label="Code CIM-10"
                    {...icd10Reg}
                    onChange={(e) => {
                      icd10Reg.onChange(e);
                      const match = icd10Codes.find((c) => c.code === e.target.value);
                      if (match) setValue('label', match.label);
                    }}
                    options={[
                      { value: '', label: '— Aucun —' },
                      ...icd10Codes.map((c) => ({ value: c.code, label: `${c.code} — ${c.label}` })),
                    ]}
                    error={errors.icd10Code?.message}
                  />
                </FormGrid>
                <Input label="Libellé du diagnostic *" {...register('label')} error={errors.label?.message} />
                <FormGrid cols={2}>
                  <Select label="Type" {...register('type')} options={TYPES.map((t) => ({ value: t, label: TYPE_LABELS[t] }))} error={errors.type?.message} />
                  <Select label="Certitude" {...register('certainty')} options={CERTAINTIES.map((c) => ({ value: c, label: CERTAINTY_LABELS[c] }))} error={errors.certainty?.message} />
                </FormGrid>
                <Textarea label="Notes" {...register('notes')} rows={3} />
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
