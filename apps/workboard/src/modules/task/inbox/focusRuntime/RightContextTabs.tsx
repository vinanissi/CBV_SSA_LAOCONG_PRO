import { useState } from 'react';
import type { TaskDetail } from '@/api/contracts';
import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import { WORK_INBOX_STATUS_CHIP } from '../components/WorkInboxStatusChip';
import { showFocusRuntimeFeedback } from './focusRuntimeFeedback';
import type { TaskOperationalBundle } from '@/modules/task/inbox/operationalRuntime/workInboxOperationalTypes';
import type { WorkInboxOperationalOp } from '@/modules/task/inbox/operationalRuntime/workInboxOperationalPermissions';

export type FocusRightTabId = 'detail' | 'timeline' | 'handoff' | 'documents';

const TABS: { id: FocusRightTabId; label: string }[] = [
  { id: 'detail', label: 'Chi tiết' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'handoff', label: 'Handoff' },
  { id: 'documents', label: 'Tài liệu' },
];

interface RightContextTabsProps {
  item: WorkInboxFocusItem;
  taskDetail?: TaskDetail | null;
  detailLoading?: boolean;
  detailError?: string | null;
  onRetryDetail?: () => void;
  operationalBundle?: TaskOperationalBundle | null;
  operationalLoading?: boolean;
  operationalError?: string | null;
  operationalDegraded?: boolean;
  onRetryOperational?: () => void;
  onQuickCall?: () => void;
  onQuickMessage?: () => void;
  onQuickAppointment?: () => void;
  onQuickGuide?: () => void;
  onQuickFormTemplate?: () => void;
  onSaveNote?: (content: string) => void;
  opPermissions?: Record<WorkInboxOperationalOp, boolean>;
}

function formatTimelineTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function RightContextTabs({
  item,
  taskDetail = null,
  detailLoading = false,
  detailError = null,
  onRetryDetail,
  operationalBundle = null,
  operationalLoading = false,
  operationalError = null,
  operationalDegraded = false,
  onRetryOperational,
  onQuickCall,
  onQuickMessage,
  onQuickAppointment,
  onQuickGuide,
  onQuickFormTemplate,
  onSaveNote,
  opPermissions,
}: RightContextTabsProps) {
  const [activeTab, setActiveTab] = useState<FocusRightTabId>('detail');
  const [noteDraft, setNoteDraft] = useState('');

  const statusConfig = WORK_INBOX_STATUS_CHIP[item.status] ?? WORK_INBOX_STATUS_CHIP.unknown;
  const slaOk = item.status !== 'overdue';

  const latestNote = operationalBundle?.notes?.[0];
  const persistedNote =
    latestNote?.content?.trim() ||
    taskDetail?.pendingAction?.trim() ||
    taskDetail?.blockReason?.trim() ||
    '';

  const runtimeTimeline = operationalBundle?.timeline ?? [];
  const legacyTimeline = taskDetail?.recentUpdates?.length
    ? taskDetail.recentUpdates
    : taskDetail?.timeline ?? [];

  const assignee =
    item.assigneeName?.trim() ||
    taskDetail?.displayAssigneeName?.trim() ||
    taskDetail?.ownerId?.trim() ||
    'Chưa gán';

  const lastHandoff = runtimeTimeline.find((e) => e.eventType === 'TASK_HANDOFF');

  const hasOperationalData =
    Boolean(operationalBundle?.timeline?.length) ||
    Boolean(operationalBundle?.notes?.length) ||
    Boolean(operationalBundle?.documents?.length);

  const showOperationalEmpty =
    !operationalLoading && !operationalError && !hasOperationalData && !operationalDegraded;

  return (
    <aside
      className="work-inbox-right-context-tabs work-inbox-right-context-tabs--outer"
      aria-label="Ngữ cảnh công việc"
      data-cbv-panel="work-inbox-right-context-tabs"
    >
      <div className="work-inbox-right-context-tabs__tablist" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={
              activeTab === tab.id
                ? 'work-inbox-right-context-tabs__tab active'
                : 'work-inbox-right-context-tabs__tab'
            }
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="work-inbox-right-context-tabs__panel" role="tabpanel">
        {activeTab === 'detail' && (
          <div className="work-inbox-right-context-tabs__detail space-y-4 text-sm">
            {detailLoading && !taskDetail && !detailError && (
              <p className="text-xs text-operational-muted" role="status">
                Đang tải chi tiết…
              </p>
            )}
            {detailError && (
              <div className="rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900" role="alert">
                <p>{detailError}</p>
                {onRetryDetail && (
                  <button type="button" className="btn-secondary mt-2 text-xs" onClick={() => onRetryDetail()}>
                    Thử lại
                  </button>
                )}
              </div>
            )}
            {operationalDegraded && (
              <p className="text-xs text-amber-700" role="status">
                Tải dữ liệu vận hành chậm — hiển thị dữ liệu có sẵn.
              </p>
            )}
            {operationalError && (
              <div className="rounded border border-red-200 bg-red-50 p-2 text-xs text-red-900" role="alert">
                <p>{operationalError}</p>
                {onRetryOperational && (
                  <button type="button" className="btn-secondary mt-2 text-xs" onClick={() => onRetryOperational()}>
                    Thử lại
                  </button>
                )}
              </div>
            )}
            {showOperationalEmpty && (
              <p className="text-xs text-operational-muted">Chưa có dữ liệu vận hành</p>
            )}

            <section>
              <h4 className="work-inbox-right-section-title">TRẠNG THÁI</h4>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="work-inbox-right-status-pill">{statusConfig.label}</span>
                <span
                  className={
                    slaOk
                      ? 'work-inbox-right-sla-pill work-inbox-right-sla-pill--ok'
                      : 'work-inbox-right-sla-pill work-inbox-right-sla-pill--warn'
                  }
                >
                  SLA: {slaOk ? 'OK' : 'Cảnh báo'}
                </span>
              </div>
            </section>

            <section>
              <h4 className="work-inbox-right-section-title">GHI CHÚ</h4>
              <textarea
                className="work-inbox-right-note-input"
                rows={3}
                placeholder="Nhập ghi chú..."
                value={noteDraft || persistedNote}
                onChange={(e) => setNoteDraft(e.target.value)}
                disabled={opPermissions?.NOTES === false}
              />
              <button
                type="button"
                className="btn-secondary mt-2 w-full text-xs"
                disabled={opPermissions?.NOTES === false || !noteDraft.trim()}
                onClick={() => {
                  if (onSaveNote && noteDraft.trim()) {
                    void onSaveNote(noteDraft.trim());
                    setNoteDraft('');
                  }
                }}
              >
                Lưu ghi chú
              </button>
            </section>

            <section>
              <h4 className="work-inbox-right-section-title">THAO TÁC NHANH</h4>
              <div className="work-inbox-right-context-tabs__quick-actions">
                <button type="button" className="work-inbox-right-quick-btn" onClick={() => onQuickCall?.()}>
                  Gọi điện
                </button>
                <button type="button" className="work-inbox-right-quick-btn" onClick={() => onQuickMessage?.()}>
                  Nhắn tin
                </button>
                <button
                  type="button"
                  className="work-inbox-right-quick-btn"
                  disabled={opPermissions?.APPOINTMENT === false}
                  onClick={() => onQuickAppointment?.()}
                >
                  Tạo lịch hẹn
                </button>
                <button type="button" className="work-inbox-right-quick-btn" onClick={() => onQuickGuide?.()}>
                  Hướng dẫn
                </button>
                <button type="button" className="work-inbox-right-quick-btn" onClick={() => onQuickFormTemplate?.()}>
                  Mẫu biểu mẫu
                </button>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-2 text-xs">
            {operationalLoading && !operationalBundle && runtimeTimeline.length === 0 && !operationalError ? (
              <p className="text-operational-muted">Đang tải timeline runtime…</p>
            ) : operationalError ? (
              <div className="text-operational-muted space-y-2">
                <p>{operationalError}</p>
                {onRetryOperational && (
                  <button type="button" className="btn-secondary text-xs" onClick={() => onRetryOperational()}>
                    Thử lại
                  </button>
                )}
              </div>
            ) : runtimeTimeline.length > 0 ? (
              <ul className="work-inbox-right-timeline-list space-y-2">
                {runtimeTimeline.map((entry) => (
                  <li key={entry.timelineId} className="border-l-2 border-slate-200 pl-2">
                    <span className="text-operational-muted">{formatTimelineTime(entry.createdAt)}</span>
                    <p className="font-medium text-operational-text">{entry.eventLabel || entry.eventType}</p>
                    <p className="text-operational-muted">
                      {entry.actor} · {entry.source}
                    </p>
                  </li>
                ))}
              </ul>
            ) : legacyTimeline.length > 0 ? (
              <ul className="work-inbox-right-timeline-list space-y-2">
                {legacyTimeline.map((entry, i) => (
                  <li key={`${entry.time}-${i}`} className="border-l-2 border-slate-200 pl-2">
                    <span className="text-operational-muted">{formatTimelineTime(entry.time)}</span>
                    <p className="text-operational-text">
                      {entry.actor}: {entry.message || entry.action}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-operational-muted">Chưa có sự kiện timeline runtime.</p>
            )}
          </div>
        )}

        {activeTab === 'handoff' && (
          <div className="space-y-2 text-xs">
            <p>
              <strong>Người nhận:</strong> {assignee}
            </p>
            {lastHandoff && (
              <p>
                <strong>Chuyển giao gần nhất:</strong> {formatTimelineTime(lastHandoff.createdAt)} — {lastHandoff.eventLabel}
              </p>
            )}
            <p>
              <strong>Trạng thái:</strong> {taskDetail?.status ?? item.status}
            </p>
            <p className="text-operational-muted">
              {taskDetail?.pendingAction?.trim() || 'Dùng ⇄ Chuyển giao trên thanh hành động.'}
            </p>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="text-xs space-y-2">
            {operationalBundle?.documents && operationalBundle.documents.length > 0 ? (
              <ul className="space-y-1">
                {operationalBundle.documents.map((d) => (
                  <li key={d.documentId}>
                    {d.url ? (
                      <a href={d.url} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                        {d.title}
                      </a>
                    ) : (
                      d.title
                    )}
                    <span className="text-operational-muted"> — {formatTimelineTime(d.uploadedAt)}</span>
                  </li>
                ))}
              </ul>
            ) : taskDetail?.files && taskDetail.files.length > 0 ? (
              <ul className="space-y-1">
                {taskDetail.files.map((f) => (
                  <li key={f.fileId}>{f.fileName}</li>
                ))}
              </ul>
            ) : (
              <p className="text-operational-muted">
                {taskDetail?.relatedHoSoId
                  ? `Liên kết hồ sơ: ${taskDetail.relatedHoSoId}`
                  : 'Không có tài liệu đính kèm.'}
              </p>
            )}
            {opPermissions?.DOCUMENT !== false && (
              <button
                type="button"
                className="btn-secondary w-full text-xs"
                onClick={() => showFocusRuntimeFeedback('Tải tài liệu — dùng luồng đính kèm TASK_ATTACHMENT')}
              >
                Đính kèm tài liệu
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

export const FocusRightTabs = RightContextTabs;
