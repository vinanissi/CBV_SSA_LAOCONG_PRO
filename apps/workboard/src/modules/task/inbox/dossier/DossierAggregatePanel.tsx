import { useMemo, useState } from 'react';
import type { UserContext } from '@/api/contracts';
import { applyDossierFilterGrouping, listDossierGroupingModes } from './applyDossierFilterGrouping';
import type { DossierItem } from './dossierAggregateTypes';
import { canDossierGroupRequestChecklistFocus } from './dossierCrossFocusNavigation';
import { DossierItemActions } from './DossierItemActions';
import type { DossierAction } from './dossierActionsTypes';
import type { DossierFilterId, DossierGroupingMode } from './dossierFilterGroupingTypes';
import { DOSSIER_TASK_LEVEL_FOCUS_MESSAGE } from './dossierCrossFocusTypes';
import { useDossierAggregateRuntime } from './useDossierAggregateRuntime';
import { useDossierCrossFocusNavigation } from './useDossierCrossFocusNavigation';
import { useDossierActionsRuntime } from './useDossierActionsRuntime';

function itemIcon(type: DossierItem['type']): string {
  switch (type) {
    case 'attachment':
      return '📎';
    case 'link':
      return '🔗';
    case 'feedback':
      return '💬';
    default:
      return '·';
  }
}

interface DossierItemRowProps {
  item: DossierItem;
  stepLabel?: string | null;
  actions: DossierAction[];
  onAction: (action: DossierAction) => void;
  busyActionId?: string | null;
  showTaskLevelNote?: boolean;
}

function DossierItemRow({
  item,
  stepLabel,
  actions,
  onAction,
  busyActionId,
  showTaskLevelNote,
}: DossierItemRowProps) {
  const label = (
    <>
      <span className="work-inbox-dossier__icon" aria-hidden>
        {itemIcon(item.type)}
      </span>{' '}
      <span className="work-inbox-dossier__item-title">{item.title}</span>
    </>
  );

  return (
    <li className="work-inbox-dossier__item">
      <div className="work-inbox-dossier__item-main">
        <span className="work-inbox-dossier__item-text">{label}</span>
        {item.description && item.type === 'feedback' ? (
          <span className="work-inbox-dossier__item-meta"> — {item.description}</span>
        ) : null}
      </div>
      {stepLabel ? (
        <p className="work-inbox-dossier__item-step" title={stepLabel}>
          {stepLabel}
        </p>
      ) : null}
      <DossierItemActions actions={actions} onAction={onAction} busyActionId={busyActionId} />
      {showTaskLevelNote ? (
        <p className="work-inbox-dossier__item-task-level" role="note">
          {DOSSIER_TASK_LEVEL_FOCUS_MESSAGE}
        </p>
      ) : null}
    </li>
  );
}

interface DossierAggregatePanelProps {
  taskId: string;
  operator: UserContext;
}

