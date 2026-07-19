import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { type DateClickArg, type EventResizeDoneArg } from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import type { EventClickArg, EventDropArg, DatesSetArg } from '@fullcalendar/core';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { appointmentsActions } from '../appointmentsSlice';
import { PageHeader } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatName } from '@/lib/format';
import { canWrite as canWriteAppointments } from '@/lib/permissions';
import { Plus, Trash2 } from 'lucide-react';
import type { AppointmentRead } from '@/types/entities';

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  scheduled: { bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8' },
  completed: { bg: '#f0fdf4', border: '#22c55e', text: '#15803d' },
  cancelled: { bg: '#fef2f2', border: '#ef4444', text: '#b91c1c' },
  no_show: { bg: '#fffbeb', border: '#f59e0b', text: '#b45309' },
};

export function AppointmentListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { items, loading } = useAppSelector((s) => s.appointments);
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);
  const canWrite = canWriteAppointments(roles);

  const [statusFilter, setStatusFilter] = useState('');
  const [viewRange, setViewRange] = useState<{ start: string; end: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AppointmentRead | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load(start: string, end: string, status = statusFilter) {
    dispatch(appointmentsActions.fetchList({
      page: 1,
      itemsPerPage: 100,
      'scheduledAt[after]': start,
      'scheduledAt[before]': end,
      ...(status && { status }),
      order: { scheduledAt: 'asc' },
    }));
  }

  function handleDatesSet(arg: DatesSetArg) {
    const start = arg.start.toISOString();
    const end = arg.end.toISOString();
    setViewRange({ start, end });
    load(start, end);
  }

  function handleStatusChange(status: string) {
    setStatusFilter(status);
    if (viewRange) load(viewRange.start, viewRange.end, status);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await dispatch(appointmentsActions.deleteOne(deleteTarget.id));
    setDeleting(false);
    setDeleteTarget(null);
    if (appointmentsActions.deleteOne.fulfilled.match(res)) {
      toastSuccess('Rendez-vous supprimé.');
    } else {
      toastError('Suppression impossible.');
    }
  }

  async function handleEventDrop(info: EventDropArg) {
    const appt = info.event.extendedProps.appointment as AppointmentRead;
    const newStart = info.event.start;
    if (!newStart) {
      info.revert();
      return;
    }
    const res = await dispatch(appointmentsActions.patchOne({ id: appt.id, data: { scheduledAt: newStart.toISOString() } }));
    if (appointmentsActions.patchOne.fulfilled.match(res)) {
      toastSuccess('Rendez-vous reprogrammé.');
    } else {
      toastError('Impossible de reprogrammer ce rendez-vous.');
      info.revert();
    }
  }

  async function handleEventResize(info: EventResizeDoneArg) {
    const appt = info.event.extendedProps.appointment as AppointmentRead;
    const { start, end } = info.event;
    if (!start || !end) {
      info.revert();
      return;
    }
    const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
    const res = await dispatch(appointmentsActions.patchOne({ id: appt.id, data: { durationMinutes } }));
    if (appointmentsActions.patchOne.fulfilled.match(res)) {
      toastSuccess('Durée mise à jour.');
    } else {
      toastError('Impossible de modifier la durée.');
      info.revert();
    }
  }

  function handleEventClick(arg: EventClickArg) {
    const appt = arg.event.extendedProps.appointment as AppointmentRead;
    navigate(`/appointments/${appt.id}/edit`);
  }

  function handleDateClick(arg: DateClickArg) {
    if (!canWrite) return;
    navigate(`/appointments/new?scheduledAt=${encodeURIComponent(arg.dateStr)}`);
  }

  const events = useMemo(
    () =>
      items.map((a) => {
        const colors = STATUS_COLORS[a.status] ?? STATUS_COLORS.scheduled;
        const end = a.durationMinutes
          ? new Date(new Date(a.scheduledAt).getTime() + a.durationMinutes * 60000).toISOString()
          : undefined;
        return {
          id: String(a.id),
          title: [formatName(a.patient?.lastname, a.patient?.firstname), a.reason].filter(Boolean).join(' — '),
          start: a.scheduledAt,
          end,
          backgroundColor: colors.bg,
          borderColor: colors.border,
          textColor: colors.text,
          extendedProps: { appointment: a },
        };
      }),
    [items]
  );

  return (
    <div>
      <PageHeader
        title="Planning & Rendez-vous"
        subtitle={`${items.length} rendez-vous affichés`}
        actions={
          canWrite && (
            <Button size="sm" onClick={() => navigate('/appointments/new')} icon={<Plus className="h-4 w-4" />}>
              Nouveau RDV
            </Button>
          )
        }
      />

      <div className="flex items-center gap-3 mb-4">
        <Select
          options={[
            { value: 'scheduled', label: 'Planifié' },
            { value: 'completed', label: 'Terminé' },
            { value: 'cancelled', label: 'Annulé' },
            { value: 'no_show', label: 'Absent' },
          ]}
          placeholder="Tous les statuts"
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="w-48"
        />
        {loading && <span className="text-xs text-gray-400 font-poppins">Chargement…</span>}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm [&_.fc]:font-poppins">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          locale={frLocale}
          height="auto"
          nowIndicator
          slotMinTime="07:00:00"
          slotMaxTime="20:00:00"
          events={events}
          editable={canWrite}
          eventStartEditable={canWrite}
          eventDurationEditable={canWrite}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          dateClick={handleDateClick}
          datesSet={handleDatesSet}
          eventContent={(arg) => {
            const appt = arg.event.extendedProps.appointment as AppointmentRead;
            return (
              <div className="flex items-center justify-between gap-1 w-full overflow-hidden px-0.5">
                <span className="truncate">
                  {arg.timeText && <span className="font-semibold">{arg.timeText} </span>}
                  {arg.event.title}
                </span>
                {canWrite && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(appt);
                    }}
                    className="shrink-0 opacity-60 hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          }}
        />
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message="Supprimer ce rendez-vous ?"
      />
    </div>
  );
}
