import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { roomsActions } from '../roomsSlice';
import { bedsActions } from '../bedsSlice';
import { servicesActions } from '@/features/services/servicesSlice';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { BedDouble, Check } from 'lucide-react';
import type { BedRead, RoomRead } from '@/types/entities';

interface RoomPickerModalProps {
  open: boolean;
  onClose: () => void;
  /** Appelé avec la salle retenue quand l'utilisateur valide. */
  onSelect: (room: RoomRead) => void;
  title?: string;
  /** Nom de la salle déjà retenue (pour la surligner à l'ouverture). */
  currentValue?: string | null;
  /** Ouvre le plan sur ce service (IRI) par défaut. Prioritaire sur preferBloc. */
  defaultServiceId?: string | null;
  /** Pré-sélectionne un service dont le nom évoque un bloc opératoire. */
  preferBloc?: boolean;
}

/**
 * Sélecteur visuel de salle : réutilise le même plan (salles positionnées +
 * lits) que « Chambres & lits » / « Plan des chambres », mais en mode choix —
 * on clique une salle pour la retenir. Pensé pour être branché sur n'importe
 * quel champ « salle » d'un formulaire (bloc opératoire, séjour, etc.).
 */
export function RoomPickerModal({
  open,
  onClose,
  onSelect,
  title = 'Choisir une salle',
  currentValue,
  defaultServiceId,
  preferBloc,
}: RoomPickerModalProps) {
  const dispatch = useAppDispatch();
  const services = useAppSelector((s) => s.services.items);
  const rooms = useAppSelector((s) => s.rooms.items) as RoomRead[];
  const beds = useAppSelector((s) => s.beds.items) as BedRead[];

  const [serviceId, setServiceId] = useState('');
  const [selectedRoomIri, setSelectedRoomIri] = useState<string | null>(null);

  // Service par défaut : celui fourni, sinon un « bloc opératoire » si demandé, sinon le premier.
  const fallbackServiceId = useMemo(() => {
    if (defaultServiceId) return defaultServiceId;
    if (preferBloc) {
      const bloc = services.find((s) => /bloc|op[eé]rat|chir/i.test(s.serviceName));
      if (bloc) return bloc['@id'];
    }
    return services[0]?.['@id'] ?? '';
  }, [services, preferBloc, defaultServiceId]);

  const effectiveServiceId = serviceId || fallbackServiceId;

  useEffect(() => {
    if (open) dispatch(servicesActions.fetchList({ page: 1, itemsPerPage: 100 }));
  }, [open, dispatch]);

  useEffect(() => {
    if (!open || !effectiveServiceId) return;
    dispatch(roomsActions.fetchList({ page: 1, itemsPerPage: 100, service: effectiveServiceId }));
    dispatch(bedsActions.fetchList({ page: 1, itemsPerPage: 200, 'room.service': effectiveServiceId }));
  }, [open, effectiveServiceId, dispatch]);

  // Réinitialise à la fermeture (ajustement pendant le rendu, pas dans un effet).
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) {
      setSelectedRoomIri(null);
      setServiceId('');
    }
  }

  // À l'ouverture, surligne la salle correspondant à la valeur courante.
  useEffect(() => {
    if (!open || !currentValue) return;
    const match = rooms.find((r) => r.name === currentValue);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (match) setSelectedRoomIri(match['@id']);
    // On ne veut réagir qu'à l'ouverture et à l'arrivée des salles, pas à chaque frappe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, rooms]);

  const bedsByRoom = useMemo(() => {
    const map = new Map<string, BedRead[]>();
    for (const bed of beds) {
      const roomIri = typeof bed.room === 'string' ? bed.room : bed.room['@id'];
      if (!map.has(roomIri)) map.set(roomIri, []);
      map.get(roomIri)!.push(bed);
    }
    return map;
  }, [beds]);

  const selectedRoom = rooms.find((r) => r['@id'] === selectedRoomIri) ?? null;

  function confirm() {
    if (selectedRoom) {
      onSelect(selectedRoom);
      onClose();
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title} size="4xl">
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div className="w-64">
            <Select
              label="Service (bloc)"
              value={effectiveServiceId}
              onChange={(e) => {
                setServiceId(e.target.value);
                setSelectedRoomIri(null);
              }}
              options={services.map((s) => ({ value: s['@id'], label: s.serviceName }))}
            />
          </div>
          <p className="pb-2 text-xs font-poppins text-gray-500">
            Cliquez une salle sur le plan pour la sélectionner.
          </p>
        </div>

        <div
          className="relative w-full overflow-auto rounded-lg border border-gray-200 bg-gray-50"
          style={{
            height: 440,
            backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        >
          {rooms.length === 0 && (
            <p className="p-6 text-sm text-gray-400 font-poppins">
              Aucune salle configurée pour ce service. Un admin peut en créer depuis « Plan des chambres ».
            </p>
          )}
          {rooms.map((room) => {
            const isSelected = room['@id'] === selectedRoomIri;
            return (
              <button
                key={room.id}
                type="button"
                onClick={() => setSelectedRoomIri(room['@id'])}
                onDoubleClick={() => {
                  onSelect(room);
                  onClose();
                }}
                className={`absolute rounded-lg border-2 bg-white text-left shadow-sm transition-colors ${isSelected
                  ? 'border-gray-900 ring-2 ring-gray-900/20'
                  : 'border-gray-300 hover:border-gray-500'
                  }`}
                style={{ left: room.positionX, top: room.positionY, width: room.width, height: room.height }}
              >
                <div
                  className={`flex items-center justify-between gap-1 truncate rounded-t-md border-b px-2 py-1 text-xs font-semibold font-lexend ${isSelected
                    ? 'border-gray-300 bg-gray-900 text-white'
                    : 'border-gray-200 bg-gray-100 text-gray-800'
                    }`}
                >
                  <span className="truncate">{room.name}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                </div>
                <div className="flex flex-wrap gap-1 overflow-hidden p-2" style={{ maxHeight: room.height - 32 }}>
                  {(bedsByRoom.get(room['@id']) ?? []).map((bed) => (
                    <span
                      key={bed.id}
                      className="flex h-8 w-8 flex-col items-center justify-center rounded border border-gray-200 bg-gray-50 text-[10px] font-poppins text-gray-400"
                    >
                      <BedDouble className="h-3 w-3" />
                      {bed.label}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-poppins text-gray-600">
            {selectedRoom ? (
              <>
                Salle : <span className="font-semibold text-gray-900">{selectedRoom.name}</span>
              </>
            ) : (
              'Aucune salle sélectionnée'
            )}
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Annuler
            </Button>
            <Button type="button" size="sm" icon={<Check className="h-4 w-4" />} disabled={!selectedRoom} onClick={confirm}>
              Sélectionner
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
