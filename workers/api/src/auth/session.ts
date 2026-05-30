import type { UserContext, UserRole } from '../contracts';

const SESSION_PREFIX = 'cbv1.';

export interface AuthSessionPayload {
  userId: string;
  displayName: string;
  email: string;
  role: UserRole;
  permissions: string[];
  loginAt: string;
  mustChangePassword?: boolean;
}

export function encodeSession(session: AuthSessionPayload): string {
  return SESSION_PREFIX + btoa(JSON.stringify(session));
}

export function decodeSession(token: string | null | undefined): AuthSessionPayload | null {
  if (!token) return null;
  const raw = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
  if (!raw.startsWith(SESSION_PREFIX)) return null;
  try {
    const parsed = JSON.parse(atob(raw.slice(SESSION_PREFIX.length))) as AuthSessionPayload;
    if (!parsed.userId || !parsed.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function parseSessionHeader(request: Request): AuthSessionPayload | null {
  const auth = request.headers.get('Authorization');
  if (auth) return decodeSession(auth);
  const legacy = request.headers.get('x-cbv-session');
  if (legacy) return decodeSession(legacy);
  return null;
}

export function sessionToUserContext(session: AuthSessionPayload): UserContext {
  return {
    userId: session.userId,
    displayName: session.displayName,
    email: session.email,
    role: session.role,
    permissions: session.permissions,
    source: 'USER_DIRECTORY',
    mustChangePassword: session.mustChangePassword,
  };
}

export function buildSessionFromUser(
  user: {
    userId: string;
    displayName: string;
    email: string;
    role: UserRole;
    permissions: string[];
  },
  mustChangePassword = false,
): AuthSessionPayload {
  return {
    ...user,
    loginAt: new Date().toISOString(),
    mustChangePassword,
  };
}
