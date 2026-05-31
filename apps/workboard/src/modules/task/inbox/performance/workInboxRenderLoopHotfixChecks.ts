/**
 * PHASE_WORK_INBOX_RENDER_LOOP_HOTFIX — static contract checks.
 * Run: npx tsx -e "import { runWorkInboxRenderLoopHotfixChecks } from './src/modules/task/inbox/performance/workInboxRenderLoopHotfixChecks.ts'; console.log(runWorkInboxRenderLoopHotfixChecks());"
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));

function read(rel: string): string {
  return readFileSync(join(__dir, rel), 'utf8');
}

function readRoot(rel: string): string {
  return readFileSync(join(__dir, '..', '..', '..', '..', rel), 'utf8');
}

export function runWorkInboxRenderLoopHotfixChecks(): {
  suite: string;
  status: 'GO' | 'FAIL';
  checks: { id: string; pass: boolean }[];
} {
  const detailPanel = readRoot('components/layout/DetailPanel.tsx');
  const layoutCtx = read('../WorkInboxLayoutContext.tsx');
  const groupsPanel = read('../WorkInboxGroupsPanel.tsx');
  const focusPanel = read('../components/WorkInboxFocusPanel.tsx');
  const workInboxShell = readRoot('components/inbox/WorkInboxShell.tsx');
  const tasksPage = readRoot('modules/task/TasksPage.tsx');

  const checks = [
    {
      id: 'DETAIL_SET_DETAIL_STABLE_CALLBACK',
      pass: detailPanel.includes('const setDetail = useCallback') && detailPanel.includes('prev === t ? prev : t'),
    },
    {
      id: 'DETAIL_CLEAR_GUARD',
      pass: detailPanel.includes('const clearDetail = useCallback') && detailPanel.includes('prev === null ? prev : null'),
    },
    {
      id: 'DETAIL_NO_INLINE_SET_DETAIL_IN_MEMO',
      pass: !detailPanel.includes('setDetail: (t, c) =>'),
    },
    {
      id: 'LAYOUT_PUBLISH_METRICS_GUARD',
      pass: layoutCtx.includes('metricsEqual') && layoutCtx.includes('prev === queueSize ? prev : queueSize'),
    },
    {
      id: 'LAYOUT_SET_VIEW_MODE_GUARD',
      pass: layoutCtx.includes('setViewModeGuarded') && layoutCtx.includes('prev === mode ? prev : mode'),
    },
    {
      id: 'GROUPS_FOCUS_VIEW_MODE_GUARD',
      pass: groupsPanel.includes("prev === 'focus' ? prev : 'focus'"),
    },
    {
      id: 'GROUPS_FOCUS_INDEX_GUARD',
      pass: groupsPanel.includes('prev === idx ? prev : idx'),
    },
    {
      id: 'FOCUS_PANEL_NO_EFFECT_LOOP',
      pass: !focusPanel.includes('useEffect'),
    },
    {
      id: 'WORK_INBOX_SHELL_NO_EFFECT_LOOP',
      pass: !workInboxShell.includes('useEffect'),
    },
    {
      id: 'TASKS_SHOW_PANEL_NO_BUMP_LOOP',
      pass: tasksPage.includes('STABLE_DETAIL_PANEL_INVOKER') && !tasksPage.includes('if (!loading) bumpDetailContent();'),
    },
    {
      id: 'TASKS_DETAIL_BUMP_NARROW_DEPS',
      pass: tasksPage.includes('detail?.taskId') && tasksPage.includes('detail?.updatedAt'),
    },
    {
      id: 'TASKS_SELECTION_REF',
      pass: tasksPage.includes('selectedTaskIdRef'),
    },
    {
      id: 'TASKS_DETAIL_STATE',
      pass: tasksPage.includes('setDetailState') && tasksPage.includes('panelDetailRef'),
    },
  ];

  const failCount = checks.filter((c) => !c.pass).length;
  return {
    suite: 'PHASE_WORK_INBOX_RENDER_LOOP_HOTFIX',
    status: failCount === 0 ? 'GO' : 'FAIL',
    checks,
  };
}
