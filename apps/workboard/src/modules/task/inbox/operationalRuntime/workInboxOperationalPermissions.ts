export type WorkInboxOperationalOp =
  | 'START'
  | 'PAUSE'
  | 'HANDOFF'
  | 'COMPLETE'
  | 'APPOINTMENT'
  | 'DOCUMENT'
  | 'NOTES'
  | 'CALL'
  | 'MESSAGE'
  | 'NAVIGATE';

type RoleKey = 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'USER' | 'VIEWER';

const MATRIX: Record<RoleKey, Record<WorkInboxOperationalOp, boolean>> = {
  ADMIN: {
    START: true,
    PAUSE: true,
    HANDOFF: true,
    COMPLETE: true,
    APPOINTMENT: true,
    DOCUMENT: true,
    NOTES: true,
    CALL: true,
    MESSAGE: true,
    NAVIGATE: true,
  },
  MANAGER: {
    START: true,
    PAUSE: true,
    HANDOFF: true,
    COMPLETE: true,
    APPOINTMENT: true,
    DOCUMENT: true,
    NOTES: true,
    CALL: true,
    MESSAGE: true,
    NAVIGATE: true,
  },
  OPERATOR: {
    START: true,
    PAUSE: true,
    HANDOFF: false,
    COMPLETE: true,
    APPOINTMENT: true,
    DOCUMENT: true,
    NOTES: true,
    CALL: true,
    MESSAGE: true,
    NAVIGATE: true,
  },
  USER: {
    START: true,
    PAUSE: true,
    HANDOFF: false,
    COMPLETE: true,
    APPOINTMENT: true,
    DOCUMENT: true,
    NOTES: true,
    CALL: true,
    MESSAGE: true,
    NAVIGATE: true,
  },
  VIEWER: {
    START: false,
    PAUSE: false,
    HANDOFF: false,
    COMPLETE: false,
    APPOINTMENT: false,
    DOCUMENT: false,
    NOTES: false,
    CALL: true,
    MESSAGE: true,
    NAVIGATE: true,
  },
};

export function normalizeWorkInboxRole(role: string | undefined): RoleKey {
  const r = String(role ?? 'OPERATOR').toUpperCase();
  if (r === 'ADMIN') return 'ADMIN';
  if (r === 'MANAGER') return 'MANAGER';
  if (r === 'USER') return 'USER';
  if (r === 'VIEWER' || r === 'VIEW_ONLY') return 'VIEWER';
  return 'OPERATOR';
}

export function canWorkInboxOp(role: string | undefined, op: WorkInboxOperationalOp): boolean {
  return MATRIX[normalizeWorkInboxRole(role)][op] ?? false;
}

export function buildWorkInboxOpPermissions(role: string | undefined): Record<WorkInboxOperationalOp, boolean> {
  return { ...MATRIX[normalizeWorkInboxRole(role)] };
}

export function actionCodeToOp(action: string): WorkInboxOperationalOp | null {
  switch (action) {
    case 'ACTION_START_PROCESSING':
      return 'START';
    case 'ACTION_PAUSE_TASK':
      return 'PAUSE';
    case 'ACTION_HANDOFF':
      return 'HANDOFF';
    case 'ACTION_COMPLETE_TASK':
      return 'COMPLETE';
    case 'ACTION_CREATE_APPOINTMENT':
      return 'APPOINTMENT';
    case 'ACTION_CALL_CLICK':
      return 'CALL';
    case 'ACTION_MESSAGE_CLICK':
      return 'MESSAGE';
    case 'ACTION_NAVIGATE_NEXT':
    case 'ACTION_NAVIGATE_PREVIOUS':
      return 'NAVIGATE';
    case 'ACTION_DOCUMENT_ADDED':
      return 'DOCUMENT';
    case 'ACTION_NOTE_ADDED':
      return 'NOTES';
    default:
      return null;
  }
}
