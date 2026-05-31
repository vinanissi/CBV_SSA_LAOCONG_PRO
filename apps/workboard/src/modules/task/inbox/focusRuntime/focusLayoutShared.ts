import type { TaskDetail, TaskItem, TimelineItem } from '@/api/contracts';
import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import type { TaskOperationalBundle, TaskTimelineEntry } from '@/modules/task/inbox/operationalRuntime/workInboxOperationalTypes';

export function focusPriorityLabel(priority?: string): string {
  if (!priority) return '—';
  const map: Record<string, string> = {
    low: 'Thấp',
    normal: 'Bình thường',
    high: 'Cao',
    critical: 'Khẩn cấp',
  };
  return map[priority] ?? priority;
}

export interface FocusRelatedInfoRow {
  label: string;
  value: string;
}

export function buildFocusRelatedInfoRows(options: {
  item: WorkInboxFocusItem;
  runtimeTask?: TaskItem;
  createdLabel?: string;
  updatedLabel?: string;
}): FocusRelatedInfoRow[] {
  const { item, runtimeTask, createdLabel, updatedLabel } = options;
  const assignee =
    item.assigneeName?.trim() ||
    runtimeTask?.displayAssigneeName?.trim() ||
    runtimeTask?.ownerId?.trim() ||
    'Chưa gán';

  return [
    { label: 'Mã việc', value: item.code?.trim() || item.id },
    { label: 'Loại việc', value: runtimeTask?.module || 'TASK' },
    { label: 'Nguồn', value: runtimeTask?.source?.trim() || 'TASK_MAIN' },
    { label: 'Ưu tiên', value: focusPriorityLabel(item.priority) },
    { label: 'Người phụ trách', value: assignee },
    {
      label: 'Người tạo',
      value:
        runtimeTask?.createdByDisplayName?.trim() ||
        runtimeTask?.displayReporter?.trim() ||
        '—',
    },
    { label: 'Tạo lúc', value: createdLabel || '—' },
    { label: 'Cập nhật', value: updatedLabel || '—' },
    { label: 'Hạn', value: item.dueLabel?.trim() || 'Chưa có hạn' },
  ];
}

const TIMELINE_EVENT_VI: Record<string, string> = {
  TASK_CREATED: 'Tạo công việc',
  TASK_CREATE: 'Tạo công việc',
  TASK_STARTED: 'Bắt đầu xử lý',
  TASK_START: 'Bắt đầu xử lý',
  TASK_IN_PROGRESS: 'Bắt đầu xử lý',
  TASK_PAUSED: 'Tạm dừng',
  TASK_PAUSE: 'Tạm dừng',
  TASK_RESUMED: 'Tiếp tục xử lý',
  TASK_RESUME: 'Tiếp tục xử lý',
  TASK_COMPLETED: 'Hoàn thành công việc',
  TASK_COMPLETE: 'Hoàn thành công việc',
  TASK_HANDOFF: 'Chuyển giao',
  HANDOFF_CREATED: 'Tạo bàn giao',
  HANDOFF_ACCEPTED: 'Nhận bàn giao',
  TASK_ASSIGNED: 'Gán người xử lý',
  TASK_UPDATED: 'Cập nhật công việc',
  TASK_STATUS_CHANGED: 'Đổi trạng thái',
  ATTACHMENT_ADDED: 'Thêm tài liệu',
  ATTACHMENT_DELETED: 'Xóa tài liệu',
  ATTACHMENT_UPDATED: 'Cập nhật tài liệu',
  CHECKLIST_ITEM_CREATED: 'Thêm mục checklist',
  CHECKLIST_ITEM_DONE: 'Hoàn thành mục checklist',
  CHECKLIST_ITEM_REOPENED: 'Mở lại mục checklist',
  CHECKLIST_ITEM_UNDONE: 'Mở lại mục checklist',
  CHECKLIST_ITEM_DELETED: 'Xóa mục checklist',
};

const STATUS_TRANSITION_VI: Record<string, string> = {
  'NEW -> IN_PROGRESS': 'Bắt đầu xử lý',
  'NEW->IN_PROGRESS': 'Bắt đầu xử lý',
  'IN_PROGRESS -> PAUSED': 'Tạm dừng',
  'IN_PROGRESS->PAUSED': 'Tạm dừng',
  'PAUSED -> IN_PROGRESS': 'Tiếp tục xử lý',
  'PAUSED->IN_PROGRESS': 'Tiếp tục xử lý',
  'IN_PROGRESS -> COMPLETED': 'Hoàn thành công việc',
  'IN_PROGRESS->COMPLETED': 'Hoàn thành công việc',
  'IN_PROGRESS -> DONE': 'Hoàn thành công việc',
};

function looksTechnicalTimelineText(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  if (t.includes('->') || /^system:/i.test(t) || /^[A-Z][A-Z0-9_]*\s*->/.test(t)) return true;
  if (/^admin@|@[\w.-]+\.\w+:/i.test(t)) return true;
  if (/^NEW\s*->/i.test(t) || /^Task created$/i.test(t)) return true;
  return false;
}

function normalizeTransitionKey(text: string): string {
  return text
    .replace(/^system:\s*/i, '')
    .trim()
    .replace(/\s*->\s*/g, ' -> ')
    .toUpperCase();
}

