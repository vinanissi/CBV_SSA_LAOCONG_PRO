import { useState } from 'react';
import type { TaskDetail, TaskItem } from '@/api/contracts';
import { WorkInboxAttachmentsSection } from '@/modules/task/inbox/attachments/WorkInboxAttachmentsSection';
import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import { useWorkInboxRuntimeContext } from '@/runtime/rcla/workInboxRuntimeContextRegistry';
import { WORK_INBOX_STATUS_CHIP } from '../components/WorkInboxStatusChip';
import { showFocusRuntimeFeedback } from './focusRuntimeFeedback';
import {
  buildFocusHandoffView,
  buildFocusRelatedInfoRows,
  formatFocusTimelineActor,
  formatFocusTimelineClock,
  formatFocusTimelineFriendlyLabel,
  mapRuntimeTimelineForPanel,
  pickNextAppointmentTitle,
} from './focusLayoutShared';
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
  runtimeTask?: TaskItem;
  taskDetail?: TaskDetail | null;
  detailLoading?: boolean;
  detailError?: string | null;
  createdLabel?: string;
  updatedLabel?: string;
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
  attachDialogOpen?: boolean;
  onAttachDialogOpenChange?: (open: boolean) => void;
}

export function RightContextTabs({
  item,
  runtimeTask,
  taskDetail = null,
  detailLoading = false,
  detailError = null,
  createdLabel,
  updatedLabel,
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
  attachDialogOpen,
  onAttachDialogOpenChange,
}: RightContextTabsProps) {
  const ctx = useWorkInboxRuntimeContext();
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

  const handoffView = buildFocusHandoffView({
    bundle: operationalBundle,
    taskDetail,
    defaultRecipient: assignee,
  });
  const relatedRows = buildFocusRelatedInfoRows({ item, runtimeTask, createdLabel, updatedLabel });
  const nextAppointmentTitle = pickNextAppointmentTitle(operationalBundle);

  const hasOperationalData =
    Boolean(operationalBundle?.timeline?.length) ||
    Boolean(operationalBundle?.notes?.length) ||
    Boolean(operationalBundle?.documents?.length);

  const showOperationalEmpty =
    !operationalLoading && !operationalError && !hasOperationalData && !operationalDegraded;

  const panelTimeline =
    runtimeTimeline.length > 0
      ? mapRuntimeTimelineForPanel(runtimeTimeline)
      : legacyTimeline;

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
                Tải timeline/ghi chú chậm — đang hiển thị dữ liệu có sẵn (không làm mới liên tục).
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
              <p className="text-xs text-operational-muted">Chưa có dữ liệu vận hành bổ sung</p>
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
              <h4 className="work-inbox-right-section-title">THÔNG TIN LIÊN QUAN</h4>
              <dl className="work-inbox-right-related">
                {relatedRows.map((row) => (
                  <div key={row.label} className="work-inbox-right-related__row">
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {nextAppointmentTitle ? (
              <section>
                <h4 className="work-inbox-right-section-title">LỊCH HẸN TIẾP THEO</h4>
                <p className="text-xs text-operational-text">{nextAppointmentTitle}</p>
              </section>
            ) : null}

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
              <p className="text-operational-muted">Đang tải timeline…</p>
            ) : operationalError ? (
              <div className="text-operational-muted space-y-2">
                <p>{operationalError}</p>
                {onRetryOperational && (
                  <button type="button" className="btn-secondary text-xs" onClick={() => onRetryOperational()}>
                    Thử lại
                  </button>
                )}
              </div>
            ) : panelTimeline.length > 0 ? (
              <ul className="work-inbox-right-timeline-list work-inbox-right-timeline-list--friendly space-y-2">
                {panelTimeline.map((entry, i) => {
                  const label = formatFocusTimelineFriendlyLabel({
                    eventType: entry.action,
                    eventLabel: entry.message,
                    action: entry.action,
                    message: entry.message,
                  });
                  const actorLabel = formatFocusTimelineActor(entry.actor);
                  const key =
                    'resourceId' in entry && entry.resourceId
                      ? entry.resourceId
                      : `${entry.time}-${i}`;
                  return (
                    <li key={key} className="work-inbox-right-timeline-list__item">
                      <p className="work-inbox-right-timeline-list__line">
                        <span className="work-inbox-right-timeline-list__time">
                          {formatFocusTimelineClock(entry.time)}
                        </span>
                        <span className="work-inbox-right-timeline-list__label"> — {label}</span>
                      </p>
                      {actorLabel ? (
                        <p className="work-inbox-right-timeline-list__actor">{actorLabel}</p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-operational-muted">Chưa có sự kiện timeline.</p>
            )}
          </div>
        )}

        {activeTab === 'handoff' && (
          <div className="work-inbox-right-handoff space-y-2 text-xs">
            {handoffView.hasHandoff ? (
              <>
                <dl className="work-inbox-right-handoff__meta">
                  {handoffView.fromActor ? (
                    <div className="work-inbox-right-handoff__row">
                      <dt>Người giao</dt>
                      <dd>{handoffView.fromActor}</dd>
                    </div>
                  ) : null}
                  <div className="work-inbox-right-handoff__row">
                    <dt>Người nhận</dt>
                    <dd>{handoffView.recipient}</dd>
                  </div>
                  {handoffView.at ? (
                    <div className="work-inbox-right-handoff__row">
                      <dt>Thời điểm</dt>
                      <dd>{formatFocusTimelineClock(handoffView.at)}</dd>
                    </div>
                  ) : null}
                  <div className="work-inbox-right-handoff__row">
                    <dt>Trạng thái</dt>
                    <dd>{handoffView.statusLabel}</dd>
                  </div>
                </dl>
                {handoffView.note ? (
                  <p className="work-inbox-right-handoff__note">{handoffView.note}</p>
                ) : null}
              </>
            ) : (
              <p className="text-operational-muted">Chưa có bàn giao cho việc này.</p>
            )}
            <button
              type="button"
              className="work-inbox-right-handoff__link"
              onClick={() =>
                showFocusRuntimeFeedback(
                  handoffView.hasHandoff
                    ? 'Dùng ⇄ Chuyển giao trên thanh hành động để bàn giao thêm.'
                    : 'Dùng ⇄ Chuyển giao trên thanh hành động để tạo bàn giao.',
                )
              }
            >
              Xem chi tiết →
            </button>
          </div>
        )}

        {activeTab === 'documents' && (
          <WorkInboxAttachmentsSection
            taskId={item.id}
            operator={ctx.operator}
            canMutate={opPermissions?.DOCUMENT !== false}
            variant="panel"
            dialogOpen={attachDialogOpen}
            onDialogOpenChange={onAttachDialogOpenChange}
          />
        )}
      </div>
    </aside>
  );
}

export const FocusRightTabs = RightContextTabs;
