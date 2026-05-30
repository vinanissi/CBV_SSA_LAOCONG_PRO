import type { FileItem, TaskDetail, TaskItem, TimelineItem } from '@/api/contracts';
import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import type { TaskAppointment, TaskOperationalBundle, TaskTimelineEntry } from '@/modules/task/inbox/operationalRuntime/workInboxOperationalTypes';
import { showFocusRuntimeFeedback } from './focusRuntimeFeedback';

const TIMELINE_PREVIEW_LIMIT = 5;
const DOCUMENT_PREVIEW_LIMIT = 3;

function formatTimelineTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function mapRuntimeTimeline(entries: TaskTimelineEntry[]): TimelineItem[] {
  return entries.map((e) => ({
    time: e.createdAt,
    actor: e.actor,
    action: e.eventType,
    message: e.eventLabel,
    source: e.source,
    resourceId: e.timelineId,
  }));
}

function pickTimelineEntries(
  bundle: TaskOperationalBundle | null | undefined,
  taskDetail?: TaskDetail | null,
): TimelineItem[] {
  if (bundle?.timeline?.length) {
    return mapRuntimeTimeline(bundle.timeline).slice(0, TIMELINE_PREVIEW_LIMIT);
  }
  const legacy = taskDetail?.recentUpdates?.length
    ? taskDetail.recentUpdates
    : taskDetail?.timeline ?? [];
  return legacy.slice(0, TIMELINE_PREVIEW_LIMIT);
}

function pickLastHandoff(bundle: TaskOperationalBundle | null | undefined, taskDetail?: TaskDetail | null) {
  const handoff = bundle?.timeline?.find((e) => e.eventType === 'TASK_HANDOFF');
  if (handoff) {
    return { actor: handoff.actor, note: handoff.eventLabel, at: handoff.createdAt };
  }
  const legacy = bundle?.timeline?.length
    ? null
    : taskDetail?.recentUpdates?.find((u) => String(u.action).includes('ASSIGN') || String(u.message).includes('HANDOFF'));
  if (legacy) return { actor: legacy.actor, note: legacy.message, at: legacy.time };
  return null;
}

function pickNextAppointment(appointments: TaskAppointment[] | undefined): TaskAppointment | null {
  if (!appointments?.length) return null;
  const sorted = [...appointments].sort((a, b) => String(a.startAt).localeCompare(String(b.startAt)));
  const now = Date.now();
  return sorted.find((a) => new Date(a.startAt).getTime() >= now) ?? sorted[sorted.length - 1] ?? null;
}

interface TimelinePreviewCardProps {
  taskDetail?: TaskDetail | null;
  operationalBundle?: TaskOperationalBundle | null;
  detailLoading?: boolean;
  operationalLoading?: boolean;
  updatedLabel?: string;
}

