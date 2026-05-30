const SESSION_KEY = 'cbv_auth_session';

export interface StoredAuthSession {
  token: string;
  userId: string;
  displayName: string;
  role: string;
  mustChangePassword?: boolean;
  savedAt: string;
}

export function getStoredAuthSession(): StoredAuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuthSession;
  } catch {
    return null;
  }
}

export function setStoredAuthSession(session: StoredAuthSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearStoredAuthSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getAuthToken(): string | null {
  return getStoredAuthSession()?.token ?? null;
}
