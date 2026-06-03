/**
 * PHASE_OCMS_03_FOCUS_CASE_CONTEXT_STRIP — static contract checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { TaskItem } from '@/api/contracts';
import { deriveCaseReadModel } from './deriveCaseReadModel';
import { resolveStripVisibility, resolveStripVisibilityLevel } from './resolveStripVisibility';
import { buildCaseContextStripView } from './buildCaseContextStripView';
import { resolveCaseKeyWithDiagnostics } from './caseKeyResolver';
import { runCaseDiscovery } from './caseDiscovery';
import { isOcmsCaseStripEnabled } from './ocmsFeature';

const __dir = dirname(fileURLToPath(import.meta.url));

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

function readFocus(name: string): string {
  return readFileSync(join(__dir, '..', 'task', 'inbox', 'focusRuntime', name), 'utf8');
}

function task(overrides: Partial<TaskItem> = {}): TaskItem {
  return {
    taskId: 'T-2026-0042',
    title: 'Kiểm kê kho cuối tuần',
    status: 'IN_PROGRESS',
    priority: 'NORMAL',
    owner: 'u1',
    ownerId: 'u1',
    ownerDisplayName: 'Nguyễn A',
    dueDate: '',
    href: '/inbox/T-2026-0042',
    permissionAllowed: true,
    module: 'TASK',
    source: 'TASK_MAIN',
    ...overrides,
  };
}

export function runOcmsCaseContextStripChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean; detail?: string }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean; detail?: string }[] = [];
  const warnings: string[] = ['RUNTIME_STATE: NOT_WIRED — derive uses TASK_MAIN + operational bundle only'];
  const push = (id: string, pass: boolean, detail?: string) => checks.push({ id, pass, detail });

  const featureSource = readLocal('ocmsFeature.ts');
  const workspaceSource = readFocus('FocusTaskWorkspace.tsx');
  const stripSource = readLocal('WorkInboxCaseContextStrip.tsx');

  push(
    'OCMS_FLAG_DEFAULT_OFF',
    featureSource.includes('VITE_OCMS_CASE_STRIP_ENABLED') &&
      featureSource.includes("flag === 'true'") &&
      !featureSource.includes("flag !== 'false'"),
  );

  push(
    'OCMS_STRIP_MOUNT_BELOW_HEADER',
    workspaceSource.includes('<CompactTaskHeader') &&
      workspaceSource.includes('<WorkInboxCaseContextStrip') &&
      workspaceSource.indexOf('<WorkInboxCaseContextStrip') >
        workspaceSource.indexOf('<CompactTaskHeader') &&
      workspaceSource.indexOf('<FocusContentCards') >
        workspaceSource.indexOf('<WorkInboxCaseContextStrip'),
  );

  push(
    'OCMS_FLAG_GUARD_CONDITIONAL_RENDER',
    workspaceSource.includes('ocmsStripOn && stripView') && workspaceSource.includes('isOcmsCaseStripEnabled()'),
  );

  push('OCMS_STRIP_READONLY', !stripSource.includes('onComplete') && stripSource.includes('role="region"'));
  push('OCMS_STRIP_NO_RAW_KEY', !stripSource.includes('caseKey'));
  push('OCMS_STRIP_MAX_HEIGHT', stripSource.includes('maxHeight') && stripSource.includes('LEVEL_MAX_HEIGHT'));

  const opsModel = deriveCaseReadModel({ task: task() });
  push('OCMS_DERIVE_TASK_ANCHORED', opsModel?.caseKey === 'OPERATIONS:TASK:T-2026-0042');
  push(
    'OCMS_DISCOVERY_HO_SO_WINS',
    runCaseDiscovery(task({ relatedHoSoId: 'HS-001', taskId: 'T-1' }))?.sourceId === 'HS-001',
  );

  const keyInvalid = resolveCaseKeyWithDiagnostics('TASK_ANCHORED', 'T-1', 'bad-key');
  push('OCMS_CASE_KEY_INVALID_MANUAL', !keyInvalid.ok && keyInvalid.code === 'CASE_KEY_INVALID_MANUAL');

  const keyMissing = resolveCaseKeyWithDiagnostics('HO_SO_ANCHORED', '', undefined, 'T-1');
  push(
    'OCMS_CASE_KEY_FALLBACK',
    keyMissing.ok && keyMissing.caseKey === 'OPERATIONS:TASK:T-1' && keyMissing.warnings.length > 0,
  );

  push('OCMS_PERMISSION_HIDDEN', deriveCaseReadModel({ task: task({ permissionAllowed: false }) }) === null);

  if (opsModel) {
    const vis = resolveStripVisibilityLevel(opsModel);
    push('OCMS_VISIBILITY_OPERATIONS', vis === 'MINIMAL' || vis === 'STANDARD');
    const view = buildCaseContextStripView(opsModel, vis, { focusTaskTitle: opsModel.title });
    push('OCMS_STRIP_TITLE_DEDUP', view?.titleLine == null);
    push(
      'OCMS_FLAG_OFF_HIDES_STRIP',
      resolveStripVisibility(opsModel) === 'HIDDEN' || isOcmsCaseStripEnabled(),
    );
  } else {
    push('OCMS_VISIBILITY_OPERATIONS', false);
    push('OCMS_STRIP_TITLE_DEDUP', false);
    push('OCMS_FLAG_OFF_HIDES_STRIP', !isOcmsCaseStripEnabled());
  }

  const hoSoModel = deriveCaseReadModel({
    task: task({ relatedHoSoId: 'HS-2026-001', title: 'Hồ sơ gia nhập' }),
  });
  if (hoSoModel) {
    push('OCMS_DERIVE_HO_SO_KEY', hoSoModel.caseKey === 'HO_SO:HS-2026-001');
    push('OCMS_VISIBILITY_HO_SO_EXPANDED', resolveStripVisibilityLevel(hoSoModel) === 'EXPANDED');
  } else {
    push('OCMS_DERIVE_HO_SO_KEY', false, 'hoSo model null');
    push('OCMS_VISIBILITY_HO_SO_EXPANDED', false);
  }

  const financeRestricted = deriveCaseReadModel({
    task: task({
      relatedEntityType: 'FINANCE',
      relatedEntityId: 'TX-88',
      title: 'Duyệt chi',
    }),
    operator: { userId: 'u', displayName: 'Staff', role: 'STAFF', permissions: [] },
  });
  if (financeRestricted) {
    const finView = buildCaseContextStripView(financeRestricted, 'EXPANDED');
    push('OCMS_FINANCE_PRIVACY', finView?.warnings.some((w) => w.includes('tài chính bị ẩn')) ?? false);
  } else {
    push('OCMS_FINANCE_PRIVACY', false);
  }

  push('OCMS_DISCOVERY_NONE_UNREADABLE', runCaseDiscovery(undefined)?.outcome !== 'RESOLVED');
  push('OCMS_NO_PERSISTENCE_LAYER', !workspaceSource.includes('CASE_MAIN'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : warnings.length > 1 ? 'GO_WITH_WARNINGS' : 'GO';

  return {
    suite: 'PHASE_OCMS_03_FOCUS_CASE_CONTEXT_STRIP',
    status,
    checks,
    warnings,
  };
}
