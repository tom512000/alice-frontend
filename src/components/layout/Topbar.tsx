import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { logout } from '@/features/auth/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, ChevronRight, Menu, Search } from 'lucide-react';
import { cn } from '@/lib/cn';
import { PatientQuickSearch } from './PatientQuickSearch';

const ROUTE_LABELS: Record<string, string> = {
  '': 'Tableau de bord',
  forbidden: 'Accès refusé',
  // Général / clinique
  patients: 'Patients',
  appointments: 'Planning',
  'org-chart': 'Organigramme',
  consultations: 'Consultations',
  stays: 'Hospitalisations',
  beds: 'Chambres & lits',
  observations: 'Soins infirmiers',
  'vital-signs': 'Constantes vitales',
  takes: 'Prises de traitement',
  // Médical
  diagnoses: 'Diagnostics',
  'medical-exams': 'Examens médicaux',
  'medical-histories': 'Antécédents médicaux',
  prescriptions: 'Prescriptions',
  treatments: 'Traitements',
  'surgical-operations': 'Bloc opératoire',
  documents: 'Documents',
  comments: 'Commentaires',
  consents: 'Consentements',
  // Compte
  settings: 'Paramètres',
  security: 'Sécurité (2FA)',
  // Administration
  admin: 'Administration',
  users: 'Utilisateurs',
  audit: "Journal d'audit",
  'room-plan': 'Plan des chambres',
  services: 'Services',
  specialties: 'Spécialités',
  medicines: 'Médicaments',
  pathologies: 'Pathologies',
  allergies: 'Allergies',
  holidays: 'Congés',
  'treat-people': 'Personnes traitées',
  // Actions
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

export function Topbar({ sidebarWidth, onMenuClick }: { sidebarWidth: number; onMenuClick: () => void }) {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  function handleLogout() {
    dispatch(logout());
    navigate('/login');
  }

  return (
    <>
      <header
        className="fixed top-0 right-0 left-0 z-20 h-14 bg-white border-b border-gray-200 flex items-center justify-between gap-3 px-3 sm:px-5 transition-all duration-200 lg:left-[var(--sidebar-w)]"
        style={{ '--sidebar-w': `${sidebarWidth}px` } as React.CSSProperties}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Breadcrumbs />
        </div>

        <div className="hidden flex-1 justify-center px-2 sm:flex">
          <PatientQuickSearch />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => setMobileSearchOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 sm:hidden"
            aria-label="Rechercher un patient"
          >
            <Search className="h-4.5 w-4.5" />
          </button>

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

      {mobileSearchOpen && (
        <div className="fixed top-14 inset-x-0 z-30 border-b border-gray-200 bg-white shadow-sm sm:hidden">
          <PatientQuickSearch variant="mobile-overlay" onClose={() => setMobileSearchOpen(false)} />
        </div>
      )}
    </>
  );
}
