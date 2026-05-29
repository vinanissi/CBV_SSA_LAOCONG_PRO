import type { DirectoryUser, TaskItem, TimelineItem, UserDirectoryRecord, UserRef } from '@/api/contracts';

/** Rich directory entry — snapshot map or /api/users */
export interface UserDirectoryEntry {
  id: string;
  userCode?: string;
  displayName?: string;
  fullName?: string;
  name?: string;
  userName?: string;
  email?: string;
}

let cachedMap: Record<string, string> = {};
let usersById: Record<string, UserDirectoryEntry> = {};

export const UNKNOWN_USER_SURFACE_LABEL = 'Chưa rõ người xử lý';

const USER_ID_RE = /^USR[_-]/i;
const IS_DEV = typeof import.meta !== 'undefined' && Boolean(import.meta.env?.DEV);

/** Trim + uppercase USR_* codes for directory lookup */
export function normalizeUserLookupKey(value?: string | null): string {
  const s = String(value ?? '').trim();
  if (!s) return '';
  if (USER_ID_RE.test(s)) return s.toUpperCase();
  return s;
}

export type TaskUserFieldSource = {
  ownerId?: string;
  reporterId?: string;
  OWNER_ID?: string;
  owner_id?: string;
  REPORTER_ID?: string;
  reporter_id?: string;
};

export function resolveTaskOwnerId(task: TaskUserFieldSource): string {
  return normalizeUserLookupKey(
    task.ownerId || task.OWNER_ID || task.owner_id || '',
  );
}

export function resolveTaskReporterId(task: TaskUserFieldSource): string {
  return normalizeUserLookupKey(
    task.reporterId || task.REPORTER_ID || task.reporter_id || '',
  );
}

function warnUserLookupMiss(
  kind: 'owner' | 'reporter',
  id: string,
  displayName: string,
): void {
  if (!IS_DEV || !id) return;
  if (displayName !== UNKNOWN_USER_SURFACE_LABEL && displayName !== 'Không rõ') return;
  const sample = Object.keys(cachedMap).slice(0, 8);
  console.warn('[USER_LOOKUP_MISS]', {
    [kind === 'owner' ? 'ownerId' : 'reporterId']: id,
    usersKeysSample: sample,
    mapSize: Object.keys(cachedMap).length,
    usersByIdSize: Object.keys(usersById).length,
  });
}

const SYSTEM_OWNER_LABELS: Record<string, string> = {
  FINANCE: 'Kế toán',
  CUSTOMER: 'Khách hàng',
  SUPERVISOR: 'Quản lý',
  MANAGER: 'Quản lý',
};

/** Runtime user shape — FE display priority source */
export interface RuntimeUser {
  id?: string;
  userId?: string;
  userCode?: string;
  displayName?: string;
  fullName?: string;
  name?: string;
  userName?: string;
}

export interface ResolveUserLabelOptions {
  fallback?: string;
  /** When true, never expose raw USR_* on primary UI — use UNKNOWN_USER_SURFACE_LABEL */
  surface?: boolean;
  map?: Record<string, string>;
}

export function isUserRefKey(value?: string | null): boolean {
  return USER_ID_RE.test(String(value || '').trim());
}

function entryLabel(entry: UserDirectoryEntry): string {
  return (
    String(entry.displayName || '').trim() ||
    String(entry.fullName || '').trim() ||
    String(entry.name || '').trim() ||
    String(entry.userName || '').trim() ||
    String(entry.email || '').trim() ||
    String(entry.userCode || '').trim() ||
    String(entry.id || '').trim()
  );
}

function normalizeDirectoryUser(u: DirectoryUser | UserDirectoryEntry): UserDirectoryEntry {
  if ('userId' in u && u.userId) {
    return {
      id: u.userId,
      userCode: u.userCode,
      displayName: u.displayName,
      email: 'email' in u ? (u as { email?: string }).email : undefined,
    };
  }
  const entry = u as UserDirectoryEntry & { email?: string };
  return {
    id: entry.id,
    userCode: entry.userCode,
    displayName: entry.displayName,
    fullName: entry.fullName,
    name: entry.name,
    userName: entry.userName,
    email: entry.email,
  };
}

function indexDirectoryEntry(entry: UserDirectoryEntry): void {
  const label = entryLabel(entry);
  const userCode = normalizeUserLookupKey(entry.userCode || '');
  const id = normalizeUserLookupKey(entry.id || '');
  const keys = new Set<string>();
  if (userCode) keys.add(userCode);
  if (id && id !== userCode) keys.add(id);
  for (const key of keys) {
    usersById[key] = {
      ...entry,
      userCode: userCode || key,
      id: entry.id || key,
    };
    if (label && !isUserRefKey(label)) cachedMap[key] = label;
  }
}

