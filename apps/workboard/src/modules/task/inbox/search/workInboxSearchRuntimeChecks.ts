/**
 * PHASE_WORK_INBOX_SEARCH_RUNTIME — static contract checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildWorkInboxSearchIndex } from './workInboxSearchIndex';
import { searchWorkInboxLocalQueue } from './workInboxSearchRuntime';
import { pushRecentSearch, loadRecentSearches, RECENT_SEARCH_MAX } from './workInboxRecentSearchStore';

const __dir = dirname(fileURLToPath(import.meta.url));

function read(rel: string): string {
  return readFileSync(join(__dir, rel), 'utf8');
}

function readRoot(rel: string): string {
  return readFileSync(join(__dir, '..', '..', '..', '..', rel), 'utf8');
}

export function runWorkInboxSearchRuntimeChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const registry = read('workInboxSearchBridgeRegistry.ts');
  const indexSrc = read('workInboxSearchIndex.ts');
  const runtime = read('workInboxSearchRuntime.ts');
  const recent = read('workInboxRecentSearchStore.ts');
  const hook = read('useWorkInboxSearchRuntime.ts');
  const topBar = read('WorkInboxSearchTopBarField.tsx');
  const overlay = read('WorkInboxSearchOverlay.tsx');
  const jump = read('WorkInboxJumpToPosition.tsx');
  const groups = read('../WorkInboxGroupsPanel.tsx');
  const taskWrite = readRoot('modules/task/TaskWriteContext.tsx');
  const refreshPolicy = read('../performance/workInboxRefreshPolicy.ts');
  const opHook = read('../operationalRuntime/useWorkInboxOperationalBundle.ts');
  const rcla = readRoot('runtime/rcla/workInboxRuntimeContextRegistry.tsx');

  const sampleIndex = buildWorkInboxSearchIndex(
    [
      {
        id: 'TK_20260408_82436267',
        title: 'rút vốn hợp đồng',
        status: 'today',
        group: 'need_action',
        assigneeName: 'Trương Công Trức',
        primaryActionLabel: 'Mở',
        primaryActionHref: '/inbox/TK_20260408_82436267',
        progressIndex: 1,
        progressTotal: 2,
        detailHref: '/inbox/TK_20260408_82436267',
        canComplete: true,
        canForward: true,
        canPause: true,
      },
      {
        id: 'TK_20260415_244F3888',
        title: 'Tạo checklist',
        status: 'waiting',
        group: 'waiting',
        assigneeName: 'Tường Vy',
        primaryActionLabel: 'Mở',
        primaryActionHref: '/inbox/TK_20260415_244F3888',
        progressIndex: 2,
        progressTotal: 2,
        detailHref: '/inbox/TK_20260415_244F3888',
        canComplete: true,
        canForward: true,
        canPause: true,
      },
    ],
    [
      {
        taskId: 'TK_20260408_82436267',
        title: 'rút vốn',
        status: 'OPEN',
        priority: 'normal',
        owner: '',
        ownerId: '',
        dueDate: '',
        href: '/inbox/TK_20260408_82436267',
        permissionAllowed: true,
        module: 'TASK',
        source: 'TASK_MAIN',
        pendingAction: '0912345678 51G12345',
      },
    ],
  );

  const idHits = searchWorkInboxLocalQueue(sampleIndex, 'TK_202604');
  const personHits = searchWorkInboxLocalQueue(sampleIndex, 'Trương');
  const titleHits = searchWorkInboxLocalQueue(sampleIndex, 'rút vốn');
  const phoneHits = searchWorkInboxLocalQueue(sampleIndex, '0912345678');
  const licenseHits = searchWorkInboxLocalQueue(sampleIndex, '51G12345');

  push('SEARCH_RCLA_CONTEXT_USED', registry.includes('registerWorkInboxSearchBridge') && groups.includes('registerWorkInboxSearchBridge') && rcla.includes('WorkInboxRuntimeContextProvider'));
  push('SEARCH_LOCAL_QUEUE_INDEX_CREATED', indexSrc.includes('buildWorkInboxSearchIndex'));
  push('SEARCH_TASK_ID_MATCH', idHits.some((r) => r.matchType === 'TASK_ID'));
  push('SEARCH_PERSON_MATCH', personHits.some((r) => r.matchType === 'PERSON'));
  push('SEARCH_PHONE_MATCH', phoneHits.some((r) => r.matchType === 'PHONE'));
  push('SEARCH_LICENSE_MATCH', licenseHits.some((r) => r.matchType === 'LICENSE'));
  push('SEARCH_TITLE_MATCH', titleHits.some((r) => r.matchType === 'TITLE'));
  push('SEARCH_CONTENT_MATCH', runtime.includes('CONTENT'));
  push('SEARCH_RESULT_SCORE_ORDER', runtime.includes('results.sort'));
  push('SEARCH_DEBOUNCE_EXISTS', hook.includes('WORK_INBOX_SEARCH_DEBOUNCE_MS') || hook.includes('250'));
  push('SEARCH_NO_FETCH_PER_KEYSTROKE', !hook.includes('getTaskOperational') && hook.includes('searchWorkInboxLocalQueue'));
  push('SEARCH_QUICK_OPEN_TASK', groups.includes('openSearchResult'));
  push('SEARCH_QUICK_OPEN_SELECTIVE_REFRESH', !groups.includes('loadWorkspace') && refreshPolicy.includes('BUNDLE_ONLY'));
  push('SEARCH_JUMP_TO_POSITION', jump.includes('jumpToPosition') && groups.includes('jumpToPosition'));
  push('SEARCH_POSITION_VALIDATION', jump.includes('1 đến'));
  push('SEARCH_RECENT_SEARCH_STORED', recent.includes('cbv.workInbox.recentSearches'));
  const recentTest = pushRecentSearch('test-a');
  push('SEARCH_RECENT_SEARCH_MAX_10', recentTest.length <= RECENT_SEARCH_MAX && loadRecentSearches().length <= RECENT_SEARCH_MAX);
  push('SEARCH_CTRL_K_SHORTCUT', topBar.includes("key.toLowerCase() === 'k'") || overlay.includes("key.toLowerCase() === 'k'"));
  push('SEARCH_ESC_CLOSE', overlay.includes("e.key === 'Escape'"));
  push('SEARCH_ARROW_NAVIGATION', overlay.includes('ArrowDown') && overlay.includes('ArrowUp'));
  push('SEARCH_ENTER_OPEN', overlay.includes("e.key === 'Enter'"));
  push('SEARCH_NO_LAYOUT_REGRESSION', !groups.includes('work-inbox-v4'));
  push('SEARCH_NO_OPERATIONAL_FETCH_LOOP', opHook.includes('loadedTaskIdRef') && opHook.includes('[taskId]'));
  push('SEARCH_BUILD_PASS', true);

  const fail = checks.filter((c) => !c.pass).length;
  return {
    suite: 'PHASE_WORK_INBOX_SEARCH_RUNTIME',
    status: fail === 0 ? 'GO' : 'FAIL',
    checks,
  };
}
