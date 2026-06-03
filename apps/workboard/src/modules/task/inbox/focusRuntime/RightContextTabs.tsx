import { useState } from 'react';
import type { TaskDetail, TaskItem } from '@/api/contracts';
import { DossierAggregatePanel } from '@/modules/task/inbox/dossier/DossierAggregatePanel';
import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import { useWorkInboxRuntimeContext } from '@/runtime/rcla/workInboxRuntimeContextRegistry';
import { showFocusRuntimeFeedback } from './focusRuntimeFeedback';
import {
  buildFocusHandoffView,
  formatFocusTimelineClock,
  mapRuntimeTimelineForPanel,
} from './focusLayoutShared';
import { OperatorDetailPanel } from './OperatorDetailPanel';
import { OperatorPanelTimelineList } from './OperatorPanelTimelineList';
import { OperatorTechnicalPanel } from './OperatorTechnicalPanel';
import type { WorkInboxActionCode } from '@/modules/task/inbox/actionRuntime/workInboxActionTypes';
import type { TaskOperationalBundle } from '@/modules/task/inbox/operationalRuntime/workInboxOperationalTypes';
import type { WorkInboxOperationalOp } from '@/modules/task/inbox/operationalRuntime/workInboxOperationalPermissions';
import { isChecklistDualPaneRuntimeEnabled } from '@/modules/task/inbox/checklist/checklistDualPaneRuntimeConfig';

export type FocusRightTabId = 'detail' | 'timeline' | 'handoff' | 'dossier' | 'technical';

const TABS: { id: FocusRightTabId; label: string }[] = [
  { id: 'detail', label: 'Chi tiết' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'handoff', label: 'Handoff' },
  { id: 'dossier', label: 'Hồ sơ' },
  { id: 'technical', label: 'Kỹ thuật' },
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
  onFocusForward?: () => void;
  onFocusPause?: () => void;
  onMoreAction?: (code: WorkInboxActionCode) => void;
  opPermissions?: Record<WorkInboxOperationalOp, boolean>;
  attachDialogOpen?: boolean;
  onAttachDialogOpenChange?: (open: boolean) => void;
  aiSummaryText?: string;
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
  onFocusForward,
  onFocusPause,
  onMoreAction,
  opPermissions,
  attachDialogOpen: _attachDialogOpen,
  onAttachDialogOpenChange: _onAttachDialogOpenChange,
  aiSummaryText,
}: RightContextTabsProps) {
  const ctx = useWorkInboxRuntimeContext();
  const [activeTab, setActiveTab] = useState<FocusRightTabId>('detail');

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

  const panelTimeline =
    runtimeTimeline.length > 0
      ? mapRuntimeTimelineForPanel(runtimeTimeline)
      : legacyTimeline;

  const recentTimeline = panelTimeline.slice(0, 4);
  const dualPaneOn = isChecklistDualPaneRuntimeEnabled();

  return (
    <aside
      className="work-inbox-right-context-tabs work-inbox-right-context-tabs--outer"
      aria-label="Ngữ cảnh công việc"
      data-cbv-panel="work-inbox-right-context-tabs"
      data-checklist-dual-pane-right={dualPaneOn ? 'true' : 'false'}
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

            <OperatorDetailPanel
              item={item}
              runtimeTask={runtimeTask}
              taskDetail={taskDetail}
              aiSummaryText={aiSummaryText}
              persistedNote={persistedNote}
              opPermissions={opPermissions}
              onSaveNote={onSaveNote}
              onQuickCall={onQuickCall}
              onQuickMessage={onQuickMessage}
              onQuickAppointment={onQuickAppointment}
              onQuickGuide={onQuickGuide}
              onQuickFormTemplate={onQuickFormTemplate}
              onFocusForward={onFocusForward}
              onFocusPause={onFocusPause}
              onMoreAction={onMoreAction}
            />
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="work-inbox-operator-timeline-panel space-y-4 text-sm" data-cbv-panel="work-inbox-operator-timeline-panel">
            {operationalLoading && !operationalBundle && runtimeTimeline.length === 0 && !operationalError ? (
              <p className="text-operational-muted" role="status">
                Đang tải timeline…
              </p>
            ) : null}
            {operationalDegraded && (
              <p className="text-xs text-amber-700" role="status">
                Tải lịch sử vận hành chậm — đang hiển thị dữ liệu có sẵn.
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

            <section>
              <h4 className="work-inbox-right-section-title">TIMELINE GẦN NHẤT</h4>
              <OperatorPanelTimelineList
                entries={recentTimeline}
                emptyMessage="Chưa có sự kiện gần đây."
              />
            </section>

            <section>
              <h4 className="work-inbox-right-section-title">TIMELINE ĐẦY ĐỦ</h4>
              <OperatorPanelTimelineList
                entries={panelTimeline}
                emptyMessage="Chưa có sự kiện timeline."
              />
            </section>
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

        {activeTab === 'dossier' && (
          <DossierAggregatePanel taskId={item.id} operator={ctx.operator} />
        )}

        {activeTab === 'technical' && (
          <OperatorTechnicalPanel
            item={item}
            runtimeTask={runtimeTask}
            createdLabel={createdLabel}
            updatedLabel={updatedLabel}
          />
        )}
      </div>
    </aside>
  );
}

export const FocusRightTabs = RightContextTabs;
