const rawApiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const withApiPrefix = normalizedPath.startsWith('/api')
    ? normalizedPath
    : `/api${normalizedPath}`;

  return `${API_BASE_URL}${withApiPrefix}`;
}
