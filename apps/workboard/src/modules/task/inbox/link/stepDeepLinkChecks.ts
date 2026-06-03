/**
 * PHASE_LINK_01 — static step deep link checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildChecklistStepDeepLinkPath } from './stepDeepLink';
import {
  buildStepDeepLinkFocusRequest,
  consumeChecklistStepDeepLink,
} from './stepDeepLinkNavigation';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');

function readRepo(rel: string): string {
  return readFileSync(join(repoRoot, rel.replace(/^\//, '')), 'utf8');
}

export function runStepDeepLinkChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const section = readRepo('apps/workboard/src/modules/task/inbox/checklist/WorkInboxChecklistSection.tsx');
  const row = readRepo('apps/workboard/src/modules/task/inbox/checklist/SmartChecklistItemRow.tsx');
  const types = readRepo('apps/workboard/src/modules/task/inbox/dossier/dossierCrossFocusTypes.ts');
  const contract = readRepo('00_SYSTEM_BRAIN/LINK/LINK_STEP_DEEP_LINK_CONTRACT.md');

  push('QUERY_STEP_PARAM', buildChecklistStepDeepLinkPath('T-1', 'CL-1').includes('step=CL-1'));
  push('INBOX_ROUTE_PATH', buildChecklistStepDeepLinkPath('T-1', 'CL-1').startsWith('/inbox/T-1'));
  push('FOCUS_SOURCE', types.includes('step_deep_link'));

  const req = buildStepDeepLinkFocusRequest('T-1', 'CL-1');
  push('FOCUS_REQUEST', req.source === 'step_deep_link' && req.checklistItemId === 'CL-1');

  const consume = consumeChecklistStepDeepLink('T-1', 'CL-1', ['CL-1']);
  push('CONSUME_PUBLISH', consume.focused === true);

  const stale = consumeChecklistStepDeepLink('T-1', 'CL-missing', ['CL-1']);
  push('STALE_SAFE', stale.status === 'GO_WITH_WARNINGS');

  push('CONSUMER_WIRED', section.includes('useChecklistStepDeepLinkConsumer'));
  push('COPY_UI', row.includes('Copy link bước') && section.includes('copyChecklistStepLinkToClipboard'));
  push('REUSES_CROSS_FOCUS', section.includes('useChecklistCrossFocusListener'));
  push('CONTRACT_DOC', contract.includes('CHECKLIST_STEP_QUERY_KEY') || contract.includes('step='));
  push('NO_SHEET_WRITE', !readRepo('apps/workboard/src/modules/task/inbox/link/stepDeepLinkNavigation.ts').includes('api.'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Live browser open with ?step= not smoke-tested in CI');

  return { suite: 'PHASE_LINK_01_STEP_DEEP_LINK', status, checks, warnings };
}
