import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { roomsActions } from '../roomsSlice';
import { bedsActions } from '../bedsSlice';
import { staysActions } from '@/features/stays/staysSlice';
import { servicesActions } from '@/features/services/servicesSlice';
import { patientsActions } from '@/features/patients/patientsSlice';
import { PageHeader } from '@/components/layout/Layout';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatName, formatDate } from '@/lib/format';
import { canWrite, canWriteNursing } from '@/lib/permissions';
import { BedDouble } from 'lucide-react';
import type { BedRead, BedStatus } from '@/types/entities';

const STATUS_STYLES: Record<string, string> = {
  free: 'border-gray-300 bg-white text-gray-500 hover:border-gray-400',
  reserved: 'border-amber-400 bg-amber-50 text-amber-800 hover:bg-amber-100',
  occupied: 'border-red-400 bg-red-50 text-red-800 hover:bg-red-100',
};

const STATUS_LABELS: Record<string, string> = {
  free: 'Libre',
  reserved: 'Réservé',
  occupied: 'Occupé',
};

export function BedBoardPage() {
  const dispatch = useAppDispatch();
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);
  const canAct = canWriteNursing(roles);
  const services = useAppSelector((s) => s.services.items);
  const rooms = useAppSelector((s) => s.rooms.items);
  const beds = useAppSelector((s) => s.beds.items) as BedRead[];

  const [serviceId, setServiceId] = useState('');
  const [selectedBed, setSelectedBed] = useState<BedRead | null>(null);

  // Sélectionne le premier service par défaut sans passer par un effet : valeur
  // dérivée à chaque rendu tant que l'utilisateur n'a rien choisi explicitement.
  const effectiveServiceId = serviceId || services[0]?.['@id'] || '';

  useEffect(() => {
    dispatch(servicesActions.fetchList({ page: 1, itemsPerPage: 100 }));
    dispatch(patientsActions.fetchList({ page: 1, itemsPerPage: 100 }));
  }, [dispatch]);

  function loadBoard() {
    if (!effectiveServiceId) return;
    dispatch(roomsActions.fetchList({ page: 1, itemsPerPage: 100, service: effectiveServiceId }));
    dispatch(bedsActions.fetchList({ page: 1, itemsPerPage: 200, 'room.service': effectiveServiceId }));
  }

  useEffect(loadBoard, [dispatch, effectiveServiceId]);

  const bedsByRoom = useMemo(() => {
    const map = new Map<string, BedRead[]>();
    for (const bed of beds) {
      const roomIri = typeof bed.room === 'string' ? bed.room : bed.room['@id'];
      if (!map.has(roomIri)) map.set(roomIri, []);
      map.get(roomIri)!.push(bed);
    }
    return map;
  }, [beds]);

  const counts = useMemo(() => {
    const c = { free: 0, reserved: 0, occupied: 0 };
    for (const bed of beds) c[bed.status as BedStatus]++;
    return c;
  }, [beds]);

  return (
    <div>
      <PageHeader
        title="Chambres & lits"
        subtitle={`${counts.occupied} occupé(s) · ${counts.reserved} réservé(s) · ${counts.free} libre(s)`}
      />

      <div className="mb-4 flex items-end gap-4">
        <div className="w-64">
          <Select
            label="Service (bloc)"
            value={effectiveServiceId}
            onChange={(e) => setServiceId(e.target.value)}
            options={services.map((s) => ({ value: s['@id'], label: s.serviceName }))}
          />
        </div>
        <div className="flex items-center gap-3 pb-2 text-xs font-poppins text-gray-500">
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded border border-gray-300 bg-white" /> Libre</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded border border-amber-400 bg-amber-50" /> Réservé</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded border border-red-400 bg-red-50" /> Occupé</span>
        </div>
      </div>

      <div
        className="relative w-full overflow-auto rounded-lg border border-gray-200 bg-gray-50"
        style={{
          height: 600,
          backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {rooms.length === 0 && (
          <p className="p-6 text-sm text-gray-400 font-poppins">
            Aucune chambre configurée pour ce service. Un admin peut en créer depuis « Plan des chambres ».
          </p>
        )}
        {rooms.map((room) => (
          <div
            key={room.id}
            className="absolute rounded-lg border-2 border-gray-300 bg-white shadow-sm"
            style={{ left: room.positionX, top: room.positionY, width: room.width, height: room.height }}
          >
            <div className="truncate rounded-t-md border-b border-gray-200 bg-gray-100 px-2 py-1 text-xs font-semibold font-lexend text-gray-800">
              {room.name}
            </div>
            <div className="flex flex-wrap gap-1 overflow-auto p-2" style={{ maxHeight: room.height - 32 }}>
              {(bedsByRoom.get(room['@id']) ?? []).map((bed) => (
                <button
                  key={bed.id}
                  type="button"
                  onClick={() => setSelectedBed(bed)}
                  title={
                    bed.currentStay
                      ? `${formatName(bed.currentStay.patient.lastname, bed.currentStay.patient.firstname)} — depuis ${formatDate(bed.currentStay.startDate)}`
                      : 'Libre'
                  }
                  className={`flex h-9 w-9 flex-col items-center justify-center rounded border text-[10px] font-poppins transition-colors ${STATUS_STYLES[bed.status]}`}
                >
                  <BedDouble className="h-3.5 w-3.5" />
                  {bed.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedBed && (
        <BedActionModal
          bed={selectedBed}
          serviceId={effectiveServiceId}
          canAct={canAct}
          canCancelReservation={canWrite(roles)}
          onClose={() => setSelectedBed(null)}
          onDone={() => {
            setSelectedBed(null);
            loadBoard();
          }}
        />
      )}
    </div>
  );
}

interface BedActionModalProps {
  bed: BedRead;
  serviceId: string;
  canAct: boolean;
  canCancelReservation: boolean;
  onClose: () => void;
  onDone: () => void;
}

function BedActionModal({ bed, serviceId, canAct, canCancelReservation, onClose, onDone }: BedActionModalProps) {
  const dispatch = useAppDispatch();
  const { toastSuccess, toastError } = useToast();
  const patients = useAppSelector((s) => s.patients.items);
  const [patientId, setPatientId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [observation, setObservation] = useState('');
  const [busy, setBusy] = useState(false);

  const roomName = typeof bed.room === 'string' ? bed.room : bed.room.name;

  async function handleCreate() {
    if (!patientId) return;
    setBusy(true);
    const res = await dispatch(staysActions.createOne({
      patient: patientId,
      service: serviceId,
      bed: bed['@id'],
      startDate,
      observation: observation || null,
    }));
    setBusy(false);
    if (staysActions.createOne.fulfilled.match(res)) {
      toastSuccess(new Date(startDate) > new Date() ? 'Lit réservé.' : 'Lit occupé.');
      onDone();
    } else {
      toastError("Impossible d'affecter ce lit.");
    }
  }

  async function handleDischarge() {
    if (!bed.currentStay) return;
    setBusy(true);
    const res = await dispatch(staysActions.patchOne({
      id: bed.currentStay.id,
      data: { endDate: new Date().toISOString().split('T')[0] },
    }));
    setBusy(false);
    if (staysActions.patchOne.fulfilled.match(res)) {
      toastSuccess('Lit libéré.');
      onDone();
    } else {
      toastError('Impossible de libérer ce lit.');
    }
  }

  async function handleAdmitNow() {
    if (!bed.currentStay) return;
    setBusy(true);
    const res = await dispatch(staysActions.patchOne({
      id: bed.currentStay.id,
      data: { startDate: new Date().toISOString().split('T')[0] },
    }));
    setBusy(false);
    if (staysActions.patchOne.fulfilled.match(res)) {
      toastSuccess('Patient admis.');
      onDone();
    } else {
      toastError("Impossible d'admettre maintenant.");
    }
  }

  async function handleCancelReservation() {
    if (!bed.currentStay) return;
    setBusy(true);
    const res = await dispatch(staysActions.deleteOne(bed.currentStay.id));
    setBusy(false);
    if (staysActions.deleteOne.fulfilled.match(res)) {
      toastSuccess('Réservation annulée.');
      onDone();
    } else {
      toastError("Impossible d'annuler la réservation.");
    }
  }

  return (
    <Modal open onClose={onClose} title={`${roomName} — Lit ${bed.label} (${STATUS_LABELS[bed.status]})`} size="sm">
      {bed.status === 'free' && (
        <div className="space-y-3">
          {!canAct && <p className="text-sm text-gray-500 font-poppins">Lit libre.</p>}
          {canAct && (
            <>
              <Select
                label="Patient *"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                options={[{ value: '', label: '— Sélectionner —' }, ...patients.map((p) => ({ value: p['@id'], label: formatName(p.lastname, p.firstname) }))]}
              />
              <Input
                label="Date d'entrée *"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                hint="Une date future réserve le lit ; aujourd'hui ou passé l'occupe immédiatement."
              />
              <Textarea label="Observation" value={observation} onChange={(e) => setObservation(e.target.value)} rows={2} />
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={onClose}>Annuler</Button>
                <Button size="sm" onClick={handleCreate} loading={busy} disabled={!patientId}>
                  Valider
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {bed.status !== 'free' && bed.currentStay && (
        <div className="space-y-3">
          <p className="text-sm font-poppins text-gray-700">
            <span className="font-semibold">{formatName(bed.currentStay.patient.lastname, bed.currentStay.patient.firstname)}</span>
            <br />
            {bed.status === 'occupied' ? 'Depuis' : 'Prévu le'} {formatDate(bed.currentStay.startDate)}
          </p>
          {canAct && (
            <div className="flex flex-wrap justify-end gap-2 pt-1">
              {bed.status === 'reserved' && canCancelReservation && (
                <Button variant="outline" size="sm" onClick={handleCancelReservation} loading={busy}>
                  Annuler la réservation
                </Button>
              )}
              {bed.status === 'reserved' && (
                <Button size="sm" onClick={handleAdmitNow} loading={busy}>
                  Admettre maintenant
                </Button>
              )}
              {bed.status === 'occupied' && (
                <Button variant="danger" size="sm" onClick={handleDischarge} loading={busy}>
                  Libérer le lit
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
