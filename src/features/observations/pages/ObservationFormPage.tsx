import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { observationsActions } from '../observationsSlice';
import { staysActions } from '@/features/stays/staysSlice';
import { usersActions } from '@/features/users/usersSlice';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardBody } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FormSection, FormGrid, FormError } from '@/components/forms/FormSection';
import { useToast } from '@/components/ui/Toast';
import { formatName, formatDateTimeInput } from '@/lib/format';
import { Save, ArrowLeft } from 'lucide-react';

const schema = z.object({
  stay: z.string().optional().nullable(),
  user: z.string().min(1, 'Auteur requis'),
  observationDate: z.string().min(1, 'Date requise'),
  note: z.string().min(1, 'Note requise'),
});

type FormData = z.infer<typeof schema>;

export function ObservationFormPage() {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { saving, error } = useAppSelector((s) => s.observations);
  const stays = useAppSelector((s) => s.stays.items);
  const users = useAppSelector((s) => s.users.items);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    dispatch(staysActions.fetchList({ page: 1, itemsPerPage: 100 }));
    dispatch(usersActions.fetchList({ page: 1, itemsPerPage: 100 }));
    if (isEdit && id) {
      dispatch(observationsActions.fetchOne(id)).then((res) => {
        if (observationsActions.fetchOne.fulfilled.match(res)) {
          const o = res.payload;
          reset({
            stay: typeof o.stay === 'string' ? o.stay : (o.stay as { '@id'?: string } | null)?.['@id'] ?? '',
            user: typeof o.user === 'string' ? o.user : o.user?.['@id'],
            observationDate: formatDateTimeInput(o.observationDate),
            note: o.note,
          });
        }
      });
    } else {
      reset({ observationDate: new Date().toISOString().slice(0, 16) });
    }
  }, [id, isEdit, dispatch, reset, searchParams]);

  async function onSubmit(data: FormData) {
    const payload = {
      stay: data.stay || null,
      user: data.user,
      observationDate: new Date(data.observationDate).toISOString(),
      note: data.note,
    };
    const result = isEdit && id
      ? await dispatch(observationsActions.updateOne({ id, data: payload }))
      : await dispatch(observationsActions.createOne(payload));

    if (observationsActions.createOne.fulfilled.match(result) || observationsActions.updateOne.fulfilled.match(result)) {
      toastSuccess(isEdit ? 'Observation mise à jour.' : 'Observation créée.');
      navigate('/observations');
    } else {
      toastError('Erreur.');
    }
  }

  return (
    <div>
      <PageHeader title={isEdit ? 'Modifier l\'observation' : 'Nouvelle observation'}
        actions={<Button variant="ghost" size="sm" onClick={() => navigate(-1)} icon={<ArrowLeft className="h-4 w-4" />}>Retour</Button>}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-2xl space-y-5">
          <FormError error={error} />
          <Card>
            <CardBody>
              <FormSection title="Observation">
                <FormGrid cols={2}>
                  <Select label="Séjour lié" {...register('stay')} options={[{ value: '', label: '— Aucun —' }, ...stays.map((s) => ({ value: s['@id'], label: `${formatName(s.patient?.lastname, s.patient?.firstname)} — ${s.startDate}` }))]} />
                  <Select label="Auteur *" {...register('user')} options={[{ value: '', label: '—' }, ...users.map((u) => ({ value: u['@id'], label: formatName(u.lastname, u.firstname) }))]} error={errors.user?.message} />
                </FormGrid>
                <Input label="Date et heure *" type="datetime-local" {...register('observationDate')} error={errors.observationDate?.message} />
                <Textarea label="Note *" {...register('note')} rows={5} error={errors.note?.message} />
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