function indexDisplayMapEntry(rawKey: string, label: string): void {
  const key = normalizeUserLookupKey(rawKey);
  if (!key) return;
  cachedMap[key] = label;
  const trimmed = String(rawKey || '').trim();
  if (trimmed && trimmed !== key) cachedMap[trimmed] = label;
  if (!usersById[key]) {
    usersById[key] = { id: key, userCode: key, displayName: label };
  } else if (label && !isUserRefKey(label)) {
    usersById[key] = { ...usersById[key], displayName: usersById[key].displayName || label };
  }
}

/** Flat id → displayName map from workspace snapshot (GS_09A) */
export function saveUserDisplayMap(map?: Record<string, string> | null): void {
  if (!map || typeof map !== 'object') return;
  for (const [rawKey, label] of Object.entries(map)) {
    indexDisplayMapEntry(rawKey, label);
  }
}

/** Directory users from GET /api/users or snapshot usersById */
export function saveUsersById(map?: Record<string, UserDirectoryRecord> | null): void {
  if (!map || typeof map !== 'object') return;
  for (const [, record] of Object.entries(map)) {
    const userCode = normalizeUserLookupKey(record.userCode || '');
    indexDirectoryEntry({
      id: record.id || userCode,
      userCode: userCode || normalizeUserLookupKey(record.id),
      displayName: record.displayName,
      fullName: record.fullName,
      email: record.email,
    });
  }
}

/** One-time hydrate from workspace snapshot — no per-card sheet queries */
export function hydrateUserDirectoryFromSnapshot(snapshot?: {
  usersById?: Record<string, UserDirectoryRecord>;
  userDisplayMap?: Record<string, string>;
} | null): void {
  if (!snapshot) return;
  if (snapshot.usersById && Object.keys(snapshot.usersById).length > 0) {
    saveUsersById(snapshot.usersById);
  }
  if (snapshot.userDisplayMap && Object.keys(snapshot.userDisplayMap).length > 0) {
    saveUserDisplayMap(snapshot.userDisplayMap);
  }
}

export function hasUserDirectoryLoaded(): boolean {
  return Object.keys(usersById).length > 0 || Object.keys(cachedMap).length > 0;
}

/** Directory users from GET /api/users */
export function saveUsersDirectory(users?: Array<DirectoryUser | UserDirectoryEntry> | null): void {
  if (!users?.length) return;
  for (const raw of users) {
    indexDirectoryEntry(normalizeDirectoryUser(raw));
  }
}

export function getUserDisplayMap(): Record<string, string> {
  return cachedMap;
}

export function getUsersById(): Record<string, UserDirectoryEntry> {
  return usersById;
}

/** Directory key lookup — internal; prefer resolveUserDisplay(user) for UI */
function lookupDirectoryLabel(ref?: string | null, map?: Record<string, string>): string {
  const code = normalizeUserLookupKey(ref);
  if (!code) return '';
  const lookup = map ?? cachedMap;
  const keys = [code];
  const trimmed = String(ref || '').trim();
  if (trimmed && trimmed !== code) keys.push(trimmed);

  for (const key of keys) {
    if (lookup[key] && lookup[key] !== key) return lookup[key];
    const entry = usersById[key];
    if (entry) {
      const label = entryLabel(entry);
      if (label && label !== key && !isUserRefKey(label)) return label;
    }
  }
  return lookup[code] || code;
}

function resolveMappedLabel(ref: string, map?: Record<string, string>): string | null {
  const mapped = lookupDirectoryLabel(ref, map);
  if (mapped && mapped !== ref && !isUserRefKey(mapped)) return mapped;
  const entry = usersById[ref];
  if (entry) {
    const label = entryLabel(entry);
    if (label && label !== ref && !isUserRefKey(label)) return label;
  }
  return null;
}

/**
 * GS_09D unified display — RuntimeUser.displayName first, then directory lookup for string keys.
 * Priority: displayName → fullName → name → userName → userCode → id
 */
export function resolveUserDisplay(
  user?: RuntimeUser | UserRef | string | null,
  options: ResolveUserLabelOptions = {},
): string {
  return resolveUserLabel(user, options);
}

/**
 * Unified FE label: displayName → fullName → name → userName → userCode → id
 * With surface=true, unmapped USR_* → UNKNOWN_USER_SURFACE_LABEL (never raw code on card).
 */
export function resolveUserLabel(
  value?: RuntimeUser | UserRef | string | null,
  options: ResolveUserLabelOptions = {},
): string {
  const surface = options.surface ?? false;
  const fallback = options.fallback ?? (surface ? UNKNOWN_USER_SURFACE_LABEL : 'Không rõ');

  if (value == null || value === '') return fallback;
  if (typeof value === 'string') {
    return resolveUserRefLabel(value, fallback, { surface, map: options.map });
  }
  return labelFromRuntimeUser(value, fallback, surface, options.map);
}

