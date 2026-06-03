/**
 * PHASE_OCMS_03A_OPERATOR_VALIDATION — operator usability & governance safety checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { TaskItem, UserContext } from '@/api/contracts';
import { deriveCaseReadModel } from './deriveCaseReadModel';
import { buildCaseContextStripView } from './buildCaseContextStripView';
import { resolveStripVisibilityLevel } from './resolveStripVisibility';
import { runCaseDiscovery } from './caseDiscovery';
import { resolveCaseKeyWithDiagnostics } from './caseKeyResolver';
import { isOcmsCaseStripEnabled } from './ocmsFeature';
import { runOcmsCaseContextStripChecks } from './ocmsCaseContextStripChecks';

const __dir = dirname(fileURLToPath(import.meta.url));

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

function readFocus(name: string): string {
  return readFileSync(join(__dir, '..', 'task', 'inbox', 'focusRuntime', name), 'utf8');
}

function task(overrides: Partial<TaskItem> = {}): TaskItem {
  return {
    taskId: 'T-VAL-001',
    title: 'Công việc kiểm tra strip',
    status: 'IN_PROGRESS',
    priority: 'NORMAL',
    owner: 'u1',
    ownerId: 'u1',
    ownerDisplayName: 'Nguyễn A',
    dueDate: '',
    href: '/inbox/T-VAL-001',
    permissionAllowed: true,
    module: 'TASK',
    source: 'TASK_MAIN',
    ...overrides,
  };
}

const staff: UserContext = { userId: 's1', displayName: 'Staff', role: 'STAFF', permissions: [] };
const finance: UserContext = { userId: 'f1', displayName: 'Finance', role: 'FINANCE', permissions: [] };

export function runOcmsOperatorValidationChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean; detail?: string }[];
  warnings: string[];
  skipped: string[];
} {
  const checks: { id: string; pass: boolean; detail?: string }[] = [];
  const warnings: string[] = [];
  const skipped: string[] = [];
  const push = (id: string, pass: boolean, detail?: string) => checks.push({ id, pass, detail });

  const workspace = readFocus('FocusTaskWorkspace.tsx');
  const rightTabs = readFocus('RightContextTabs.tsx');
  const contentCards = readFocus('FocusContentCards.tsx');
  const css = readFileSync(join(__dir, '..', '..', 'styles', 'index.css'), 'utf8');

  // --- Feature flag ---
  push('VAL_FLAG_DEFAULT_OFF', !isOcmsCaseStripEnabled());
  push(
    'VAL_FLAG_OFF_ZERO_DOM',
    workspace.includes('ocmsStripOn && stripView') && !workspace.includes('work-inbox-case-context-strip--hidden'),
  );
  push('VAL_FLAG_ON_PATH_EXISTS', workspace.includes('VITE_OCMS_CASE_STRIP_ENABLED') || readLocal('ocmsFeature.ts').includes('VITE_OCMS_CASE_STRIP_ENABLED'));

  // --- Layout authority ---
  push(
    'VAL_LAYOUT_SLOT_ORDER',
    workspace.indexOf('<WorkInboxCaseContextStrip') > workspace.indexOf('<CompactTaskHeader') &&
      workspace.indexOf('<FocusContentCards') > workspace.indexOf('<WorkInboxCaseContextStrip'),
  );
  push(
    'VAL_LAYOUT_HEIGHT_BUDGET',
    css.includes('--ocms-strip-max-minimal: 2.25rem') &&
      css.includes('--ocms-strip-max-standard: 4.5rem') &&
      css.includes('--ocms-strip-max-expanded: 8rem'),
  );
  push('VAL_LAYOUT_NO_RIGHT_PANEL', !rightTabs.includes('CaseContextStrip') && !rightTabs.includes('Ngữ cảnh case'));

  // --- Task header non-interference ---
  push(
    'VAL_HEADER_UNCHANGED',
    readFocus('CompactTaskHeader.tsx').includes('work-inbox-compact-task-header__title') &&
      !readFocus('CompactTaskHeader.tsx').includes('caseKey'),
  );

  // --- Focus workflow continuity ---
  push(
    'VAL_CHECKLIST_UNCHANGED',
    contentCards.includes('WorkInboxChecklistSection') && contentCards.includes('isCenterRecentDocumentsVisible'),
  );
  push('VAL_ACTION_BAR_UNCHANGED', workspace.includes('FocusActionBar'));

  // --- Read-only / no persistence ---
  push('VAL_NO_CASE_MAIN', !workspace.includes('CASE_MAIN'));
  push('VAL_STRIP_READONLY', !readLocal('WorkInboxCaseContextStrip.tsx').includes('fetch('));

  // --- Discovery outcomes ---
  const resolved = deriveCaseReadModel({ task: task() });
  push('VAL_DISCOVERY_RESOLVED', resolved?.diagnostics.discoveryOutcome === 'RESOLVED');

  const partial = deriveCaseReadModel({
    task: task({ relatedHoSoId: 'HS-MISSING', relatedEntityType: 'FINANCE', relatedEntityId: 'TX-1' }),
  });
  push(
    'VAL_DISCOVERY_PARTIAL_OR_MIXED',
    partial != null && (partial.diagnostics.confidence === 'LOW' || partial.diagnostics.confidence === 'MEDIUM'),
  );

  push('VAL_DISCOVERY_NONE', deriveCaseReadModel({ task: task({ permissionAllowed: false }) }) === null);

  // --- Case key ---
  push(
    'VAL_CASE_KEY_VALID',
    resolveCaseKeyWithDiagnostics('TASK_ANCHORED', 'T-VAL-001').ok &&
      resolveCaseKeyWithDiagnostics('TASK_ANCHORED', 'T-VAL-001').caseKey === 'OPERATIONS:TASK:T-VAL-001',
  );
  push('VAL_CASE_KEY_INVALID', !resolveCaseKeyWithDiagnostics('TASK_ANCHORED', 'T-1', 'not-valid').ok);
  push(
    'VAL_CASE_KEY_MISSING_FALLBACK',
    resolveCaseKeyWithDiagnostics('HO_SO_ANCHORED', '', undefined, 'T-VAL-001').caseKey === 'OPERATIONS:TASK:T-VAL-001',
  );

  // --- Visibility ---
  if (resolved) {
    const level = resolveStripVisibilityLevel(resolved);
    push('VAL_VISIBILITY_OPERATIONS', level === 'MINIMAL' || level === 'STANDARD');
  } else {
    push('VAL_VISIBILITY_OPERATIONS', false);
  }

  const hoSo = deriveCaseReadModel({ task: task({ relatedHoSoId: 'HS-2026-001' }) });
  push('VAL_VISIBILITY_HO_SO', hoSo != null && resolveStripVisibilityLevel(hoSo) === 'EXPANDED');

  // --- Collapse ---
  if (hoSo) {
    const expanded = buildCaseContextStripView(hoSo, 'EXPANDED');
    const collapsed = buildCaseContextStripView(hoSo, 'EXPANDED', { operatorCollapsed: true });
    push('VAL_COLLAPSE_DOWNGRADE', expanded?.level === 'EXPANDED' && collapsed?.level === 'STANDARD');
  } else {
    push('VAL_COLLAPSE_DOWNGRADE', false, 'hoSo fixture null');
  }

  // --- Permissions / diagnostics ---
  const finStaff = deriveCaseReadModel({
    task: task({ relatedEntityType: 'FINANCE', relatedEntityId: 'TX-99' }),
    operator: staff,
  });
  if (finStaff) {
    const view = buildCaseContextStripView(finStaff, 'EXPANDED');
    push(
      'VAL_PERMISSION_FINANCE_HIDDEN',
      view?.warnings.some((w) => w.includes('tài chính bị ẩn')) ?? false,
    );
  } else {
    push('VAL_PERMISSION_FINANCE_HIDDEN', false);
  }

  const finRole = deriveCaseReadModel({
    task: task({ relatedEntityType: 'FINANCE', relatedEntityId: 'TX-99' }),
    operator: finance,
  });
  push('VAL_PERMISSION_FINANCE_ALLOWED', finRole?.permissions.canSeePrivateFields === true);

  if (partial) {
    push('VAL_DIAGNOSTICS_WARNINGS', partial.diagnostics.warnings.length > 0);
  } else {
    push('VAL_DIAGNOSTICS_WARNINGS', false);
  }

  push('VAL_STRIP_NO_RAW_KEY', !readLocal('WorkInboxCaseContextStrip.tsx').includes('caseKey'));

  // --- OCMS_03 regression suite ---
  const base = runOcmsCaseContextStripChecks();
  push('VAL_OCMS_03_REGRESSION', base.status !== 'FAIL', `OCMS_03 suite: ${base.status}`);
  if (base.status === 'GO_WITH_WARNINGS') {
    warnings.push('OCMS_03 static suite returned GO_WITH_WARNINGS (NOT_WIRED expected)');
  }

  // --- Skipped live operator items ---
  skipped.push('Live browser E2E with real operators — requires staging + VITE_OCMS_CASE_STRIP_ENABLED=true');
  skipped.push('HO_SO / FINANCE live projection reads — RUNTIME_STATE NOT_WIRED');
  warnings.push('RUNTIME_STATE: NOT_WIRED — validation is static + fixture-based, not live operator session');
  warnings.push('Below-the-fold impact not measured in browser — max-height caps per layout authority only');

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  return {
    suite: 'PHASE_OCMS_03A_OPERATOR_VALIDATION',
    status,
    checks,
    warnings,
    skipped,
  };
}
