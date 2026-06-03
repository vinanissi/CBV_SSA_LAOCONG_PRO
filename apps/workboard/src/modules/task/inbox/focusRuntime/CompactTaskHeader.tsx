import type { TaskDetail, TaskItem } from '@/api/contracts';
import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import { buildTaskChecklistFieldBag } from './resolveTaskChecklistFieldValues';
import {
  resolveTaskHeaderContextRows,
  resolveTaskHeaderTitle,
} from './resolveTaskHeaderContext';
import { TaskHeaderContextBlock } from './TaskHeaderContextBlock';
import { TaskStatusSemanticSummary } from './TaskStatusSemanticSummary';

interface CompactTaskHeaderProps {
  item: WorkInboxFocusItem;
  assignee: string;
  dueLabel: string;
  runtimeTask?: TaskItem;
  taskDetail?: TaskDetail | null;
  aiSummaryText?: string;
}

export function CompactTaskHeader({
  item,
  assignee,
  dueLabel,
  runtimeTask,
  taskDetail = null,
  aiSummaryText,
}: CompactTaskHeaderProps) {
  const bag = buildTaskChecklistFieldBag({
    item,
    runtimeTask,
    taskDetail,
    aiSummaryText,
    assigneeFallback: assignee,
  });
  const title = resolveTaskHeaderTitle(bag);
  const contextRows = resolveTaskHeaderContextRows(bag);

  return (
    <header
      className="work-inbox-compact-task-header"
      data-cbv-panel="work-inbox-compact-task-header"
      data-cbv-task-checklist-model="v1"
      data-cbv-semantic-status-model="v1"
      data-cbv-task-header-context="v1"
    >
      <h2 className="work-inbox-compact-task-header__title">{title}</h2>

      <TaskHeaderContextBlock
        rows={contextRows}
        className="work-inbox-compact-task-header__context"
      />

      <TaskStatusSemanticSummary
        item={item}
        runtimeTask={runtimeTask}
        taskDetail={taskDetail}
        assigneeFallback={assignee}
        layout="compact"
        className="work-inbox-compact-task-header__semantic"
      />

      <span className="sr-only">Hạn hiển thị: {dueLabel}</span>
    </header>
  );
}

export function taskHeaderShowsAiSummary(aiSummaryText?: string): boolean {
  return Boolean(aiSummaryText?.trim());
}
