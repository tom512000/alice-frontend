import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { commentsActions } from '../commentsSlice';
import { patientsActions } from '@/features/patients/patientsSlice';
import { usersActions } from '@/features/users/usersSlice';
import { consultationsActions } from '@/features/consultations/consultationsSlice';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { FormSection, FormGrid, FormError } from '@/components/forms/FormSection';
import { useToast } from '@/components/ui/Toast';
import { formatName, formatDate, formatDateTimeInput } from '@/lib/format';
import { Save, ArrowLeft } from 'lucide-react';

const schema = z.object({
  patient: z.string().min(1, 'Patient requis'),
  author: z.string().min(1, 'Auteur requis'),
  consultation: z.string().optional().nullable(),
  writtenAt: z.string().min(1, 'Date requise'),
  content: z.string().min(1, 'Le commentaire ne peut pas être vide'),
});

type FormData = z.infer<typeof schema>;

export function CommentFormPage() {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { saving, error } = useAppSelector((s) => s.comments);
  const patients = useAppSelector((s) => s.patients.items);
  const users = useAppSelector((s) => s.users.items);
  const consultations = useAppSelector((s) => s.consultations.items);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    dispatch(patientsActions.fetchList({ page: 1, itemsPerPage: 100 }));
    dispatch(usersActions.fetchList({ page: 1, itemsPerPage: 100 }));
    dispatch(consultationsActions.fetchList({ page: 1, itemsPerPage: 100 }));
    if (isEdit && id) {
      dispatch(commentsActions.fetchOne(id)).then((res) => {
        if (commentsActions.fetchOne.fulfilled.match(res)) {
          const c = res.payload;
          reset({
            patient: typeof c.patient === 'string' ? c.patient : c.patient?.['@id'],
            author: typeof c.author === 'string' ? c.author : c.author?.['@id'],
            consultation: c.consultation ? (typeof c.consultation === 'string' ? c.consultation : c.consultation['@id']) : '',
            writtenAt: formatDateTimeInput(c.writtenAt),
            content: c.content,
          });
        }
      });
    } else {
      const patientParam = searchParams.get('patient');
      reset({
        writtenAt: new Date().toISOString().slice(0, 16),
        patient: patientParam ? `/api/patients/${patientParam}` : '',
        consultation: '',
        content: '',
      });
    }
  }, [id, isEdit, dispatch, reset, searchParams]);

  async function onSubmit(data: FormData) {
    const payload = {
      patient: data.patient,
      author: data.author,
      consultation: data.consultation || null,
      writtenAt: new Date(data.writtenAt).toISOString(),
      content: data.content,
    };
    const result = isEdit && id
      ? await dispatch(commentsActions.updateOne({ id, data: payload }))
      : await dispatch(commentsActions.createOne(payload));

    if (commentsActions.createOne.fulfilled.match(result) || commentsActions.updateOne.fulfilled.match(result)) {
      toastSuccess(isEdit ? 'Commentaire mis à jour.' : 'Commentaire créé.');
      navigate('/comments');
    } else {
      toastError('Erreur.');
    }
  }

  return (
    <div>
      <PageHeader title={isEdit ? 'Modifier le commentaire' : 'Nouveau commentaire'}
        actions={<Button variant="ghost" size="sm" onClick={() => navigate(-1)} icon={<ArrowLeft className="h-4 w-4" />}>Retour</Button>}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-2xl space-y-5">
          <FormError error={error} />
          <Card>
            <CardBody>
              <FormSection title="Commentaire">
                <FormGrid cols={2}>
                  <Select label="Patient *" {...register('patient')} options={[{ value: '', label: '—' }, ...patients.map((p) => ({ value: p['@id'], label: formatName(p.lastname, p.firstname) }))]} error={errors.patient?.message} />
                  <Select label="Auteur *" {...register('author')} options={[{ value: '', label: '—' }, ...users.map((u) => ({ value: u['@id'], label: formatName(u.lastname, u.firstname) }))]} error={errors.author?.message} />
                </FormGrid>
                <FormGrid cols={2}>
                  <Select label="Consultation liée" {...register('consultation')} options={[{ value: '', label: '— Aucune —' }, ...consultations.map((c) => ({ value: c['@id'], label: `${formatDate(c.consultationDate)} — ${formatName(c.patient?.lastname, c.patient?.firstname)}` }))]} />
                  <Input label="Date *" type="datetime-local" {...register('writtenAt')} error={errors.writtenAt?.message} />
                </FormGrid>
                <Textarea label="Commentaire *" {...register('content')} rows={4} error={errors.content?.message} />
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
