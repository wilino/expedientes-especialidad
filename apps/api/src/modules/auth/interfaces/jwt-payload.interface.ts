export type TokenType = 'access' | 'refresh';

export interface JwtPayload {
  sub: string;
  correo: string;
  type: TokenType;
  tokenVersion?: number;
  permissions?: string[];
}
