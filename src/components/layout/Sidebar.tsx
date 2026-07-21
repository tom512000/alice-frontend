import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useAppSelector } from '@/app/hooks';
import { isAdmin, isDoctor } from '@/lib/permissions';
import {
  LayoutDashboard, Users, UserSquare2, Calendar, Stethoscope,
  BedDouble, HeartPulse, FlaskConical, ClipboardList, Pill,
  Scissors, Shield, ChevronRight, Hospital, Activity,
  FileText, MessageSquare, ClipboardCheck,
  FileCheck, ScrollText, LayoutGrid, X, Network,
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
        { to: '/org-chart', icon: <Network className="h-4 w-4" />, label: 'Organigramme' },
      ],
    },
    {
      label: 'Clinique',
      items: [
        { to: '/consultations', icon: <Stethoscope className="h-4 w-4" />, label: 'Consultations' },
        { to: '/stays', icon: <BedDouble className="h-4 w-4" />, label: 'Hospitalisations' },
        { to: '/beds', icon: <LayoutGrid className="h-4 w-4" />, label: 'Chambres & lits' },
        { to: '/observations', icon: <Activity className="h-4 w-4" />, label: 'Soins infirmiers' },
        { to: '/vital-signs', icon: <HeartPulse className="h-4 w-4" />, label: 'Constantes vitales' },
        { to: '/takes', icon: <ClipboardCheck className="h-4 w-4" />, label: 'Prises de traitement' },
      ],
    },
    {
      label: 'Médical',
      items: [
        { to: '/diagnoses', icon: <ClipboardList className="h-4 w-4" />, label: 'Diagnostics' },
        { to: '/medical-exams', icon: <FlaskConical className="h-4 w-4" />, label: 'Examens médicaux' },
        { to: '/prescriptions', icon: <Pill className="h-4 w-4" />, label: 'Prescriptions' },
        { to: '/surgical-operations', icon: <Scissors className="h-4 w-4" />, label: 'Bloc opératoire' },
        { to: '/documents', icon: <FileText className="h-4 w-4" />, label: 'Documents' },
        { to: '/comments', icon: <MessageSquare className="h-4 w-4" />, label: 'Commentaires' },
        { to: '/consents', icon: <FileCheck className="h-4 w-4" />, label: 'Consentements' },
      ],
    },
  ];

  if (isAdmin(roles) || isDoctor(roles)) {
    groups.push({
      label: 'Administration',
      items: [
        { to: '/admin/users', icon: <Users className="h-4 w-4" />, label: 'Utilisateurs', roles: ['ROLE_ADMIN'] },
        { to: '/admin/audit', icon: <ScrollText className="h-4 w-4" />, label: "Journal d'audit", roles: ['ROLE_ADMIN'] },
        { to: '/admin/room-plan', icon: <LayoutGrid className="h-4 w-4" />, label: 'Plan des chambres', roles: ['ROLE_ADMIN'] },
        { to: '/admin/services', icon: <Hospital className="h-4 w-4" />, label: 'Services' },
        { to: '/admin/medicines', icon: <Pill className="h-4 w-4" />, label: 'Médicaments' },
        { to: '/admin/pathologies', icon: <Shield className="h-4 w-4" />, label: 'Pathologies' },
        { to: '/admin/allergies', icon: <Shield className="h-4 w-4" />, label: 'Allergies' },
      ].filter((item) => !item.roles || item.roles.some((r) => roles.includes(r))),
    });
  }

  return groups;
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const user = useAppSelector((s) => s.auth.user);
  const roles = user?.roles ?? [];

  const groups = buildNav(roles);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-full bg-gray-950 text-white flex flex-col',
        'w-64 transition-transform duration-200 lg:w-auto lg:transition-[width] lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
        collapsed ? 'lg:w-14' : 'lg:w-56'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-gray-800 shrink-0">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10">
          <Activity className="h-4 w-4 text-white" />
        </div>
        <span className={cn('font-lexend font-semibold text-base text-white tracking-tight flex-1', collapsed && 'lg:hidden')}>
          Alice DPI
        </span>
        <button
          onClick={onMobileClose}
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Fermer le menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-5">
        {groups.map((group) => (
          <div key={group.label}>
            <p className={cn('px-2 mb-1.5 text-[10px] font-lexend font-semibold uppercase tracking-widest text-gray-500', collapsed && 'lg:hidden')}>
              {group.label}
            </p>
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
                  <span className={cn('truncate', collapsed && 'lg:hidden')}>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Toggle (collapse desktop uniquement — sur mobile le drawer est toujours en pleine largeur) */}
      <button
        onClick={onToggle}
        className="hidden items-center justify-center h-10 border-t border-gray-800 text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors lg:flex"
      >
        <ChevronRight className={cn('h-4 w-4 transition-transform', !collapsed && 'rotate-180')} />
      </button>
    </aside>
  );
}