export function TimelinePreviewCard({
  taskDetail = null,
  operationalBundle = null,
  detailLoading = false,
  operationalLoading = false,
  updatedLabel,
}: TimelinePreviewCardProps) {
  const entries = pickTimelineEntries(operationalBundle, taskDetail);

  return (
    <section
      className="work-inbox-focus-card work-inbox-focus-card--preview work-inbox-focus-card--timeline"
      aria-label="Timeline Preview"
      data-cbv-panel="work-inbox-timeline-preview"
    >
      <h3 className="work-inbox-focus-card__title">TIMELINE PREVIEW</h3>
      {(detailLoading || (operationalLoading && !operationalBundle)) && entries.length === 0 ? (
        <p className="work-inbox-focus-card__preview-empty">Đang tải nhật ký…</p>
      ) : entries.length > 0 ? (
        <ul className="work-inbox-focus-card__preview-list">
          {entries.map((entry, index) => (
            <li key={`${entry.time}-${entry.action}-${index}`} className="work-inbox-focus-card__preview-item">
              <span className="work-inbox-focus-card__preview-time">{formatTimelineTime(entry.time)}</span>
              <span className="work-inbox-focus-card__preview-text">
                {entry.actor}: {entry.message || entry.action}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="work-inbox-focus-card__preview-empty">
          {updatedLabel ? `Cập nhật gần nhất — ${updatedLabel}` : 'Chưa có nhật ký timeline.'}
        </p>
      )}
    </section>
  );
}

interface HandoffPreviewCardProps {
  item: WorkInboxFocusItem;
  runtimeTask?: TaskItem;
  taskDetail?: TaskDetail | null;
  operationalBundle?: TaskOperationalBundle | null;
}

export function HandoffPreviewCard({
  item,
  runtimeTask,
  taskDetail = null,
  operationalBundle = null,
}: HandoffPreviewCardProps) {
  const lastHandoff = pickLastHandoff(operationalBundle, taskDetail);
  const recipient =
    item.assigneeName?.trim() ||
    runtimeTask?.assignedToDisplayName?.trim() ||
    runtimeTask?.displayAssigneeName?.trim() ||
    'Chưa gán';

  const handoffNote =
    lastHandoff?.note ||
    taskDetail?.nextStep?.trim() ||
    runtimeTask?.pendingAction?.trim() ||
    taskDetail?.pendingAction?.trim() ||
    'Chưa có ghi chú chuyển giao.';

  return (
    <section
      className="work-inbox-focus-card work-inbox-focus-card--preview work-inbox-focus-card--handoff"
      aria-label="Handoff Preview"
      data-cbv-panel="work-inbox-handoff-preview"
    >
      <h3 className="work-inbox-focus-card__title">HANDOFF PREVIEW</h3>
      <dl className="work-inbox-focus-card__preview-meta">
        <div>
          <dt>Người nhận</dt>
          <dd>{recipient}</dd>
        </div>
        <div>
          <dt>Lần chuyển giao gần nhất</dt>
          <dd>{lastHandoff ? formatTimelineTime(lastHandoff.at) : '—'}</dd>
        </div>
      </dl>
      <p className="work-inbox-focus-card__preview-note line-clamp-2">{handoffNote}</p>
      <button type="button" className="work-inbox-focus-card__preview-link" onClick={() => showFocusRuntimeFeedback()}>
        Xem chi tiết Handoff →
      </button>
    </section>
  );
}

interface DocumentsPreviewCardProps {
  files: FileItem[];
  operationalBundle?: TaskOperationalBundle | null;
}

export function DocumentsPreviewCard({ files, operationalBundle = null }: DocumentsPreviewCardProps) {
  const runtimeDocs =
    operationalBundle?.documents?.map((d) => ({
      fileId: d.documentId,
      fileName: d.title,
      fileGroup: d.source ?? 'DOC',
      createdAt: d.uploadedAt,
      createdBy: d.uploadedBy,
    })) ?? [];

  const merged = runtimeDocs.length > 0 ? runtimeDocs : files;
  if (merged.length === 0) return null;

  const preview = merged.slice(0, DOCUMENT_PREVIEW_LIMIT);

  return (
    <section
      className="work-inbox-focus-card work-inbox-focus-card--preview work-inbox-focus-card--documents"
      aria-label="Recent Documents Preview"
      data-cbv-panel="work-inbox-documents-preview"
    >
      <h3 className="work-inbox-focus-card__title">TÀI LIỆU GẦN ĐÂY</h3>
      <ul className="work-inbox-focus-card__preview-list">
        {preview.map((file) => (
          <li key={file.fileId} className="work-inbox-focus-card__preview-doc">
            <span className="work-inbox-focus-card__preview-doc-name">{file.fileName}</span>
            <span className="work-inbox-focus-card__preview-doc-meta">{file.fileGroup}</span>
          </li>
        ))}
      </ul>
      {merged.length > preview.length && (
        <p className="work-inbox-focus-card__preview-more">+{merged.length - preview.length} tài liệu khác</p>
      )}
    </section>
  );
}

interface AppointmentPreviewCardProps {
  operationalBundle?: TaskOperationalBundle | null;
}

export function AppointmentPreviewCard({ operationalBundle = null }: AppointmentPreviewCardProps) {
  const next = pickNextAppointment(operationalBundle?.appointments);
  if (!next) return null;

  return (
    <section
      className="work-inbox-focus-card work-inbox-focus-card--preview work-inbox-focus-card--appointment"
      aria-label="Appointment Preview"
      data-cbv-panel="work-inbox-appointment-preview"
    >
      <h3 className="work-inbox-focus-card__title">LỊCH HẸN TIẾP THEO</h3>
      <p className="work-inbox-focus-card__body font-medium text-operational-text">{next.title}</p>
      <p className="text-[11px] text-operational-muted">
        {formatTimelineTime(next.startAt)}
        {next.endAt ? ` → ${formatTimelineTime(next.endAt)}` : ''}
      </p>
      <p className="text-[11px] text-operational-muted">Trạng thái: {next.status}</p>
    </section>
  );
}
