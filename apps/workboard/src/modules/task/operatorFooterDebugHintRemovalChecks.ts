/**
 * PHASE_OPERATOR_FOOTER_DEBUG_HINT_REMOVAL — static checks.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..');
const readRepo = (rel: string) => readFileSync(join(repoRoot, rel), 'utf8');

const statusBar = readRepo('apps/workboard/src/components/runtime/RuntimeStatusBar.tsx');
const devMode = readRepo('apps/workboard/src/shared/utils/operatorDevMode.ts');
const authority = readRepo('00_SYSTEM_BRAIN/OPERATOR/OPERATOR_FOOTER_AUTHORITY.md');
const envExample = readRepo('apps/workboard/.env.example');

const checks = [
  { id: 'HINTS_GATED', pass: statusBar.includes('isOperatorDevMode') && statusBar.includes('showDevShortcutHints') },
  { id: 'DEV_MODE_FLAG', pass: devMode.includes('VITE_CBV_DEV_MODE') },
  {
    id: 'HINTS_CONDITIONAL_RENDER',
    pass: statusBar.includes('showDevShortcutHints ?') && statusBar.includes('runtime-console-shortcuts'),
  },
  { id: 'CONST_RETAINED', pass: statusBar.includes('RUNTIME_SHORTCUT_HINTS') && statusBar.includes('J/K queue') },
  { id: 'FOOTER_PRESERVED', pass: statusBar.includes('operational-status-bar') && statusBar.includes('RuntimeTelemetryInline') },
  { id: 'ENV_DOCUMENTED', pass: envExample.includes('VITE_CBV_DEV_MODE') },
  { id: 'AUTHORITY_DOC', pass: authority.includes('Forbidden in operator runtime') },
];

const failed = checks.filter((c) => !c.pass);
console.log(
  JSON.stringify(
    { suite: 'PHASE_OPERATOR_FOOTER_DEBUG_HINT_REMOVAL', status: failed.length ? 'FAIL' : 'GO', checks },
    null,
    2,
  ),
);
if (failed.length) {
  console.error(`FAILED: ${failed.map((c) => c.id).join(', ')}`);
  process.exit(1);
}
