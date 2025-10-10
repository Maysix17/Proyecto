import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermission } from '../contexts/PermissionContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: { modulo: string; recurso: string; accion: string }[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredPermissions }) => {
  const { isAuthenticated, hasPermission } = usePermission();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermissions) {
    const hasAllPermissions = requiredPermissions.every(perm =>
      hasPermission(perm.modulo, perm.recurso, perm.accion)
    );
    if (!hasAllPermissions) {
      return <Navigate to="/login" replace />; 
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;