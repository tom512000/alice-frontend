import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MonitoringAlerts } from '@/features/monitoring/MonitoringAlerts';
import { PinnedVitals } from '@/features/monitoring/PinnedVitals';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarWidth = collapsed ? 56 : 224;
  const location = useLocation();

  // Ferme le drawer mobile à chaque navigation (ajustement pendant le rendu,
  // pas dans un effet, pour éviter un rendu en cascade superflu).
  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    setMobileOpen(false);
  }

  // En dessous du breakpoint `lg`, le sidebar est un drawer overlay : on le force fermé
  // dès qu'on franchit la limite (dans un sens ou l'autre) pour ne jamais le laisser
  // ouvert/épinglé pendant un redimensionnement (rotation d'écran, resize navigateur...).
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    const handleChange = () => setMobileOpen(false);
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50" style={{ '--sidebar-w': `${sidebarWidth}px` } as React.CSSProperties}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <Topbar sidebarWidth={sidebarWidth} onMenuClick={() => setMobileOpen(true)} />

      <main className="min-h-screen pt-14 transition-all duration-200 lg:ml-[var(--sidebar-w)]">
        <MonitoringAlerts />
        <div className="p-4 sm:p-6 max-w-[1400px] mx-auto lg:mx-0">
          {children}
        </div>
      </main>

      <PinnedVitals />
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
      <div className="min-w-0">
        <h1 className="font-lexend text-lg sm:text-xl font-semibold text-gray-900 truncate">{title}</h1>
        {subtitle && <div className="font-poppins text-sm text-gray-500 mt-0.5">{subtitle}</div>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
