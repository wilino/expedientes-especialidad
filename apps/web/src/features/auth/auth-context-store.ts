import { createContext } from 'react';
import type { AuthUser } from './types';

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (correo: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  apiRequest: <T>(path: string, init?: RequestInit) => Promise<T>;
  apiRequestBlob: (path: string, init?: RequestInit) => Promise<Blob>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
