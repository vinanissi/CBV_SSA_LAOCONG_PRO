import type { AlertItem, UserContext } from '../contracts';

function normalizeRef(value: string | undefined): string {
  return String(value ?? '').trim().toLowerCase();
}

function refMatchesUser(field: string | undefined, user: UserContext): boolean {
  const norm = normalizeRef(field);
  if (!norm) return false;
  const refs = [user.userId, user.displayName, user.email].map(normalizeRef).filter(Boolean);
  return refs.includes(norm);
}

export function canViewHomeAlert(_user: UserContext, _alert: AlertItem): boolean {
  return true;
}

export function canClaimHomeAlert(user: UserContext, alert: AlertItem): boolean {
  if (user.role === 'VIEW_ONLY') return false;
  if (user.role === 'ADMIN' || user.role === 'MANAGER') return true;
  const assignee = alert.assignedTo || alert.claimedBy;
  if (!assignee?.trim()) return true;
  return refMatchesUser(assignee, user);
}

export function canResolveHomeAlert(user: UserContext, alert: AlertItem): boolean {
  return canClaimHomeAlert(user, alert);
}
