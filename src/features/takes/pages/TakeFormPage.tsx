import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { takesActions } from '../takesSlice';
import { treatmentsActions } from '@/features/treatments/treatmentsSlice';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FormSection, FormGrid, FormError } from '@/components/forms/FormSection';
import { useToast } from '@/components/ui/Toast';
import { formatDateTimeInput } from '@/lib/format';
import { Save, ArrowLeft } from 'lucide-react';

const schema = z.object({
  treatment: z.string().min(1, 'Traitement requis'),
  datetime: z.string().min(1, 'Date et heure requises'),
});

type FormData = z.infer<typeof schema>;

export function TakeFormPage() {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { saving, error } = useAppSelector((s) => s.takes);
  const treatments = useAppSelector((s) => s.treatments.items);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    dispatch(treatmentsActions.fetchList({ page: 1, itemsPerPage: 200 }));
    if (isEdit && id) {
      dispatch(takesActions.fetchOne(id)).then((res) => {
        if (takesActions.fetchOne.fulfilled.match(res)) {
          const t = res.payload;
          reset({
            treatment: typeof t.treatment === 'string' ? t.treatment : t.treatment?.['@id'],
            datetime: formatDateTimeInput(t.datetime),
          });
        }
      });
    } else {
      const treatmentParam = searchParams.get('treatment');
      reset({
        datetime: new Date().toISOString().slice(0, 16),
        treatment: treatmentParam ? `/api/treatments/${treatmentParam}` : '',
      });
    }
  }, [id, isEdit, dispatch, reset, searchParams]);

  async function onSubmit(data: FormData) {
    const payload = {
      treatment: data.treatment,
      datetime: new Date(data.datetime).toISOString(),
    };
    const result = isEdit && id
      ? await dispatch(takesActions.updateOne({ id, data: payload }))
      : await dispatch(takesActions.createOne(payload));

    if (takesActions.createOne.fulfilled.match(result) || takesActions.updateOne.fulfilled.match(result)) {
      toastSuccess(isEdit ? 'Prise mise à jour.' : 'Prise enregistrée.');
      navigate('/takes');
    } else {
      toastError('Erreur.');
    }
  }

  return (
    <div>
      <PageHeader title={isEdit ? 'Modifier la prise' : 'Nouvelle prise'}
        actions={<Button variant="ghost" size="sm" onClick={() => navigate(-1)} icon={<ArrowLeft className="h-4 w-4" />}>Retour</Button>}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-2xl space-y-5">
          <FormError error={error} />
          <Card>
            <CardBody>
              <FormSection title="Prise de traitement">
                <FormGrid cols={2}>
                  <Select label="Traitement *" {...register('treatment')} options={[{ value: '', label: '—' }, ...treatments.map((t) => ({ value: t['@id'], label: t.name }))]} error={errors.treatment?.message} />
                  <Input label="Date et heure *" type="datetime-local" {...register('datetime')} error={errors.datetime?.message} />
                </FormGrid>
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