/** Alias per phase spec */
export const formatUserDisplay = resolveUserLabel;

export function resolveUserRefLabel(
  ref?: string | null,
  fallback = 'Không rõ',
  options: Pick<ResolveUserLabelOptions, 'surface' | 'map'> = {},
): string {
  const key = String(ref || '').trim();
  if (!key) return fallback;
  if (SYSTEM_OWNER_LABELS[key]) return SYSTEM_OWNER_LABELS[key];

  const mapped = resolveMappedLabel(key, options.map);
  if (mapped) return mapped;

  if (!isUserRefKey(key)) return key;
  return options.surface ? UNKNOWN_USER_SURFACE_LABEL : key;
}

/** Primary UI — never show raw USR_* when unmapped */
export function resolveUserLabelForSurface(
  value?: RuntimeUser | UserRef | string | null,
  fallback = UNKNOWN_USER_SURFACE_LABEL,
): string {
  return resolveUserLabel(value, { surface: true, fallback });
}

function labelFromRuntimeUser(
  user: RuntimeUser | UserRef,
  fallback: string,
  surface: boolean,
  map?: Record<string, string>,
): string {
  const u = user as RuntimeUser;
  const displayFields = [u.displayName, u.fullName, u.name, u.userName];
  for (const field of displayFields) {
    const s = String(field || '').trim();
    if (!s) continue;
    if (isUserRefKey(s)) {
      const mapped = resolveMappedLabel(s, map);
      if (mapped) return mapped;
      if (surface) return UNKNOWN_USER_SURFACE_LABEL;
      continue;
    }
    return s;
  }

  const codeOrId = String(u.userCode || user.id || u.userId || '').trim();
  if (codeOrId) {
    return resolveUserRefLabel(codeOrId, fallback, { surface, map });
  }
  return fallback;
}

export function getUserRefDisplay(ref?: UserRef | null, fallbackId?: string): string {
  if (ref) return resolveUserLabelForSurface(ref);
  return resolveUserLabelForSurface(fallbackId, 'Không rõ');
}

export function getUserTechnicalId(user?: RuntimeUser | UserRef | Pick<TaskItem, 'ownerId' | 'ownerUser'> | null): string | undefined {
  if (!user) return undefined;
  if ('ownerUser' in user && user.ownerUser?.userCode) return user.ownerUser.userCode;
  if ('ownerId' in user && user.ownerId) return user.ownerId;
  if ('userCode' in user && user.userCode) return user.userCode;
  if ('id' in user && user.id) return user.id;
  if ('userId' in user && user.userId) return user.userId;
  return undefined;
}

export function getTaskOwnerDisplay(
  task: Pick<TaskItem, 'owner' | 'ownerId' | 'ownerUser' | 'displayOwner'> & TaskUserFieldSource,
): string {
  const unassigned = 'Chưa giao';
  const ownerId = resolveTaskOwnerId(task);

  if (!ownerId) {
    const ownerStr = String(task.owner || '').trim();
    if (!ownerStr || ownerStr === 'Chưa giao') return unassigned;
    if (!isUserRefKey(ownerStr)) return ownerStr;
    const mappedOwner = resolveMappedLabel(ownerStr);
    return mappedOwner || ownerStr;
  }

  const ownerDisplayName = String(task.ownerUser?.displayName || '').trim();
  if (ownerDisplayName && !isUserRefKey(ownerDisplayName)) return ownerDisplayName;

  const displayOwner = String(task.displayOwner || '').trim();
  if (displayOwner && displayOwner !== 'Chưa giao' && !isUserRefKey(displayOwner)) {
    return displayOwner;
  }

  const mapped = resolveMappedLabel(ownerId);
  if (mapped) return mapped;

  warnUserLookupMiss('owner', ownerId, UNKNOWN_USER_SURFACE_LABEL);
  return ownerId;
}

export function getTaskReporterDisplay(
  task: Pick<TaskItem, 'reporterId' | 'reporterUser' | 'displayReporter'> & TaskUserFieldSource,
): string {
  const reporterId = resolveTaskReporterId(task);
  if (!reporterId) return '';

  const reporterDisplayName = String(task.reporterUser?.displayName || '').trim();
  if (reporterDisplayName && !isUserRefKey(reporterDisplayName)) return reporterDisplayName;

  const displayReporter = String(task.displayReporter || '').trim();
  if (displayReporter && !isUserRefKey(displayReporter)) return displayReporter;

  const mapped = resolveMappedLabel(reporterId);
  if (mapped) return mapped;

  warnUserLookupMiss('reporter', reporterId, UNKNOWN_USER_SURFACE_LABEL);
  return reporterId;
}

