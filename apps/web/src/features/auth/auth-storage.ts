import type { AuthState } from './types';

const STORAGE_KEY = 'legal-case-auth';

export function loadAuthState(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { tokens: null, user: null };
    }

    const parsed = JSON.parse(raw) as Partial<AuthState>;
    if (!parsed || typeof parsed !== 'object') {
      return { tokens: null, user: null };
    }

    return {
      tokens: parsed.tokens ?? null,
      user: parsed.user ?? null,
    };
  } catch {
    return { tokens: null, user: null };
  }
}

export function saveAuthState(state: AuthState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearAuthState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
