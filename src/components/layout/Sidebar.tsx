import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useAppSelector } from '@/app/hooks';
import { isAdmin, isDoctor, isNurse } from '@/lib/permissions';
import {
  LayoutDashboard, Users, UserSquare2, Calendar, Stethoscope,
  BedDouble, HeartPulse, FlaskConical, ClipboardList, Pill,
  Scissors, Shield, ChevronRight, Hospital, Activity,
} from 'lucide-react';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  roles?: string[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

function buildNav(roles: string[]): NavGroup[] {
  const groups: NavGroup[] = [
    {
      label: 'Général',
      items: [
        { to: '/', icon: <LayoutDashboard className="h-4 w-4" />, label: 'Tableau de bord' },
        { to: '/patients', icon: <UserSquare2 className="h-4 w-4" />, label: 'Patients' },
        { to: '/appointments', icon: <Calendar className="h-4 w-4" />, label: 'Planning' },
      ],
    },
    {
      label: 'Clinique',
      items: [
        { to: '/consultations', icon: <Stethoscope className="h-4 w-4" />, label: 'Consultations' },
        { to: '/stays', icon: <BedDouble className="h-4 w-4" />, label: 'Hospitalisations' },
        { to: '/observations', icon: <Activity className="h-4 w-4" />, label: 'Soins infirmiers' },
        { to: '/vital-signs', icon: <HeartPulse className="h-4 w-4" />, label: 'Constantes vitales' },
      ],
    },
    {
      label: 'Médical',
      items: [
        { to: '/diagnoses', icon: <ClipboardList className="h-4 w-4" />, label: 'Diagnostics' },
        { to: '/medical-exams', icon: <FlaskConical className="h-4 w-4" />, label: 'Examens médicaux' },
        { to: '/prescriptions', icon: <Pill className="h-4 w-4" />, label: 'Prescriptions' },
        { to: '/surgical-operations', icon: <Scissors className="h-4 w-4" />, label: 'Bloc opératoire' },
      ],
    },
  ];

  if (isAdmin(roles) || isDoctor(roles)) {
    groups.push({
      label: 'Administration',
      items: [
        { to: '/admin/users', icon: <Users className="h-4 w-4" />, label: 'Utilisateurs', roles: ['ROLE_ADMIN'] },
        { to: '/admin/services', icon: <Hospital className="h-4 w-4" />, label: 'Services' },
        { to: '/admin/medicines', icon: <Pill className="h-4 w-4" />, label: 'Médicaments' },
        { to: '/admin/pathologies', icon: <Shield className="h-4 w-4" />, label: 'Pathologies' },
        { to: '/admin/allergies', icon: <Shield className="h-4 w-4" />, label: 'Allergies' },
      ].filter((item) => !item.roles || item.roles.some((r) => roles.includes(r))),
    });
  }

  return groups;
}

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const user = useAppSelector((s) => s.auth.user);
  const roles = user?.roles ?? [];

  const groups = buildNav(roles);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-30 h-full bg-gray-950 text-white flex flex-col transition-all duration-200',
        collapsed ? 'w-14' : 'w-56'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-gray-800 shrink-0">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10">
          <Activity className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-lexend font-semibold text-base text-white tracking-tight">Alice DPI</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-5">
        {groups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-2 mb-1.5 text-[10px] font-lexend font-semibold uppercase tracking-widest text-gray-500">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 rounded-md px-2 py-2 text-sm font-poppins transition-colors',
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                    )
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-10 border-t border-gray-800 text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
      >
        <ChevronRight className={cn('h-4 w-4 transition-transform', !collapsed && 'rotate-180')} />
      </button>
    </aside>
  );
}