export function getTaskOwnerTechnicalId(
  task: Pick<TaskItem, 'ownerId' | 'ownerUser' | 'owner'> & TaskUserFieldSource,
): string | undefined {
  return task.ownerUser?.userCode || resolveTaskOwnerId(task) || undefined;
}

export function getTaskReporterTechnicalId(
  task: Pick<TaskItem, 'reporterId' | 'reporterUser'> & TaskUserFieldSource,
): string | undefined {
  return task.reporterUser?.userCode || resolveTaskReporterId(task) || undefined;
}

/** FE-side enrichment when snapshot tasks lack ownerUser but directory is loaded */
export function enrichTaskUserFieldsFromDirectory<T extends TaskItem & TaskUserFieldSource>(task: T): T {
  const ownerId = resolveTaskOwnerId(task);
  const reporterId = resolveTaskReporterId(task);
  let next: T = { ...task, ownerId: ownerId || task.ownerId, reporterId: reporterId || task.reporterId };

  if (ownerId) {
    const mapped = resolveMappedLabel(ownerId);
    const displayName =
      (next.ownerUser?.displayName && !isUserRefKey(next.ownerUser.displayName)
        ? next.ownerUser.displayName
        : null) ||
      (next.displayOwner && !isUserRefKey(next.displayOwner) ? next.displayOwner : null) ||
      mapped ||
      null;
    if (displayName) {
      next = {
        ...next,
        owner: displayName,
        displayOwner: displayName,
        ownerUser: next.ownerUser ?? { userCode: ownerId, displayName },
      };
    }
  }

  if (reporterId) {
    const mapped = resolveMappedLabel(reporterId);
    const displayName =
      (next.reporterUser?.displayName && !isUserRefKey(next.reporterUser.displayName)
        ? next.reporterUser.displayName
        : null) ||
      (next.displayReporter && !isUserRefKey(next.displayReporter) ? next.displayReporter : null) ||
      mapped ||
      null;
    if (displayName) {
      next = {
        ...next,
        displayReporter: displayName,
        reporterUser: next.reporterUser ?? { userCode: reporterId, displayName },
      };
    }
  }

  return next;
}

export function enrichTasksUserFieldsFromDirectory(tasks: TaskItem[]): TaskItem[] {
  return tasks.map(enrichTaskUserFieldsFromDirectory);
}

export function getWaitingOwnerDisplay(owner?: string): string {
  if (!owner) return '';
  return resolveUserLabelForSurface(owner, '');
}

export function getAssigneeDisplay(assignee?: string): string {
  if (!assignee) return 'Chưa giao';
  return resolveUserLabelForSurface(assignee, 'Chưa giao');
}

export function getTimelineActorDisplay(item: Pick<TimelineItem, 'actor' | 'actorId'>): string {
  const actor = String(item.actor || '').trim();
  if (actor && !isUserRefKey(actor)) return actor;
  const id = String(item.actorId || actor || '').trim();
  return id ? resolveUserLabelForSurface(id, actor || UNKNOWN_USER_SURFACE_LABEL) : actor || UNKNOWN_USER_SURFACE_LABEL;
}

/** Resolve user ids embedded in timeline/handoff text */
export function resolveTimelineText(text?: string): string {
  if (!text) return '';
  const trimmed = text.trim();

  const arrow = trimmed.match(/^(\S+)\s*→\s*(\S+)$/);
  if (arrow) {
    return `${resolveUserLabelForSurface(arrow[1])} → ${resolveUserLabelForSurface(arrow[2])}`;
  }

  const assign = trimmed.match(/^(ASSIGN:\s*)(\S+)\s*→\s*(\S+)$/i);
  if (assign) {
    return `${assign[1]}${resolveUserLabelForSurface(assign[2])} → ${resolveUserLabelForSurface(assign[3])}`;
  }

  if (isUserRefKey(trimmed)) return resolveUserLabelForSurface(trimmed);

  return trimmed.replace(/USR[_-][\w-]+/gi, (token) => resolveUserLabelForSurface(token));
}

export function resolveHandoffLabel(label: string): string {
  return resolveTimelineText(label);
}

/** Card meta line owner — never raw USR_* */
export function getCardOwnerMetaShort(
  task: Pick<TaskItem, 'owner' | 'ownerId' | 'ownerUser' | 'displayOwner'> & TaskUserFieldSource,
  maxLen = 14,
): string {
  const owner = getTaskOwnerDisplay(task);
  if (!owner || owner === 'Chưa giao') return '';
  return owner.length > maxLen ? owner.slice(0, maxLen) : owner;
}
