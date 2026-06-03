import { useEffect, useMemo, useState } from 'react';
import type { TaskDetail, TaskItem, UserContext } from '@/api/contracts';
import type { TaskOperationalBundle } from '@/modules/task/inbox/operationalRuntime/workInboxOperationalTypes';
import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import { buildCaseContextStripView, buildUnavailableCaseContextStripView } from './buildCaseContextStripView';
import type { CaseContextStripView, CaseReadModel } from './caseReadModelTypes';
import type { CaseRuntimeReadModel } from './caseRuntimeReadModelTypes';
import { deriveCaseReadModel } from './deriveCaseReadModel';
import { deriveCaseRuntimeReadModel } from './deriveCaseRuntimeReadModel';
import { resolveOcmsFocusTask } from './ocmsFocusTaskResolver';
import { isCaseReadModelDerivationEnabled, isOcmsUatTelemetryEnabled } from './ocmsFeature';
import { recordFocusTaskView } from './ocmsStripUatTelemetry';
import { clampExpandedForViewport, resolveStripVisibilityLevel } from './resolveStripVisibility';

export interface UseCaseReadModelInput {
  enabled?: boolean;
  task?: TaskItem;
  taskDetail?: TaskDetail | null;
  focusItem?: WorkInboxFocusItem;
  operationalBundle?: TaskOperationalBundle | null;
  operator?: UserContext;
  manualCaseKey?: string;
  /** Optional checklist rows for Case-Centric projection (phase 02). */
  checklistItems?: import('@/modules/task/inbox/checklist/workInboxChecklistTypes').WorkInboxChecklistItem[];
}

export interface UseCaseReadModelResult {
  /** OCMS strip contract (unchanged). */
  readModel: CaseReadModel | null;
  /** Full Case-Centric read model when strip enabled — read-only. */
  runtimeReadModel: CaseRuntimeReadModel | null;
  stripView: CaseContextStripView | null;
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

export function useCaseReadModel(input: UseCaseReadModelInput): UseCaseReadModelResult {
  const enabled = input.enabled !== false && isCaseReadModelDerivationEnabled();
  const [collapsed, setCollapsed] = useState(false);

  const resolvedTask = useMemo(
    () => resolveOcmsFocusTask(input.task, input.taskDetail, input.focusItem),
    [input.task, input.taskDetail, input.focusItem],
  );

  const readModel = useMemo(() => {
    if (!enabled || !resolvedTask) return null;
    return deriveCaseReadModel({
      task: resolvedTask,
      taskTitle: input.focusItem?.title,
      operationalBundle: input.operationalBundle,
      operator: input.operator,
      manualCaseKey: input.manualCaseKey,
    });
  }, [
    enabled,
    resolvedTask,
    input.focusItem?.title,
    input.operationalBundle,
    input.operator,
    input.manualCaseKey,
  ]);

  const runtimeReadModel = useMemo(() => {
    if (!enabled || !resolvedTask) return null;
    return deriveCaseRuntimeReadModel({
      task: resolvedTask,
      taskTitle: input.focusItem?.title,
      operationalBundle: input.operationalBundle,
      operator: input.operator,
      manualCaseKey: input.manualCaseKey,
      checklistItems: input.checklistItems,
      taskDetail: input.taskDetail,
    });
  }, [
    enabled,
    resolvedTask,
    input.focusItem?.title,
    input.operationalBundle,
    input.operator,
    input.manualCaseKey,
    input.checklistItems,
    input.taskDetail,
  ]);

  const stripView = useMemo(() => {
    if (!enabled) return null;

    if (readModel) {
      const level = clampExpandedForViewport(resolveStripVisibilityLevel(readModel));
      return buildCaseContextStripView(readModel, level, {
        focusTaskTitle: input.focusItem?.title,
        operatorCollapsed: collapsed,
      });
    }

    if (resolvedTask?.permissionAllowed === false) return null;

    return buildUnavailableCaseContextStripView({
      focusTaskTitle: input.focusItem?.title ?? resolvedTask?.title,
      warnings: ['Chưa đọc được ngữ cảnh case.'],
    });
  }, [enabled, readModel, input.focusItem?.title, collapsed, resolvedTask]);

  useEffect(() => {
    if (!enabled || !isOcmsUatTelemetryEnabled() || !resolvedTask?.taskId) return;
    recordFocusTaskView();
  }, [enabled, resolvedTask?.taskId]);

  return { readModel, runtimeReadModel, stripView, collapsed, setCollapsed };
}
