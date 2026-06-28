import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { Layout } from '@/components/layout/Layout';

export function PrivateRoute() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export function AdminRoute() {
  const user = useAppSelector((s) => s.auth.user);
  const isAdmin = user?.roles.includes('ROLE_ADMIN') ?? false;
  if (!isAdmin) return <Navigate to="/forbidden" replace />;
  return <Outlet />;
}

interface RoleGuardProps {
  roles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
  const user = useAppSelector((s) => s.auth.user);
  const userRoles = user?.roles ?? [];
  const allowed = roles.some((r) => userRoles.includes(r));
  return allowed ? <>{children}</> : <>{fallback}</>;
}
