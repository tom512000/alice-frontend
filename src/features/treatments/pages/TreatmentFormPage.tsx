import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { treatmentsActions } from '../treatmentsSlice';
import { medicinesActions } from '@/features/medicines/medicinesSlice';
import { pathologiesActions } from '@/features/pathologies/pathologiesSlice';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FormSection, FormError } from '@/components/forms/FormSection';
import { useToast } from '@/components/ui/Toast';
import { Save, ArrowLeft, X } from 'lucide-react';
import type { MedicineRead, PathologyRead } from '@/types/entities';

const schema = z.object({
  name: z.string().min(1, 'Nom requis'),
  posology: z.string().optional().nullable(),
  numberOfIntakes: z.coerce.number().int().positive().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

export function TreatmentFormPage() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { saving, error } = useAppSelector((s) => s.treatments);
  const allMedicines = useAppSelector((s) => s.medicines.items);
  const allPathologies = useAppSelector((s) => s.pathologies.items);
  const [selectedMedicines, setSelectedMedicines] = useState<MedicineRead[]>([]);
  const [selectedPathologies, setSelectedPathologies] = useState<PathologyRead[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) as any });

  useEffect(() => {
    dispatch(medicinesActions.fetchList({ page: 1, itemsPerPage: 100 }));
    dispatch(pathologiesActions.fetchList({ page: 1, itemsPerPage: 100 }));
    if (isEdit && id) {
      dispatch(treatmentsActions.fetchOne(id)).then((res) => {
        if (treatmentsActions.fetchOne.fulfilled.match(res)) {
          const t = res.payload;
          reset({ name: t.name, posology: t.posology ?? '', numberOfIntakes: t.numberOfIntakes });
          setSelectedMedicines((t.medicines ?? []) as MedicineRead[]);
          setSelectedPathologies((t.pathologies ?? []) as PathologyRead[]);
        }
      });
    }
  }, [id, isEdit, dispatch, reset]);

  async function onSubmit(data: FormData) {
    const payload = {
      name: data.name,
      posology: data.posology || null,
      numberOfIntakes: data.numberOfIntakes || null,
      medicines: selectedMedicines.map((m) => m['@id']),
      pathologies: selectedPathologies.map((p) => p['@id']),
    };
    const result = isEdit && id
      ? await dispatch(treatmentsActions.updateOne({ id, data: payload }))
      : await dispatch(treatmentsActions.createOne(payload));

    if (treatmentsActions.createOne.fulfilled.match(result) || treatmentsActions.updateOne.fulfilled.match(result)) {
      toastSuccess(isEdit ? 'Traitement mis à jour.' : 'Traitement créé.');
      navigate('/treatments');
    } else {
      toastError('Erreur.');
    }
  }

  return (
    <div>
      <PageHeader title={isEdit ? 'Modifier le traitement' : 'Nouveau traitement'}
        actions={<Button variant="ghost" size="sm" onClick={() => navigate(-1)} icon={<ArrowLeft className="h-4 w-4" />}>Retour</Button>}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-2xl space-y-5">
          <FormError error={error} />
          <Card>
            <CardBody>
              <FormSection title="Traitement">
                <Input label="Nom *" {...register('name')} error={errors.name?.message} />
                <Input label="Posologie" {...register('posology')} placeholder="ex: 1 comprimé matin et soir" />
                <Input label="Nombre de prises" type="number" {...register('numberOfIntakes')} />
              </FormSection>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <FormSection title="Médicaments associés">
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  onChange={(e) => { const m = allMedicines.find((m) => m['@id'] === e.target.value); if (m && !selectedMedicines.some((sm) => sm['@id'] === m['@id'])) setSelectedMedicines((prev) => [...prev, m]); e.target.value = ''; }} defaultValue="">
                  <option value="">— Ajouter un médicament —</option>
                  {allMedicines.filter((m) => !selectedMedicines.some((sm) => sm['@id'] === m['@id'])).map((m) => <option key={m['@id']} value={m['@id']}>{m.name}</option>)}
                </select>
                <ul className="mt-2 space-y-1">
                  {selectedMedicines.map((m) => (
                    <li key={m['@id']} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                      <span className="text-sm">{m.name}</span>
                      <button type="button" onClick={() => setSelectedMedicines((prev) => prev.filter((sm) => sm['@id'] !== m['@id']))}><X className="h-4 w-4 text-gray-400 hover:text-red-500" /></button>
                    </li>
                  ))}
                </ul>
              </FormSection>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <FormSection title="Pathologies associées">
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  onChange={(e) => { const p = allPathologies.find((p) => p['@id'] === e.target.value); if (p && !selectedPathologies.some((sp) => sp['@id'] === p['@id'])) setSelectedPathologies((prev) => [...prev, p]); e.target.value = ''; }} defaultValue="">
                  <option value="">— Ajouter une pathologie —</option>
                  {allPathologies.filter((p) => !selectedPathologies.some((sp) => sp['@id'] === p['@id'])).map((p) => <option key={p['@id']} value={p['@id']}>{p.name}</option>)}
                </select>
                <ul className="mt-2 space-y-1">
                  {selectedPathologies.map((p) => (
                    <li key={p['@id']} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                      <span className="text-sm">{p.name}</span>
                      <button type="button" onClick={() => setSelectedPathologies((prev) => prev.filter((sp) => sp['@id'] !== p['@id']))}><X className="h-4 w-4 text-gray-400 hover:text-red-500" /></button>
                    </li>
                  ))}
                </ul>
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
