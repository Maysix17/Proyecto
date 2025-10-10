import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser, loginUser, refreshToken } from '../services/authService';
import type { Permission, LoginPayload } from '../types/Auth';
import type { User } from '../types/user';
import { setupAxiosInterceptors } from '../lib/axios/axios';
import { getProfile } from '../services/profileService';

interface PermissionContextType {
  user: User | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  hasPermission: (modulo: string, recurso: string, accion: string) => boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (user: User | null) => void;
  setPermissions: (permissions: Permission[]) => void;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

interface PermissionProviderProps {
  children: ReactNode;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const hasPermission = (modulo: string, recurso: string, accion: string): boolean => {
    return permissions.some(p => p.modulo === modulo && p.recurso === recurso && p.accion === accion);
  };

  const login = async (payload: LoginPayload): Promise<void> => {
    try {
      await loginUser(payload);
      const profile = await getProfile();
      setUser(profile);
      const mappedPermissions = (profile.rol.permisos as any[]).map(p => ({
        modulo: p.recurso.modulo.nombre,
        recurso: p.recurso.nombre,
        accion: p.accion,
      }));
      setPermissions(mappedPermissions);

      console.log('Login successful:', profile);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const refresh = useCallback(async (): Promise<void> => {
    console.log('PermissionContext: Starting refresh');
    try {
      await refreshToken();
      console.log('PermissionContext: refreshToken successful');
      const profile = await getProfile();
      console.log('PermissionContext: getProfile successful', profile);
      setUser(profile);
      const mappedPermissions = (profile.rol.permisos as any[]).map(p => ({
        modulo: p.recurso.modulo.nombre,
        recurso: p.recurso.nombre,
        accion: p.accion,
      }));
      setPermissions(mappedPermissions);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('PermissionContext: Refresh failed:', error);
      throw error;
    }
  }, []);

  const logout = async (): Promise<void> => {
    try {
      await logoutUser();
      setUser(null);
      setPermissions([]);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const profile = await getProfile();
        setUser(profile);
        const mappedPermissions = (profile.rol.permisos as any[]).map(p => ({
          modulo: p.recurso.modulo.nombre,
          recurso: p.recurso.nombre,
          accion: p.accion,
        }));
        setPermissions(mappedPermissions);
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      }
      setupAxiosInterceptors(refresh, navigate);
    };
    init();
  }, [refresh, navigate]);

  const value: PermissionContextType = {
    user,
    permissions,
    isAuthenticated,
    hasPermission,
    login,
    logout,
    refresh,
    setUser,
    setPermissions,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
};