function prettifyLegacyTimeline(text: string): string {
  const raw = text.trim();
  if (!raw) return 'Cập nhật công việc';

  const normalized = normalizeTransitionKey(raw);
  if (STATUS_TRANSITION_VI[normalized]) return STATUS_TRANSITION_VI[normalized];
  if (STATUS_TRANSITION_VI[normalized.replace(/\s/g, '')]) {
    return STATUS_TRANSITION_VI[normalized.replace(/\s/g, '')];
  }

  const statusArrow = normalized.match(/^(\w+)\s*->\s*(\w+)$/);
  if (statusArrow) {
    const to = statusArrow[2].replace(/_/g, ' ').toLowerCase();
    if (/progress/i.test(to)) return 'Bắt đầu xử lý';
    if (/complete|done/i.test(to)) return 'Hoàn thành công việc';
    if (/pause/i.test(to)) return 'Tạm dừng';
    return `Chuyển sang ${to}`;
  }
  if (/task created/i.test(raw)) return 'Tạo công việc';
  if (/handoff|chuyển giao/i.test(raw)) return 'Chuyển giao';
  return raw.replace(/^system:\s*/i, '').trim();
}

/** Operator-facing actor — hides system / raw email prefixes. */
export function formatFocusTimelineActor(actor?: string): string | null {
  const a = actor?.trim();
  if (!a) return null;
  if (/^system$/i.test(a)) return null;
  const emailMatch = a.match(/^([^@:]+)@/);
  if (emailMatch) return emailMatch[1];
  if (/^admin@/i.test(a)) return 'Quản trị';
  return a;
}

export function formatFocusTimelineClock(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export function formatFocusTimelineFriendlyLabel(entry: {
  eventType?: string;
  eventLabel?: string;
  action?: string;
  message?: string;
}): string {
  const eventLabel = entry.eventLabel?.trim();
  if (eventLabel && !looksTechnicalTimelineText(eventLabel)) return eventLabel;

  const type = String(entry.eventType || entry.action || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');
  if (type && TIMELINE_EVENT_VI[type]) return TIMELINE_EVENT_VI[type];

  const message = entry.message?.trim();
  if (message) return prettifyLegacyTimeline(message);

  if (eventLabel) return prettifyLegacyTimeline(eventLabel);
  if (type) return prettifyLegacyTimeline(type.replace(/_/g, ' '));
  return 'Cập nhật công việc';
}

const HANDOFF_EVENT_TYPES = new Set(['TASK_HANDOFF', 'HANDOFF_CREATED', 'HANDOFF_ACCEPTED']);

export interface FocusHandoffView {
  hasHandoff: boolean;
  recipient: string;
  fromActor?: string;
  at?: string;
  statusLabel: string;
  note: string;
}

export function buildFocusHandoffView(options: {
  bundle: TaskOperationalBundle | null | undefined;
  taskDetail?: TaskDetail | null;
  defaultRecipient: string;
}): FocusHandoffView {
  const { bundle, taskDetail, defaultRecipient } = options;
  const events =
    bundle?.timeline?.filter((e) => HANDOFF_EVENT_TYPES.has(String(e.eventType || '').toUpperCase())) ?? [];
  const sorted = [...events].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const last = sorted[0];

  if (last) {
    const from = formatFocusTimelineActor(last.actor) ?? last.actor;
    return {
      hasHandoff: true,
      recipient: defaultRecipient,
      fromActor: from || undefined,
      at: last.createdAt,
      statusLabel: formatFocusTimelineFriendlyLabel(last),
      note:
        last.eventLabel?.trim() && !looksTechnicalTimelineText(last.eventLabel)
          ? last.eventLabel.trim()
          : formatFocusTimelineFriendlyLabel(last),
    };
  }

  const legacy = bundle?.timeline?.length
    ? null
    : taskDetail?.recentUpdates?.find(
        (u) => String(u.action).includes('ASSIGN') || String(u.message).includes('HANDOFF'),
      );
  if (legacy) {
    return {
      hasHandoff: true,
      recipient: defaultRecipient,
      fromActor: formatFocusTimelineActor(legacy.actor) ?? legacy.actor,
      at: legacy.time,
      statusLabel: 'Chuyển giao',
      note: prettifyLegacyTimeline(legacy.message || legacy.action),
    };
  }

  const pendingNote =
    taskDetail?.nextStep?.trim() ||
    taskDetail?.pendingAction?.trim() ||
    '';

  return {
    hasHandoff: false,
    recipient: defaultRecipient,
    statusLabel: 'Chưa bàn giao',
    note: pendingNote,
  };
}

/** @deprecated Use buildFocusHandoffView */
export function pickFocusLastHandoff(
  bundle: TaskOperationalBundle | null | undefined,
  taskDetail?: TaskDetail | null,
): { actor: string; note: string; at: string } | null {
  const view = buildFocusHandoffView({
    bundle,
    taskDetail,
    defaultRecipient: 'Chưa gán',
  });
  if (!view.hasHandoff || !view.at) return null;
  return {
    actor: view.fromActor ?? '—',
    note: view.note,
    at: view.at,
  };
}

export function mapRuntimeTimelineForPanel(entries: TaskTimelineEntry[]): TimelineItem[] {
  return entries.map((e) => ({
    time: e.createdAt,
    actor: e.actor,
    action: e.eventType,
    message: e.eventLabel,
    source: e.source,
    resourceId: e.timelineId,
  }));
}

export function pickNextAppointmentTitle(bundle: TaskOperationalBundle | null | undefined): string | null {
  const appointments = bundle?.appointments;
  if (!appointments?.length) return null;
  const sorted = [...appointments].sort((a, b) => String(a.startAt).localeCompare(String(b.startAt)));
  const now = Date.now();
  const next = sorted.find((a) => new Date(a.startAt).getTime() >= now) ?? sorted[sorted.length - 1];
  return next?.title?.trim() || null;
}