export function DossierAggregatePanel({ taskId, operator }: DossierAggregatePanelProps) {
  const { aggregate, checklistItemIds, loading, error, warnings } = useDossierAggregateRuntime({
    taskId,
    operator,
  });
  const [activeFilter, setActiveFilter] = useState<DossierFilterId>('all');
  const [activeGrouping, setActiveGrouping] = useState<DossierGroupingMode>('by_checklist_item');
  const [busyActionId, setBusyActionId] = useState<string | null>(null);

  const { lastResult: focusResult, focusFromItem, focusFromGroup, clearFocusMessage } =
    useDossierCrossFocusNavigation({
      taskId,
      checklistItemIds,
    });

  const { buildActions, runAction, lastActionResult, clearActionMessage } = useDossierActionsRuntime({
    onFocusChecklistItem: focusFromItem,
  });

  const filtered = useMemo(
    () => applyDossierFilterGrouping(aggregate, activeFilter, activeGrouping),
    [aggregate, activeFilter, activeGrouping],
  );

  const groupingModes = listDossierGroupingModes();
  const isEmpty = !loading && filtered.isEmpty;

  const statusMessage = lastActionResult?.message ?? focusResult?.message ?? null;
  const statusIsWarn =
    lastActionResult?.status === 'GO_WITH_WARNINGS' || focusResult?.status === 'GO_WITH_WARNINGS';

  const statusBanner = statusMessage ? (
    <p
      className={
        statusIsWarn
          ? 'work-inbox-dossier__focus-msg work-inbox-dossier__focus-msg--warn'
          : 'work-inbox-dossier__focus-msg'
      }
      role="status"
    >
      {statusMessage}{' '}
      <button
        type="button"
        className="work-inbox-dossier__focus-dismiss"
        onClick={() => {
          clearActionMessage();
          clearFocusMessage();
        }}
      >
        Đóng
      </button>
    </p>
  ) : null;

  const handleItemAction = async (action: DossierAction, item: DossierItem) => {
    setBusyActionId(action.id);
    try {
      await runAction(action, item);
    } finally {
      setBusyActionId(null);
    }
  };

  return (
    <div className="work-inbox-dossier" role="region" aria-label="Hồ sơ tổng hợp" data-cbv-panel="work-inbox-dossier">
      <h4 className="work-inbox-dossier__heading">HỒ SƠ</h4>

      {statusBanner}

      {loading ? (
        <p className="work-inbox-dossier__hint" role="status">
          Đang tải hồ sơ…
        </p>
      ) : null}

      {error ? (
        <p className="work-inbox-dossier__error" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error ? (
        <>
          <div className="work-inbox-dossier__filters" role="tablist" aria-label="Lọc hồ sơ">
            {filtered.filters.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={activeFilter === f.id}
                className={
                  activeFilter === f.id
                    ? 'work-inbox-dossier__filter work-inbox-dossier__filter--active'
                    : 'work-inbox-dossier__filter'
                }
                onClick={() => setActiveFilter(f.id)}
              >
                {f.label} <span className="work-inbox-dossier__filter-count">{f.count}</span>
              </button>
            ))}
          </div>

          <div className="work-inbox-dossier__grouping" role="group" aria-label="Nhóm hồ sơ">
            {groupingModes.map((g) => (
              <button
                key={g.mode}
                type="button"
                className={
                  activeGrouping === g.mode
                    ? 'work-inbox-dossier__grouping-btn work-inbox-dossier__grouping-btn--active'
                    : 'work-inbox-dossier__grouping-btn'
                }
                onClick={() => setActiveGrouping(g.mode)}
              >
                {g.label}
              </button>
            ))}
          </div>
        </>
      ) : null}

      {isEmpty ? (
        <div className="work-inbox-dossier__empty">
          <p>{filtered.emptyMessage}</p>
          {activeFilter === 'all' ? (
            <p className="work-inbox-dossier__empty-sub">
              Tài liệu, liên kết và phản hồi từ checklist sẽ xuất hiện tại đây.
            </p>
          ) : null}
        </div>
      ) : !loading ? (
        <div className="work-inbox-dossier__groups">
          {filtered.groups.map((group) => {
            const groupCanFocus = canDossierGroupRequestChecklistFocus(group);

            return (
              <section key={group.id} className="work-inbox-dossier__group">
                <div className="work-inbox-dossier__group-header">
                  <h5 className="work-inbox-dossier__group-title">[{group.title}]</h5>
                  {groupCanFocus ? (
                    <button
                      type="button"
                      className="work-inbox-dossier__action-btn work-inbox-dossier__goto-step--group"
                      onClick={() => focusFromGroup(group)}
                    >
                      Đi tới bước
                    </button>
                  ) : null}
                </div>
                <ul className="work-inbox-dossier__list">
                  {group.items.map((item) => {
                    const itemStepLabel =
                      item.checklistItemId && (group.checklistItemTitle || group.title)
                        ? `Bước — ${group.checklistItemTitle ?? group.title}`
                        : null;
                    const actions = buildActions(item);
                    return (
                      <DossierItemRow
                        key={`${group.id}-${item.source}-${item.id}`}
                        item={item}
                        stepLabel={itemStepLabel}
                        actions={actions}
                        busyActionId={busyActionId}
                        showTaskLevelNote={
                          item.source === 'task_attachment' && !item.checklistItemId
                        }
                        onAction={(action) => void handleItemAction(action, item)}
                      />
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      ) : null}

      {warnings.length > 0 ? (
        <p className="work-inbox-dossier__warn" role="status">
          {warnings[0]}
        </p>
      ) : null}
    </div>
  );
}
