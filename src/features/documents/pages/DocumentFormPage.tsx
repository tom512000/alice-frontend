import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { documentsActions, fileToBase64 } from '../documentsSlice';
import { patientsActions } from '@/features/patients/patientsSlice';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FormSection, FormGrid, FormError } from '@/components/forms/FormSection';
import { useToast } from '@/components/ui/Toast';
import { formatName, DOCUMENT_TYPE_LABELS } from '@/lib/format';
import { Save, ArrowLeft } from 'lucide-react';
import type { DocumentWrite } from '@/types/entities';

const schema = z.object({
  patient: z.string().min(1, 'Patient requis'),
  type: z.string().min(1, 'Type requis'),
  title: z.string().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

const TYPES = Object.keys(DOCUMENT_TYPE_LABELS);

// Garde-fous alignés sur DocumentUploadProcessor côté serveur.
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'tif', 'tiff', 'txt', 'doc', 'docx'];

function validateFile(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `Extension non autorisée. Acceptées : ${ALLOWED_EXTENSIONS.join(', ')}.`;
  }
  if (file.size > MAX_SIZE_BYTES) {
    return 'Fichier trop volumineux (10 Mo maximum).';
  }
  return null;
}

export function DocumentFormPage() {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { saving, error } = useAppSelector((s) => s.documents);
  const patients = useAppSelector((s) => s.patients.items);

  const [file, setFile] = useState<File | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'other' },
  });

  useEffect(() => {
    dispatch(patientsActions.fetchList({ page: 1, itemsPerPage: 100 }));
    if (isEdit && id) {
      dispatch(documentsActions.fetchOne(id)).then((res) => {
        if (documentsActions.fetchOne.fulfilled.match(res)) {
          const d = res.payload;
          setCurrentFileName(d.originalName);
          reset({
            patient: typeof d.patient === 'string' ? d.patient : d.patient?.['@id'],
            type: d.type,
            title: d.title ?? '',
          });
        }
      });
    } else {
      const patientParam = searchParams.get('patient');
      reset({
        type: 'other',
        title: '',
        patient: patientParam ? `/api/patients/${patientParam}` : '',
      });
    }
  }, [id, isEdit, dispatch, reset, searchParams]);

  async function onSubmit(data: FormData) {
    if (!isEdit && !file) {
      toastError('Veuillez sélectionner un fichier.');
      return;
    }

    if (file) {
      const fileError = validateFile(file);
      if (fileError) {
        toastError(fileError);
        return;
      }
    }

    const payload: DocumentWrite = {
      patient: data.patient,
      type: data.type,
      title: data.title || null,
    };

    if (file) {
      payload.base64Content = await fileToBase64(file);
      payload.originalName = file.name;
      payload.mimeType = file.type || 'application/octet-stream';
    }

    const result = isEdit && id
      ? await dispatch(documentsActions.updateOne({ id, data: payload }))
      : await dispatch(documentsActions.createOne(payload));

    if (documentsActions.createOne.fulfilled.match(result) || documentsActions.updateOne.fulfilled.match(result)) {
      toastSuccess(isEdit ? 'Document mis à jour.' : 'Document ajouté.');
      navigate('/documents');
    } else {
      toastError('Erreur.');
    }
  }

  return (
    <div>
      <PageHeader title={isEdit ? 'Modifier le document' : 'Nouveau document'}
        actions={<Button variant="ghost" size="sm" onClick={() => navigate(-1)} icon={<ArrowLeft className="h-4 w-4" />}>Retour</Button>}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-2xl space-y-5">
          <FormError error={error} />
          <Card>
            <CardBody>
              <FormSection title="Document">
                <FormGrid cols={2}>
                  <Select label="Patient *" {...register('patient')} options={[{ value: '', label: '—' }, ...patients.map((p) => ({ value: p['@id'], label: formatName(p.lastname, p.firstname) }))]} error={errors.patient?.message} />
                  <Select label="Type *" {...register('type')} options={TYPES.map((t) => ({ value: t, label: DOCUMENT_TYPE_LABELS[t] }))} error={errors.type?.message} />
                </FormGrid>
                <Input label="Titre" {...register('title')} placeholder="Ex: Ordonnance du 28/06/2026" />
                <Input
                  label={isEdit ? 'Remplacer le fichier' : 'Fichier *'}
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  hint={isEdit && currentFileName ? `Fichier actuel : ${currentFileName} (laisser vide pour le conserver)` : undefined}
                />
              </FormSection>
            </CardBody>
          </Card>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>Annuler</Button>
            <Button type="submit" loading={saving} icon={<Save className="h-4 w-4" />}>{isEdit ? 'Mettre à jour' : 'Ajouter'}</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
