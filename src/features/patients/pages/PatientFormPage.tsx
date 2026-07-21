import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { patientsActions } from '../patientsSlice';
import { usersActions } from '@/features/users/usersSlice';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FormSection, FormGrid, FormError } from '@/components/forms/FormSection';
import { useToast } from '@/components/ui/Toast';
import { formatName, formatDateInput, IDENTITY_STATUS_LABELS } from '@/lib/format';
import { Save, ArrowLeft } from 'lucide-react';
import type { PatientWrite } from '@/types/entities';

const schema = z.object({
  lastname: z.string().min(1, 'Nom requis'),
  firstname: z.string().min(1, 'Prénom requis'),
  gender: z.enum(['M', 'F', 'O']).optional().nullable(),
  birthdate: z.string().optional().nullable(),
  nss: z.string().regex(/^\d{13}$/, 'NSS : 13 chiffres').optional().nullable().or(z.literal('')),
  insMatricule: z.string().regex(/^\d{15}$/, 'Matricule INS : 15 chiffres').optional().nullable().or(z.literal('')),
  insOid: z.string().optional().nullable(),
  birthPlaceCode: z.string().optional().nullable(),
  identityStatus: z.enum(['provisional', 'retrieved', 'validated', 'qualified', 'doubtful']),
  bloodType: z.string().optional().nullable(),
  email: z.string().email('Email invalide').optional().nullable().or(z.literal('')),
  street: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  postalCode: z.string().regex(/^\d{5}$/, 'Code postal : 5 chiffres').optional().nullable().or(z.literal('')),
  phoneNumber: z.string().optional().nullable(),
  emergencyContactName: z.string().optional().nullable(),
  emergencyContactPhone: z.string().optional().nullable(),
  treatingDoctor: z.string().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

export function PatientFormPage() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { saving, error } = useAppSelector((s) => s.patients);
  const doctors = useAppSelector((s) => s.users.items);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { identityStatus: 'provisional' } });

  useEffect(() => {
    dispatch(usersActions.fetchList({ page: 1, itemsPerPage: 100 }));
    if (isEdit && id) {
      dispatch(patientsActions.fetchOne(id)).then((res) => {
        if (patientsActions.fetchOne.fulfilled.match(res)) {
          const p = res.payload;
          reset({
            lastname: p.lastname,
            firstname: p.firstname,
            gender: p.gender,
            birthdate: formatDateInput(p.birthdate),
            nss: p.nss ?? '',
            insMatricule: p.insMatricule ?? '',
            insOid: p.insOid ?? '',
            birthPlaceCode: p.birthPlaceCode ?? '',
            identityStatus: p.identityStatus ?? 'provisional',
            bloodType: p.bloodType ?? '',
            email: p.email ?? '',
            street: p.street ?? '',
            city: p.city ?? '',
            postalCode: p.postalCode ?? '',
            phoneNumber: p.phoneNumber ?? '',
            emergencyContactName: p.emergencyContactName ?? '',
            emergencyContactPhone: p.emergencyContactPhone ?? '',
            treatingDoctor: p.treatingDoctor ? p.treatingDoctor['@id'] : '',
          });
        }
      });
    }
  }, [id, isEdit, dispatch, reset]);

  async function onSubmit(data: FormData) {
    const payload: PatientWrite = {
      lastname: data.lastname,
      firstname: data.firstname,
      gender: data.gender || null,
      birthdate: data.birthdate || null,
      nss: data.nss || null,
      insMatricule: data.insMatricule || null,
      insOid: data.insOid || null,
      birthPlaceCode: data.birthPlaceCode || null,
      identityStatus: data.identityStatus,
      bloodType: data.bloodType || null,
      email: data.email || null,
      street: data.street || null,
      city: data.city || null,
      postalCode: data.postalCode || null,
      phoneNumber: data.phoneNumber || null,
      emergencyContactName: data.emergencyContactName || null,
      emergencyContactPhone: data.emergencyContactPhone || null,
      treatingDoctor: data.treatingDoctor || null,
    };

    let result;
    if (isEdit && id) {
      result = await dispatch(patientsActions.updateOne({ id, data: payload }));
    } else {
      result = await dispatch(patientsActions.createOne(payload));
    }

    if (patientsActions.createOne.fulfilled.match(result) || patientsActions.updateOne.fulfilled.match(result)) {
      toastSuccess(isEdit ? 'Patient mis à jour.' : 'Patient créé.');
      const createdId = result.payload.id;
      navigate(`/patients/${createdId}`);
    } else {
      toastError('Une erreur est survenue.');
    }
  }

  const doctorOptions = [
    { value: '', label: '— Aucun —' },
    ...doctors.map((d) => ({ value: d['@id'], label: formatName(d.lastname, d.firstname) })),
  ];

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Modifier le patient' : 'Nouveau patient'}
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} icon={<ArrowLeft className="h-4 w-4" />}>
            Retour
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-5 max-w-3xl">
          <FormError error={error} />

          <Card>
            <CardBody>
              <FormSection title="Identité">
                <FormGrid cols={2}>
                  <Input label="Nom" {...register('lastname')} error={errors.lastname?.message} />
                  <Input label="Prénom" {...register('firstname')} error={errors.firstname?.message} />
                </FormGrid>
                <FormGrid cols={3}>
                  <Select
                    label="Genre"
                    {...register('gender')}
                    options={[
                      { value: 'M', label: 'Homme' },
                      { value: 'F', label: 'Femme' },
                      { value: 'O', label: 'Autre' },
                    ]}
                    placeholder="— Genre —"
                    error={errors.gender?.message}
                  />
                  <Input label="Date de naissance" type="date" {...register('birthdate')} error={errors.birthdate?.message} />
                  <Select
                    label="Groupe sanguin"
                    {...register('bloodType')}
                    options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => ({ value: b, label: b }))}
                    placeholder="— Groupe —"
                    error={errors.bloodType?.message}
                  />
                </FormGrid>
                <FormGrid cols={2}>
                  <Input label="NSS (13 chiffres)" {...register('nss')} error={errors.nss?.message} placeholder="1 23 45 678 901 23" />
                  <Select
                    label="Médecin traitant"
                    {...register('treatingDoctor')}
                    options={doctorOptions}
                    error={errors.treatingDoctor?.message}
                  />
                </FormGrid>
              </FormSection>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <FormSection title="Identité Nationale de Santé (INS)">
                <FormGrid cols={2}>
                  <Input label="Matricule INS (15 chiffres)" {...register('insMatricule')} error={errors.insMatricule?.message} placeholder="2 55 08 14 168 025 38" />
                  <Select
                    label="Statut d'identité"
                    {...register('identityStatus')}
                    options={Object.entries(IDENTITY_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
                    error={errors.identityStatus?.message}
                  />
                </FormGrid>
                <FormGrid cols={2}>
                  <Input label="OID autorité d'affectation" {...register('insOid')} placeholder="1.2.250.1.213.1.4.8" />
                  <Input label="Code INSEE lieu de naissance" {...register('birthPlaceCode')} placeholder="75056" />
                </FormGrid>
              </FormSection>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <FormSection title="Contact">
                <FormGrid cols={2}>
                  <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
                  <Input label="Téléphone" {...register('phoneNumber')} error={errors.phoneNumber?.message} />
                </FormGrid>
                <Input label="Adresse" {...register('street')} error={errors.street?.message} />
                <FormGrid cols={2}>
                  <Input label="Ville" {...register('city')} error={errors.city?.message} />
                  <Input label="Code postal" {...register('postalCode')} error={errors.postalCode?.message} placeholder="75001" />
                </FormGrid>
              </FormSection>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <FormSection title="Contact d'urgence">
                <FormGrid cols={2}>
                  <Input label="Nom du contact" {...register('emergencyContactName')} />
                  <Input label="Téléphone d'urgence" {...register('emergencyContactPhone')} />
                </FormGrid>
              </FormSection>
            </CardBody>
          </Card>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>
              Annuler
            </Button>
            <Button type="submit" loading={saving} icon={<Save className="h-4 w-4" />}>
              {isEdit ? 'Mettre à jour' : 'Créer le patient'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
