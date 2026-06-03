import type { TaskItem } from '@/api/contracts';
import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import { useChecklistDualPaneFocusOptional } from '@/modules/task/inbox/checklist/ChecklistDualPaneFocusContext';
import { useChecklistSyncFooterState } from '@/runtime/ChecklistSyncFooterContext';
import { checklistSyncStatusLabel, formatChecklistSyncTime } from '@/modules/task/inbox/checklist/checklistSyncDisplayUtils';
import { buildOperatorTechnicalMetadataRows } from './focusOperatorDetailModel';

export interface OperatorTechnicalPanelProps {
  item: WorkInboxFocusItem;
  runtimeTask?: TaskItem;
  createdLabel?: string;
  updatedLabel?: string;
}

export function OperatorTechnicalPanel({
  item,
  runtimeTask,
  createdLabel,
  updatedLabel,
}: OperatorTechnicalPanelProps) {
  const dualPane = useChecklistDualPaneFocusOptional();
  const syncFooter = useChecklistSyncFooterState();

  const technicalRows = buildOperatorTechnicalMetadataRows({
    item,
    runtimeTask,
    createdLabel,
    updatedLabel,
  });

  const focusedStepId =
    dualPane?.dualPaneEnabled && dualPane.focusedChecklistItemId
      ? dualPane.focusedChecklistItemId
      : null;

  const syncRows: { label: string; value: string }[] = [];
  if (syncFooter && syncFooter.taskId === item.id) {
    syncRows.push({
      label: 'Checklist bridge',
      value: syncFooter.bridgeOn ? 'Bật' : 'Tắt',
    });
    if (syncFooter.bridgeOn) {
      syncRows.push({
        label: 'Trạng thái đồng bộ',
        value: checklistSyncStatusLabel(syncFooter.syncState.syncStatus),
      });
      syncRows.push({
        label: 'Lần đồng bộ gần nhất',
        value: formatChecklistSyncTime(syncFooter.syncState.lastSyncedAt),
      });
      if (syncFooter.message?.trim()) {
        syncRows.push({ label: 'Thông báo sync', value: syncFooter.message.trim() });
      }
    }
  }

  return (
    <div
      className="work-inbox-operator-technical-panel space-y-4 text-sm"
      data-cbv-panel="work-inbox-operator-technical-panel"
      data-cbv-operator-detail-zone="technical"
    >
      <header>
        <h3 className="work-inbox-operator-detail-panel__title">KỸ THUẬT</h3>
        <p className="mt-1 text-xs text-operational-muted">
          Chẩn đoán runtime — không dùng cho thao tác nghiệp vụ hàng ngày.
        </p>
      </header>

      <section>
        <h4 className="work-inbox-right-section-title">ĐỊNH DANH &amp; NGUỒN</h4>
        <dl className="work-inbox-right-related">
          {technicalRows.map((row) => (
            <div key={row.label} className="work-inbox-right-related__row">
              <dt>{row.label}</dt>
              <dd className="font-mono text-xs break-all">{row.value}</dd>
            </div>
          ))}
          {focusedStepId ? (
            <div className="work-inbox-right-related__row">
              <dt>Bước checklist (focus)</dt>
              <dd className="font-mono text-xs break-all">{focusedStepId}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      {syncRows.length > 0 ? (
        <section>
          <h4 className="work-inbox-right-section-title">TRẠNG THÁI ĐỒNG BỘ</h4>
          <dl className="work-inbox-right-related">
            {syncRows.map((row) => (
              <div key={row.label} className="work-inbox-right-related__row">
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-xs text-operational-muted">
            Chi tiết worker/runtime: xem thanh footer và Console.
          </p>
        </section>
      ) : (
        <p className="text-xs text-operational-muted">
          Trạng thái đồng bộ checklist: xem footer runtime khi mở việc có checklist.
        </p>
      )}
    </div>
  );
}
