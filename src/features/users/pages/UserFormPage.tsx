import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { usersActions } from '../usersSlice';
import { servicesActions } from '@/features/services/servicesSlice';
import { specialtiesActions } from '@/features/specialties/specialtiesSlice';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FormSection, FormGrid, FormError } from '@/components/forms/FormSection';
import { useToast } from '@/components/ui/Toast';
import { Save, ArrowLeft } from 'lucide-react';

const schema = z.object({
  login: z.string().min(3, 'Login requis (min 3 caractères)'),
  firstname: z.string().min(1, 'Prénom requis'),
  lastname: z.string().min(1, 'Nom requis'),
  plainPassword: z.string().optional().nullable(),
  roleKey: z.string().min(1, 'Rôle requis'),
  service: z.string().optional().nullable(),
  specialty: z.string().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

export function UserFormPage() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { saving, error } = useAppSelector((s) => s.users);
  const services = useAppSelector((s) => s.services.items);
  const specialties = useAppSelector((s) => s.specialties.items);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { roleKey: 'ROLE_USER' } });

  useEffect(() => {
    dispatch(servicesActions.fetchList({ page: 1, itemsPerPage: 100 }));
    dispatch(specialtiesActions.fetchList({ page: 1, itemsPerPage: 100 }));
    if (isEdit && id) {
      dispatch(usersActions.fetchOne(id)).then((res) => {
        if (usersActions.fetchOne.fulfilled.match(res)) {
          const u = res.payload;
          const mainRole = u.roles.find((r) => r !== 'ROLE_USER') ?? 'ROLE_USER';
          reset({
            login: u.login,
            firstname: u.firstname,
            lastname: u.lastname,
            roleKey: mainRole,
            service: u.service ? (typeof u.service === 'string' ? u.service : u.service['@id']) : '',
            specialty: u.specialty ? (typeof u.specialty === 'string' ? u.specialty : u.specialty['@id']) : '',
          });
        }
      });
    }
  }, [id, isEdit, dispatch, reset]);

  async function onSubmit(data: FormData) {
    const roles = data.roleKey === 'ROLE_USER' ? ['ROLE_USER'] : [data.roleKey, 'ROLE_USER'];
    const payload: Record<string, unknown> = {
      login: data.login,
      firstname: data.firstname,
      lastname: data.lastname,
      roles,
      service: data.service || null,
      specialty: data.specialty || null,
    };
    if (data.plainPassword) payload.plainPassword = data.plainPassword;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = isEdit && id
      ? await dispatch(usersActions.updateOne({ id, data: payload as any }))
      : await dispatch(usersActions.createOne(payload as any));

    if (usersActions.createOne.fulfilled.match(result) || usersActions.updateOne.fulfilled.match(result)) {
      toastSuccess(isEdit ? 'Utilisateur mis à jour.' : 'Utilisateur créé.');
      navigate('/admin/users');
    } else {
      toastError('Erreur.');
    }
  }

  return (
    <div>
      <PageHeader title={isEdit ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        actions={<Button variant="ghost" size="sm" onClick={() => navigate(-1)} icon={<ArrowLeft className="h-4 w-4" />}>Retour</Button>}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-2xl space-y-5">
          <FormError error={error} />
          <Card>
            <CardBody>
              <FormSection title="Identité">
                <FormGrid cols={2}>
                  <Input label="Nom *" {...register('lastname')} error={errors.lastname?.message} />
                  <Input label="Prénom *" {...register('firstname')} error={errors.firstname?.message} />
                </FormGrid>
                <FormGrid cols={2}>
                  <Input label="Login *" {...register('login')} error={errors.login?.message} autoComplete="username" />
                  <Input label={isEdit ? 'Nouveau mot de passe' : 'Mot de passe *'} type="password" {...register('plainPassword')} autoComplete="new-password" />
                </FormGrid>
              </FormSection>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <FormSection title="Rôle & affectation">
                <Select label="Rôle principal *" {...register('roleKey')} options={[{ value: 'ROLE_ADMIN', label: 'Administrateur' }, { value: 'ROLE_DOCTOR', label: 'Médecin' }, { value: 'ROLE_NURSE', label: 'Infirmier(ère)' }, { value: 'ROLE_USER', label: 'Utilisateur standard' }]} error={errors.roleKey?.message} />
                <FormGrid cols={2}>
                  <Select label="Service" {...register('service')} options={[{ value: '', label: '— Aucun —' }, ...services.map((s) => ({ value: s['@id'], label: s.serviceName }))]} />
                  <Select label="Spécialité" {...register('specialty')} options={[{ value: '', label: '— Aucune —' }, ...specialties.map((s) => ({ value: s['@id'], label: s.name }))]} />
                </FormGrid>
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
