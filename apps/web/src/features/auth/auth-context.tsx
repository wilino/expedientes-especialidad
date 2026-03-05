import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { buildApiUrl } from '../../lib/env';
import {
  buildApiError,
  parseJsonResponse,
  type ApiError,
} from '../../lib/http';
import {
  clearAuthState,
  loadAuthState,
  saveAuthState,
} from './auth-storage';
import type { AuthResponse, AuthState, AuthTokens, AuthUser } from './types';
import { AuthContext, type AuthContextValue } from './auth-context-store';

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>(() => loadAuthState());
  const [isInitializing, setIsInitializing] = useState(true);
  const tokensRef = useRef<AuthTokens | null>(state.tokens);
  const refreshPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    tokensRef.current = state.tokens;
    saveAuthState(state);
  }, [state]);

  const clearSession = useCallback(() => {
    tokensRef.current = null;
    setState({ tokens: null, user: null });
    clearAuthState();
  }, []);

  const applyAuthResponse = useCallback((response: AuthResponse) => {
    const nextState: AuthState = {
      tokens: {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      },
      user: response.user,
    };

    tokensRef.current = nextState.tokens;
    setState(nextState);
  }, []);

  const request = useCallback(
    async (
      path: string,
      init: RequestInit = {},
      accessToken?: string,
    ): Promise<Response> => {
      const headers = new Headers(init.headers ?? undefined);
      if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
      }
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }

      return fetch(buildApiUrl(path), {
        ...init,
        headers,
      });
    },
    [],
  );

  const requestJson = useCallback(
    async <T,>(
      path: string,
      init: RequestInit = {},
      accessToken?: string,
    ): Promise<T> => {
      const response = await request(path, init, accessToken);
      const payload = await parseJsonResponse(response);

      if (!response.ok) {
        throw buildApiError(response.status, payload, `Error en ${path}`);
      }

      return payload as T;
    },
    [request],
  );

  const refreshTokens = useCallback(async (): Promise<void> => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const currentTokens = tokensRef.current;
    if (!currentTokens?.refreshToken) {
      throw new Error('No hay refresh token activo');
    }

    refreshPromiseRef.current = (async () => {
      try {
        const response = await requestJson<AuthResponse>('/auth/refresh', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: currentTokens.refreshToken }),
        });
        applyAuthResponse(response);
      } catch {
        clearSession();
        throw new Error('Sesion expirada');
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    return refreshPromiseRef.current;
  }, [applyAuthResponse, clearSession, requestJson]);

  const requestWithRefresh = useCallback(
    async (
      path: string,
      init: RequestInit = {},
      asBlob = false,
    ): Promise<unknown> => {
      const firstToken = tokensRef.current?.accessToken;

      const exec = async (token?: string) => {
        if (asBlob) {
          const raw = await request(path, init, token);
          if (!raw.ok) {
            const payload = await parseJsonResponse(raw);
            throw buildApiError(raw.status, payload, `Error en ${path}`);
          }
          return raw.blob();
        }

        return requestJson(path, init, token);
      };

      try {
        return await exec(firstToken);
      } catch (error) {
        const apiError = error as ApiError;
        const canRefresh =
          apiError?.status === 401 && !!tokensRef.current?.refreshToken;

        if (!canRefresh) {
          throw error;
        }

        await refreshTokens();
        const secondToken = tokensRef.current?.accessToken;
        return exec(secondToken);
      }
    },
    [refreshTokens, request, requestJson],
  );

  const apiRequest = useCallback(
    async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
      return requestWithRefresh(path, init, false) as Promise<T>;
    },
    [requestWithRefresh],
  );

  const apiRequestBlob = useCallback(
    async (path: string, init: RequestInit = {}) => {
      return requestWithRefresh(path, init, true) as Promise<Blob>;
    },
    [requestWithRefresh],
  );

  const fetchProfile = useCallback(async (): Promise<void> => {
    if (!tokensRef.current?.accessToken) {
      return;
    }

    try {
      const user = await apiRequest<AuthUser>('/auth/me', { method: 'GET' });
      setState((prev) => ({
        tokens: prev.tokens,
        user,
      }));
    } catch {
      clearSession();
    }
  }, [apiRequest, clearSession]);

  useEffect(() => {
    const initialize = async () => {
      if (!tokensRef.current?.accessToken) {
        setIsInitializing(false);
        return;
      }

      await fetchProfile();
      setIsInitializing(false);
    };

    void initialize();
  }, [fetchProfile]);

  const login = useCallback(
    async (correo: string, password: string) => {
      const response = await requestJson<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ correo, password }),
      });
      applyAuthResponse(response);
    },
    [applyAuthResponse, requestJson],
  );

  const logout = useCallback(async () => {
    const accessToken = tokensRef.current?.accessToken;

    if (accessToken) {
      try {
        await requestJson<{ message: string }>(
          '/auth/logout',
          { method: 'POST' },
          accessToken,
        );
      } catch {
        // No bloquea cierre local de sesión.
      }
    }

    clearSession();
  }, [clearSession, requestJson]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      isAuthenticated: !!state.tokens?.accessToken,
      isInitializing,
      login,
      logout,
      apiRequest,
      apiRequestBlob,
    }),
    [
      apiRequest,
      apiRequestBlob,
      isInitializing,
      login,
      logout,
      state.tokens?.accessToken,
      state.user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
