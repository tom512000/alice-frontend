import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { logout } from '@/features/auth/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

const ROUTE_LABELS: Record<string, string> = {
  '': 'Tableau de bord',
  patients: 'Patients',
  appointments: 'Planning',
  consultations: 'Consultations',
  stays: 'Hospitalisations',
  observations: 'Soins infirmiers',
  'vital-signs': 'Constantes vitales',
  diagnoses: 'Diagnostics',
  'medical-exams': 'Examens médicaux',
  prescriptions: 'Prescriptions',
  'surgical-operations': 'Bloc opératoire',
  admin: 'Administration',
  users: 'Utilisateurs',
  services: 'Services',
  medicines: 'Médicaments',
  pathologies: 'Pathologies',
  allergies: 'Allergies',
  new: 'Nouveau',
  edit: 'Modifier',
};

function Breadcrumbs() {
  const location = useLocation();
  const parts = location.pathname.split('/').filter(Boolean);

  if (parts.length === 0) {
    return <span className="font-lexend text-sm font-semibold text-gray-900">Tableau de bord</span>;
  }

  return (
    <nav className="flex items-center gap-1 text-sm font-poppins">
      {parts.map((part, i) => {
        const label = ROUTE_LABELS[part] ?? (isNaN(Number(part)) ? part : `#${part}`);
        const isLast = i === parts.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
            <span className={cn(isLast ? 'font-medium text-gray-900' : 'text-gray-500')}>
              {label}
            </span>
          </span>
        );
      })}
    </nav>
  );
}

export function Topbar({ sidebarWidth }: { sidebarWidth: number }) {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  function handleLogout() {
    dispatch(logout());
    navigate('/login');
  }

  return (
    <header
      className="fixed top-0 right-0 z-20 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-5 transition-all duration-200"
      style={{ left: sidebarWidth }}
    >
      <Breadcrumbs />

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-poppins text-gray-700">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <User className="h-4 w-4" />
          </div>
          <span className="hidden sm:inline">{user?.login}</span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs font-poppins text-gray-500 hover:text-gray-800 transition-colors px-2 py-1.5 rounded-md hover:bg-gray-100"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>
    </header>
  );
}
