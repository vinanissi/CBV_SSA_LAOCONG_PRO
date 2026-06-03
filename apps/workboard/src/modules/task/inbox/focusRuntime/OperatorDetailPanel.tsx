import { useState } from 'react';
import type { TaskDetail, TaskItem } from '@/api/contracts';
import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import type { WorkInboxOperationalOp } from '@/modules/task/inbox/operationalRuntime/workInboxOperationalPermissions';
import type { WorkInboxActionCode } from '@/modules/task/inbox/actionRuntime/workInboxActionTypes';
import { showFocusRuntimeFeedback } from './focusRuntimeFeedback';
import { buildOperatorDetailSummaryRows } from './focusOperatorDetailModel';

export interface OperatorDetailPanelProps {
  item: WorkInboxFocusItem;
  runtimeTask?: TaskItem;
  taskDetail?: TaskDetail | null;
  aiSummaryText?: string;
  persistedNote?: string;
  opPermissions?: Record<WorkInboxOperationalOp, boolean>;
  onSaveNote?: (content: string) => void;
  onQuickCall?: () => void;
  onQuickMessage?: () => void;
  onQuickAppointment?: () => void;
  onQuickGuide?: () => void;
  onQuickFormTemplate?: () => void;
  onFocusForward?: () => void;
  onFocusPause?: () => void;
  onMoreAction?: (code: WorkInboxActionCode) => void;
}

type BusinessAction = {
  id: string;
  label: string;
  enabled: boolean;
  hint?: string;
  onClick?: () => void;
};

export function OperatorDetailPanel({
  item,
  runtimeTask,
  taskDetail = null,
  aiSummaryText,
  persistedNote = '',
  opPermissions,
  onSaveNote,
  onQuickCall,
  onQuickMessage,
  onQuickAppointment,
  onQuickGuide,
  onQuickFormTemplate,
  onFocusForward,
  onFocusPause,
  onMoreAction,
}: OperatorDetailPanelProps) {
  const [noteDraft, setNoteDraft] = useState('');
  const summaryRows = buildOperatorDetailSummaryRows({
    item,
    runtimeTask,
    taskDetail,
    aiSummaryText,
  });

  const businessActions: BusinessAction[] = [
    {
      id: 'status',
      label: 'Đổi trạng thái',
      enabled: Boolean(item.canPause && onFocusPause && opPermissions?.PAUSE !== false),
      hint: item.canPause ? 'Mở hộp thoại tạm dừng / trạng thái' : 'Không áp dụng',
      onClick: onFocusPause,
    },
    {
      id: 'handoff',
      label: 'Chuyển giao',
      enabled: Boolean(item.canForward && onFocusForward && opPermissions?.HANDOFF !== false),
      hint: item.canForward ? undefined : 'Không áp dụng cho việc này',
      onClick: onFocusForward,
    },
    {
      id: 'priority',
      label: 'Đổi ưu tiên',
      enabled: Boolean(onMoreAction),
      hint: onMoreAction ? undefined : 'Chưa hỗ trợ',
      onClick: () => onMoreAction?.('ACTION_MORE_PRIORITY'),
    },
    {
      id: 'deadline',
      label: 'Đổi hạn',
      enabled: false,
      hint: 'Chưa hỗ trợ — dùng Sheet/AppSheet hoặc phase sau',
    },
  ];

  const centerText = summaryRows.map((r) => r.value).join(' ');

  return (
    <div
      className="work-inbox-operator-detail-panel space-y-4 text-sm"
      data-cbv-panel="work-inbox-operator-detail-panel"
      data-cbv-operator-detail-zone="action-center"
    >
      <header>
        <h3 className="work-inbox-operator-detail-panel__title">CHI TIẾT VIỆC</h3>
      </header>

      <section>
        <h4 className="work-inbox-right-section-title">TÓM TẮT NGHIỆP VỤ</h4>
        <dl className="work-inbox-right-related work-inbox-operator-detail-panel__summary">
          {summaryRows.map((row) => (
            <div key={row.label} className="work-inbox-right-related__row">
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h4 className="work-inbox-right-section-title">THAO TÁC NGHIỆP VỤ</h4>
        <div className="work-inbox-operator-detail-panel__actions">
          {businessActions.map((action) => (
            <button
              key={action.id}
              type="button"
              className="work-inbox-operator-detail-panel__action-btn"
              disabled={!action.enabled}
              title={action.hint}
              onClick={() => {
                if (!action.enabled) {
                  showFocusRuntimeFeedback(action.hint ?? 'Chưa hỗ trợ');
                  return;
                }
                action.onClick?.();
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h4 className="work-inbox-right-section-title">CẬP NHẬT XỬ LÝ</h4>
        <textarea
          className="work-inbox-right-note-input"
          rows={3}
          placeholder="Ghi chú xử lý…"
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
          Lưu cập nhật
        </button>
      </section>

      <section>
        <h4 className="work-inbox-right-section-title">LIÊN HỆ / HỖ TRỢ</h4>
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

      <span className="sr-only" data-cbv-operator-detail-audit={item.id}>
        {centerText}
      </span>
    </div>
  );
}
