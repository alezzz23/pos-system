import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { hasRouteAccess, defaultRouteByRole } from '@/lib/permissions';
import type { ReactNode } from 'react';
import type { UserRole } from '@/lib/types';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  const userRole = (user?.role || 'WAITER') as UserRole;
  const currentPath = location.pathname;

  if (!hasRouteAccess(userRole, currentPath)) {
    // Redirect to their default page
    const defaultRoute = defaultRouteByRole[userRole];
    return <Navigate to={defaultRoute} replace />;
  }

  return <>{children}</>;
}
