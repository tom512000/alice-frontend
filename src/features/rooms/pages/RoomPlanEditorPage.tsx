import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { roomsActions } from '../roomsSlice';
import { bedsActions } from '../bedsSlice';
import { servicesActions } from '@/features/services/servicesSlice';
import { PageHeader } from '@/components/layout/Layout';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Plus, Trash2, X } from 'lucide-react';
import type { RoomRead, BedRead } from '@/types/entities';

const MIN_WIDTH = 120;
const MIN_HEIGHT = 90;

export function RoomPlanEditorPage() {
  const dispatch = useAppDispatch();
  const { toastSuccess, toastError } = useToast();
  const services = useAppSelector((s) => s.services.items);
  const rooms = useAppSelector((s) => s.rooms.items);
  const beds = useAppSelector((s) => s.beds.items);

  const [serviceId, setServiceId] = useState('');
  const [deleteRoomTarget, setDeleteRoomTarget] = useState<RoomRead | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Sélectionne le premier service par défaut sans passer par un effet : valeur
  // dérivée à chaque rendu tant que l'utilisateur n'a rien choisi explicitement.
  const effectiveServiceId = serviceId || services[0]?.['@id'] || '';

  useEffect(() => {
    dispatch(servicesActions.fetchList({ page: 1, itemsPerPage: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (!effectiveServiceId) return;
    dispatch(roomsActions.fetchList({ page: 1, itemsPerPage: 100, service: effectiveServiceId }));
    dispatch(bedsActions.fetchList({ page: 1, itemsPerPage: 200, 'room.service': effectiveServiceId }));
  }, [dispatch, effectiveServiceId]);

  const bedsByRoom = useMemo(() => {
    const map = new Map<string, BedRead[]>();
    for (const bed of beds) {
      const roomIri = typeof bed.room === 'string' ? bed.room : bed.room['@id'];
      if (!map.has(roomIri)) map.set(roomIri, []);
      map.get(roomIri)!.push(bed);
    }
    return map;
  }, [beds]);

  async function handleAddRoom() {
    if (!effectiveServiceId) return;
    const res = await dispatch(roomsActions.createOne({
      name: `Chambre ${rooms.length + 1}`,
      service: effectiveServiceId,
      positionX: 20,
      positionY: 20,
      width: 160,
      height: 110,
    }));
    if (roomsActions.createOne.fulfilled.match(res)) {
      toastSuccess('Chambre ajoutée.');
    } else {
      toastError("Impossible d'ajouter la chambre.");
    }
  }

  async function handleMove(room: RoomRead, x: number, y: number) {
    await dispatch(roomsActions.patchOne({ id: room.id, data: { positionX: x, positionY: y } }));
  }

  async function handleResize(room: RoomRead, w: number, h: number) {
    await dispatch(roomsActions.patchOne({ id: room.id, data: { width: w, height: h } }));
  }

  async function handleRename(room: RoomRead, name: string) {
    if (!name.trim() || name === room.name) return;
    await dispatch(roomsActions.patchOne({ id: room.id, data: { name: name.trim() } }));
  }

  async function handleDeleteRoom() {
    if (!deleteRoomTarget) return;
    setDeleting(true);
    const res = await dispatch(roomsActions.deleteOne(deleteRoomTarget.id));
    setDeleting(false);
    setDeleteRoomTarget(null);
    if (roomsActions.deleteOne.fulfilled.match(res)) {
      toastSuccess('Chambre supprimée.');
    } else {
      toastError('Suppression impossible (une chambre avec des lits occupés ne peut pas être supprimée).');
    }
  }

  async function handleAddBed(room: RoomRead) {
    const existing = bedsByRoom.get(room['@id']) ?? [];
    const res = await dispatch(bedsActions.createOne({ label: String(existing.length + 1), room: room['@id'] }));
    if (!bedsActions.createOne.fulfilled.match(res)) {
      toastError("Impossible d'ajouter le lit.");
    }
  }

  async function handleDeleteBed(bed: BedRead) {
    const res = await dispatch(bedsActions.deleteOne(bed.id));
    if (!bedsActions.deleteOne.fulfilled.match(res)) {
      toastError('Suppression impossible (le lit est peut-être occupé ou réservé).');
    }
  }

  return (
    <div>
      <PageHeader
        title="Plan des chambres"
        subtitle="Glissez-déposez les chambres, redimensionnez-les, gérez leurs lits"
        actions={
          <Button size="sm" onClick={handleAddRoom} disabled={!effectiveServiceId} icon={<Plus className="h-4 w-4" />}>
            Nouvelle chambre
          </Button>
        }
      />

      <div className="mb-4 w-64">
        <Select
          label="Service (bloc)"
          value={effectiveServiceId}
          onChange={(e) => setServiceId(e.target.value)}
          options={services.map((s) => ({ value: s['@id'], label: s.serviceName }))}
        />
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
            Aucune chambre pour ce service. Cliquez sur « Nouvelle chambre » pour commencer le plan.
          </p>
        )}
        {rooms.map((room) => (
          <RoomBox
            key={room.id}
            room={room}
            beds={bedsByRoom.get(room['@id']) ?? []}
            onMove={handleMove}
            onResize={handleResize}
            onRename={handleRename}
            onDelete={() => setDeleteRoomTarget(room)}
            onAddBed={() => handleAddBed(room)}
            onDeleteBed={handleDeleteBed}
          />
        ))}
      </div>

      <ConfirmModal
        open={!!deleteRoomTarget}
        onClose={() => setDeleteRoomTarget(null)}
        onConfirm={handleDeleteRoom}
        loading={deleting}
        message={`Supprimer la chambre « ${deleteRoomTarget?.name} » et tous ses lits ?`}
      />
    </div>
  );
}

interface RoomBoxProps {
  room: RoomRead;
  beds: BedRead[];
  onMove: (room: RoomRead, x: number, y: number) => void;
  onResize: (room: RoomRead, w: number, h: number) => void;
  onRename: (room: RoomRead, name: string) => void;
  onDelete: () => void;
  onAddBed: () => void;
  onDeleteBed: (bed: BedRead) => void;
}

function RoomBox({ room, beds, onMove, onResize, onRename, onDelete, onAddBed, onDeleteBed }: RoomBoxProps) {
  // Position/taille "live" pendant un geste de glisser/redimensionner : null quand
  // inactif, auquel cas on affiche directement la valeur venant du serveur (room.*).
  // Ça évite de synchroniser un état local depuis les props via un effet.
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [dragSize, setDragSize] = useState<{ w: number; h: number } | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const dragStart = useRef({ mouseX: 0, mouseY: 0, x: 0, y: 0, w: 0, h: 0 });

  const pos = dragPos ?? { x: room.positionX, y: room.positionY };
  const size = dragSize ?? { w: room.width, h: room.height };
  const dragging = dragPos !== null;
  const resizing = dragSize !== null;

  useEffect(() => {
    if (!dragging) return;
    function onMouseMove(e: MouseEvent) {
      const dx = e.clientX - dragStart.current.mouseX;
      const dy = e.clientY - dragStart.current.mouseY;
      setDragPos({ x: Math.max(0, dragStart.current.x + dx), y: Math.max(0, dragStart.current.y + dy) });
    }
    function onMouseUp() {
      setDragPos((current) => {
        if (current) onMove(room, current.x, current.y);
        return null;
      });
    }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging, room, onMove]);

  useEffect(() => {
    if (!resizing) return;
    function onMouseMove(e: MouseEvent) {
      const dx = e.clientX - dragStart.current.mouseX;
      const dy = e.clientY - dragStart.current.mouseY;
      setDragSize({
        w: Math.max(MIN_WIDTH, dragStart.current.w + dx),
        h: Math.max(MIN_HEIGHT, dragStart.current.h + dy),
      });
    }
    function onMouseUp() {
      setDragSize((current) => {
        if (current) onResize(room, current.w, current.h);
        return null;
      });
    }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [resizing, room, onResize]);

  return (
    <div
      className="absolute rounded-lg border-2 border-gray-300 bg-white shadow-sm select-none"
      style={{ left: pos.x, top: pos.y, width: size.w, height: size.h, zIndex: dragging || resizing ? 20 : 1 }}
    >
      <div
        className="flex items-center justify-between gap-1 rounded-t-md border-b border-gray-200 bg-gray-100 px-2 py-1 cursor-move"
        onMouseDown={(e) => {
          if (editingName) return;
          dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, x: pos.x, y: pos.y, w: size.w, h: size.h };
          setDragPos({ x: pos.x, y: pos.y });
        }}
      >
        {editingName ? (
          <input
            autoFocus
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={() => {
              setEditingName(false);
              onRename(room, nameDraft);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="min-w-0 flex-1 rounded border border-gray-300 px-1 text-xs font-poppins"
          />
        ) : (
          <span
            className="flex-1 truncate text-xs font-semibold font-lexend text-gray-800"
            onDoubleClick={() => {
              setNameDraft(room.name);
              setEditingName(true);
            }}
            title="Double-cliquer pour renommer"
          >
            {room.name}
          </span>
        )}
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onDelete}
          className="shrink-0 text-gray-400 hover:text-red-600"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      <div className="flex flex-wrap gap-1 overflow-auto p-2" style={{ maxHeight: size.h - 32 }}>
        {beds.map((bed) => (
          <div
            key={bed.id}
            className="group relative flex h-7 w-7 items-center justify-center rounded border border-gray-300 bg-gray-50 text-[11px] font-poppins text-gray-700"
          >
            {bed.label}
            <button
              type="button"
              onClick={() => onDeleteBed(bed)}
              className="absolute -right-1 -top-1 hidden h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-white group-hover:flex"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={onAddBed}
          className="flex h-7 w-7 items-center justify-center rounded border border-dashed border-gray-300 text-gray-400 hover:border-gray-500 hover:text-gray-600"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, x: pos.x, y: pos.y, w: size.w, h: size.h };
          setDragSize({ w: size.w, h: size.h });
        }}
        className="absolute bottom-0 right-0 h-3 w-3 cursor-se-resize"
        style={{ background: 'linear-gradient(135deg, transparent 50%, #9ca3af 50%)' }}
      />
    </div>
  );
}
