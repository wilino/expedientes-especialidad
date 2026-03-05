export interface AuthUser {
  id: string;
  nombre: string;
  correo: string;
  estado: boolean;
  roles: string[];
  permisos: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
  user: AuthUser;
}

export interface AuthState {
  tokens: AuthTokens | null;
  user: AuthUser | null;
}
