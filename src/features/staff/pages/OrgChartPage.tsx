import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import { PageHeader } from '@/components/layout/Layout';
import { cn } from '@/lib/cn';
import { formatName } from '@/lib/format';
import {
  Hospital, ShieldCheck, Stethoscope, HeartPulse, User as UserIcon,
  Hash, Phone, Loader2, Building2, AlertCircle,
} from 'lucide-react';

interface StaffMember {
  id: number;
  firstname: string | null;
  lastname: string | null;
  roles: string[];
  number: string | null;
  phone: string | null;
  gender: string | null;
  service: { id: number; name: string } | null;
  specialty: { id: number; name: string } | null;
}

type RoleKey = 'ROLE_ADMIN' | 'ROLE_DOCTOR' | 'ROLE_NURSE' | 'ROLE_USER';

const ROLE_ORDER: RoleKey[] = ['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_NURSE', 'ROLE_USER'];

const ROLE_META: Record<RoleKey, {
  label: string;
  icon: typeof UserIcon;
  avatar: string;   // pastille initiales
  badge: string;    // badge rôle
}> = {
  ROLE_ADMIN: { label: 'Admin', icon: ShieldCheck, avatar: 'bg-indigo-100 text-indigo-700', badge: 'bg-indigo-50 text-indigo-700 border border-indigo-200' },
  ROLE_DOCTOR: { label: 'Médecin', icon: Stethoscope, avatar: 'bg-sky-100 text-sky-700', badge: 'bg-sky-50 text-sky-700 border border-sky-200' },
  ROLE_NURSE: { label: 'Infirmier', icon: HeartPulse, avatar: 'bg-emerald-100 text-emerald-700', badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  ROLE_USER: { label: 'Utilisateur', icon: UserIcon, avatar: 'bg-slate-100 text-slate-600', badge: 'bg-slate-50 text-slate-600 border border-slate-200' },
};

function topRole(roles: string[]): RoleKey {
  for (const r of ROLE_ORDER) if (roles.includes(r)) return r;
  return 'ROLE_USER';
}

function initials(m: StaffMember): string {
  const a = m.firstname?.[0] ?? '';
  const b = m.lastname?.[0] ?? '';
  return (a + b).toUpperCase() || '?';
}

interface Column {
  key: string;
  title: string;
  kind: 'admin' | 'service' | 'none';
  members: StaffMember[];
}

export function OrgChartPage() {
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    apiClient
      .get<StaffMember[]>(ENDPOINTS.STAFF_DIRECTORY)
      .then((res) => { if (alive) setMembers(res.data); })
      .catch(() => { if (alive) setError("Impossible de charger l'organigramme."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const columns = useMemo<Column[]>(() => {
    const byRole = (a: StaffMember, b: StaffMember) =>
      ROLE_ORDER.indexOf(topRole(a.roles)) - ROLE_ORDER.indexOf(topRole(b.roles)) ||
      formatName(a.lastname, a.firstname).localeCompare(formatName(b.lastname, b.firstname));

    const admins = members.filter((m) => topRole(m.roles) === 'ROLE_ADMIN').sort(byRole);
    const rest = members.filter((m) => topRole(m.roles) !== 'ROLE_ADMIN');

    // Regroupe le reste par service (ordre alphabétique), puis « Sans service ».
    const serviceMap = new Map<string, { id: number; members: StaffMember[] }>();
    const noService: StaffMember[] = [];
    for (const m of rest) {
      if (m.service) {
        const entry = serviceMap.get(m.service.name) ?? { id: m.service.id, members: [] };
        entry.members.push(m);
        serviceMap.set(m.service.name, entry);
      } else {
        noService.push(m);
      }
    }

    const cols: Column[] = [];
    if (admins.length) cols.push({ key: 'admin', title: 'Administration', kind: 'admin', members: admins });
    for (const name of [...serviceMap.keys()].sort((a, b) => a.localeCompare(b))) {
      cols.push({ key: `svc-${name}`, title: name, kind: 'service', members: serviceMap.get(name)!.members.sort(byRole) });
    }
    if (noService.length) cols.push({ key: 'none', title: 'Sans service', kind: 'none', members: noService.sort(byRole) });
    return cols;
  }, [members]);

  const servicesCount = columns.filter((c) => c.kind === 'service').length;

  return (
    <div>
      <PageHeader
        title="Organigramme"
        subtitle={`${members.length} membres du personnel · ${servicesCount} services`}
      />

      {/* Légende des rôles */}
      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
        {ROLE_ORDER.map((r) => {
          const meta = ROLE_META[r];
          const Icon = meta.icon;
          return (
            <span key={r} className="inline-flex items-center gap-1.5 text-xs font-poppins text-gray-600">
              <span className={cn('flex h-5 w-5 items-center justify-center rounded-full', meta.avatar)}>
                <Icon className="h-3 w-3" />
              </span>
              {meta.label}
            </span>
          );
        })}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-gray-500 font-poppins">
          <Loader2 className="h-5 w-5 animate-spin" /> Chargement de l'organigramme…
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-poppins">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto pb-4">
          <div className="inline-flex min-w-full flex-col items-center px-2">
            {/* Racine : l'établissement */}
            <div className="flex items-center gap-3 rounded-xl border border-gray-700 bg-gradient-to-br from-gray-900 to-gray-700 px-6 py-4 text-white shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
                <Hospital className="h-6 w-6" />
              </div>
              <div>
                <p className="font-lexend text-lg font-semibold leading-tight">Alice DPI</p>
                <p className="font-poppins text-xs text-gray-300">
                  {members.length} membres · {servicesCount} services
                </p>
              </div>
            </div>

            {/* Tige verticale sous la racine */}
            <div className="h-6 w-px bg-gray-300" />

            {/* Rangée des colonnes reliées par un « bus » horizontal */}
            <div className="flex items-start">
              {columns.map((col, i) => (
                <div key={col.key} className="flex w-64 flex-col items-center px-3">
                  {/* Connecteur : segment horizontal (bus) + tige verticale vers la carte */}
                  <div className="relative h-6 w-full">
                    {columns.length > 1 && (
                      <div
                        className={cn(
                          'absolute top-0 h-px bg-gray-300',
                          i === 0 ? 'left-1/2 right-0' : i === columns.length - 1 ? 'left-0 right-1/2' : 'left-0 right-0'
                        )}
                      />
                    )}
                    <div className="absolute left-1/2 top-0 h-6 w-px -translate-x-1/2 bg-gray-300" />
                  </div>

                  <DepartmentCard column={col} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DepartmentCard({ column }: { column: Column }) {
  const headerStyle =
    column.kind === 'admin'
      ? 'bg-indigo-600 text-white'
      : column.kind === 'none'
        ? 'bg-slate-500 text-white'
        : 'bg-sky-600 text-white';

  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className={cn('flex items-center justify-between gap-2 px-4 py-3', headerStyle)}>
        <div className="min-w-0">
          <p className="truncate font-lexend text-sm font-semibold leading-tight">{column.title}</p>
          <p className="font-poppins text-[11px] opacity-90">
            {column.members.length} membre{column.members.length > 1 ? 's' : ''}
          </p>
        </div>
        {column.kind === 'admin' ? <ShieldCheck className="h-5 w-5 shrink-0" /> : <Building2 className="h-5 w-5 shrink-0" />}
      </div>

      <div className="space-y-2 p-3">
        {column.members.length === 0 && (
          <p className="py-2 text-center text-xs text-gray-400 font-poppins">Aucun membre</p>
        )}
        {column.members.map((m) => (
          <MemberCard key={m.id} member={m} />
        ))}
      </div>
    </div>
  );
}

function MemberCard({ member }: { member: StaffMember }) {
  const role = topRole(member.roles);
  const meta = ROLE_META[role];

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/60 p-2.5 transition-colors hover:border-gray-200 hover:bg-gray-50">
      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold font-poppins', meta.avatar)}>
        {initials(member)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-poppins text-sm font-medium text-gray-900">
          {formatName(member.lastname, member.firstname)}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          <span className={cn('inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium font-poppins', meta.badge)}>
            {meta.label}
          </span>
          {member.specialty && (
            <span className="truncate text-[11px] text-gray-500 font-poppins">{member.specialty.name}</span>
          )}
        </div>
        {member.phone && (
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-500 font-poppins">
            <Phone className="h-3 w-3 shrink-0" /> {member.phone}
          </p>
        )}
        {member.number && (
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-500 font-poppins">
            <Hash className="h-3 w-3 shrink-0" /> {member.number}
          </p>
        )}
      </div>
    </div>
  );
}
