import { useState } from 'react';
import type { TaskDetail, TaskItem } from '@/api/contracts';
import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import { showFocusRuntimeFeedback } from './focusRuntimeFeedback';
import {
  AppointmentPreviewCard,
  DocumentsPreviewCard,
  HandoffPreviewCard,
  TimelinePreviewCard,
} from './FocusPreviewCards';
import type { TaskOperationalBundle } from '@/modules/task/inbox/operationalRuntime/workInboxOperationalTypes';

const DEFAULT_CHECKLIST = [
  'Xác nhận phạm vi và người liên hệ',
  'Kiểm tra hạn xử lý và tài liệu liên quan',
  'Ghi nhận bước tiếp theo trước khi chuyển việc',
];

interface FocusContentCardsProps {
  item: WorkInboxFocusItem;
  runtimeTask?: TaskItem;
  taskDetail?: TaskDetail | null;
  detailLoading?: boolean;
  operationalBundle?: TaskOperationalBundle | null;
  operationalLoading?: boolean;
  summaryText?: string;
  createdLabel?: string;
  updatedLabel?: string;
}

function priorityLabel(priority?: string): string {
  if (!priority) return '—';
  const map: Record<string, string> = {
    low: 'Thấp',
    normal: 'Bình thường',
    high: 'Cao',
    critical: 'Khẩn cấp',
  };
  return map[priority] ?? priority;
}

export function FocusContentCards({
  item,
  runtimeTask,
  taskDetail = null,
  detailLoading = false,
  operationalBundle = null,
  operationalLoading = false,
  summaryText,
  createdLabel,
  updatedLabel,
}: FocusContentCardsProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const aiSummary = summaryText?.trim() || 'Chưa có tóm tắt AI cho việc này.';
  const documentFiles = taskDetail?.files ?? [];

  const relatedRows: { label: string; value: string }[] = [
    { label: 'Mã việc', value: item.code?.trim() || item.id },
    { label: 'Nguồn', value: runtimeTask?.source?.trim() || 'TASK_MAIN' },
    { label: 'Loại việc', value: runtimeTask?.module || 'TASK' },
    { label: 'Ưu tiên', value: priorityLabel(item.priority) },
    { label: 'Tạo lúc', value: createdLabel || '—' },
    { label: 'Cập nhật', value: updatedLabel || '—' },
    {
      label: 'Người tạo',
      value:
        runtimeTask?.createdByDisplayName?.trim() ||
        runtimeTask?.displayReporter?.trim() ||
        '—',
    },
  ];

  return (
    <div
      className="work-inbox-focus-content-cards work-inbox-focus-content-cards--grid work-inbox-focus-content-cards--density"
      data-cbv-panel="work-inbox-focus-content-cards"
    >
      <div className="work-inbox-focus-content-cards__left">
        <section className="work-inbox-focus-card work-inbox-focus-card--summary" aria-label="AI Tóm tắt">
          <h3 className="work-inbox-focus-card__title">AI TÓM TẮT</h3>
          <p className="work-inbox-focus-card__body">{aiSummary}</p>
        </section>

        <section className="work-inbox-focus-card work-inbox-focus-card--checklist" aria-label="Checklist gợi ý">
          <h3 className="work-inbox-focus-card__title">CHECKLIST GỢI Ý</h3>
          <ul className="work-inbox-focus-card__checklist">
            {DEFAULT_CHECKLIST.map((line, i) => (
              <li key={line}>
                <label className="work-inbox-focus-card__check">
                  <input
                    type="checkbox"
                    checked={Boolean(checked[i])}
                    onChange={() => {
                      setChecked((prev) => ({ ...prev, [i]: !prev[i] }));
                      showFocusRuntimeFeedback('Đã ghi nhận trên giao diện — chưa lưu hệ thống.');
                    }}
                  />
                  <span>{line}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="work-inbox-focus-content-cards__right">
        <section
          className="work-inbox-focus-card work-inbox-focus-card--related"
          aria-label="Thông tin liên quan"
        >
          <h3 className="work-inbox-focus-card__title">THÔNG TIN LIÊN QUAN</h3>
          <dl className="work-inbox-focus-card__related">
            {relatedRows.map((row) => (
              <div key={row.label} className="work-inbox-focus-card__related-row">
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <TimelinePreviewCard
          taskDetail={taskDetail}
          operationalBundle={operationalBundle}
          detailLoading={detailLoading}
          operationalLoading={operationalLoading}
          updatedLabel={updatedLabel}
        />

        <HandoffPreviewCard
          item={item}
          runtimeTask={runtimeTask}
          taskDetail={taskDetail}
          operationalBundle={operationalBundle}
        />

        <AppointmentPreviewCard operationalBundle={operationalBundle} />

        <DocumentsPreviewCard files={documentFiles} operationalBundle={operationalBundle} />
      </div>
    </div>
  );
}
