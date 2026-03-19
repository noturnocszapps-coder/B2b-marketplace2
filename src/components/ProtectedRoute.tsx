import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../config/navigation';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (profile?.status === 'pending') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (profile?.status === 'blocked') {
    return <Navigate to="/blocked" replace />;
  }

  if (allowedRoles && profile && profile.role !== UserRole.ADMIN && !allowedRoles.includes(profile.role as UserRole)) {
    if (import.meta.env.DEV) {
      console.warn('[ProtectedRoute] Access Denied:', {
        path: location.pathname,
        userRole: profile.role,
        allowedRoles
      });
    }
    // Redirect to dashboard if authenticated but unauthorized for this specific route
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
