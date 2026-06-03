/**
 * PHASE_CASE_REFACTOR_03_CASE_WORKSPACE — static checks.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

function readFocus(name: string): string {
  return readFileSync(join(__dir, '..', 'task', 'inbox', 'focusRuntime', name), 'utf8');
}

export function runCaseWorkspaceChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean; detail?: string }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean; detail?: string }[] = [];
  const warnings: string[] = ['RUNTIME_STATE: NOT_WIRED'];
  const push = (id: string, pass: boolean, detail?: string) => checks.push({ id, pass, detail });

  const feature = readLocal('ocmsFeature.ts');
  const workspace = readLocal('CaseWorkspace.tsx');
  const focus = readFocus('FocusTaskWorkspace.tsx');

  push('CW_FLAG', feature.includes('VITE_CASE_WORKSPACE_ENABLED') && feature.includes('isCaseWorkspaceEnabled'));
  push('CW_COMPONENT', workspace.includes('Case Workspace') && workspace.includes('Checklist (Case)'));
  push('CW_FOCUS_BRANCH', focus.includes('caseWorkspaceOn') && focus.includes('<CaseWorkspace'));
  push('CW_LEGACY_PATH', focus.includes('CompactTaskHeader') && focus.includes('FocusContentCards'));
  push('CW_NO_CASE_MAIN', !workspace.includes('CASE_MAIN') && !focus.includes('CASE_MAIN'));
  push('CW_READ_MODEL', workspace.includes('runtimeReadModel') && focus.includes('runtimeReadModel'));
  push('CW_CHECKLIST_WIRED', focus.includes('checklistItems'));
  push('CW_ACTIONS_PRESERVED', focus.includes('FocusActionBar'));
  push('CW_STRIP_IN_WORKSPACE', workspace.includes('WorkInboxCaseContextStrip'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO';

  return { suite: 'PHASE_CASE_REFACTOR_03_CASE_WORKSPACE', status, checks, warnings };
}
