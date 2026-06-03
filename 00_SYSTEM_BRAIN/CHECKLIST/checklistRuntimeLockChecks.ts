/**
 * PHASE_CHECKLIST_RUNTIME_LOCK — lock artifact + prerequisite regression gate.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..');
const workboardRoot = join(repoRoot, 'apps/workboard');
const readRepo = (rel: string) => readFileSync(join(repoRoot, rel), 'utf8');
const existsRepo = (rel: string) => existsSync(join(repoRoot, rel));

type SuiteResult = { suite: string; status: string };

const PREREQ_PHASES = [
  'PHASE_CHECKLIST_01_INTERACTION_FEEDBACK',
  'PHASE_CHECKLIST_02_TOAST_NOTIFICATION',
  'PHASE_CHECKLIST_03_FOCUS_STEP_MODE',
  'PHASE_CHECKLIST_04_PROGRESS_VISUALIZATION',
  'PHASE_CHECKLIST_05_COPY_LINK_UX',
  'PHASE_CHECKLIST_06_COMMENT_SIGNALING',
  'PHASE_CHECKLIST_07_OPERATOR_POLISH',
  'PHASE_CHECKLIST_08_COMPACT_ROW_MODE',
  'PHASE_CHECKLIST_09_FOCUS_WORKSPACE',
  'PHASE_CHECKLIST_10_DUAL_PANE_RUNTIME',
] as const;

/** Modules that export `run*Checks()` — invoked via dynamic import. */
const IMPORT_RUNNERS: { phase: (typeof PREREQ_PHASES)[number]; path: string; exportName: string }[] = [
  {
    phase: 'PHASE_CHECKLIST_01_INTERACTION_FEEDBACK',
    path: 'apps/workboard/src/modules/task/inbox/checklist/checklistInteractionFeedbackChecks.ts',
    exportName: 'runChecklistInteractionFeedbackChecks',
  },
  {
    phase: 'PHASE_CHECKLIST_02_TOAST_NOTIFICATION',
    path: 'apps/workboard/src/modules/task/inbox/checklist/checklistToastNotificationChecks.ts',
    exportName: 'runChecklistToastNotificationChecks',
  },
  {
    phase: 'PHASE_CHECKLIST_03_FOCUS_STEP_MODE',
    path: 'apps/workboard/src/modules/task/inbox/checklist/checklistFocusStepModeChecks.ts',
    exportName: 'runChecklistFocusStepModeChecks',
  },
];

/** Scripts with top-level JSON console output — run via tsx spawn. */
const SPAWN_RUNNERS: { phase: (typeof PREREQ_PHASES)[number]; workboardRel: string }[] = [
  {
    phase: 'PHASE_CHECKLIST_04_PROGRESS_VISUALIZATION',
    workboardRel: 'src/modules/task/inbox/checklist/checklistProgressVisualizationChecks.ts',
  },
  {
    phase: 'PHASE_CHECKLIST_05_COPY_LINK_UX',
    workboardRel: 'src/modules/task/inbox/checklist/checklistCopyLinkUxChecks.ts',
  },
  {
    phase: 'PHASE_CHECKLIST_06_COMMENT_SIGNALING',
    workboardRel: 'src/modules/task/inbox/checklist/checklistCommentSignalingChecks.ts',
  },
  {
    phase: 'PHASE_CHECKLIST_07_OPERATOR_POLISH',
    workboardRel: 'src/modules/task/inbox/checklist/checklistOperatorPolishChecks.ts',
  },
  {
    phase: 'PHASE_CHECKLIST_08_COMPACT_ROW_MODE',
    workboardRel: 'src/modules/task/inbox/checklist/checklistCompactRowModeChecks.ts',
  },
  {
    phase: 'PHASE_CHECKLIST_09_FOCUS_WORKSPACE',
    workboardRel: 'src/modules/task/inbox/checklist/checklistFocusWorkspaceChecks.ts',
  },
  {
    phase: 'PHASE_CHECKLIST_10_DUAL_PANE_RUNTIME',
    workboardRel: 'src/modules/task/inbox/checklist/checklistDualPaneRuntimeChecks.ts',
  },
];

function parseStdout(stdout: string): SuiteResult | null {
  const marker = stdout.lastIndexOf('"suite"');
  if (marker < 0) return null;
  const start = stdout.lastIndexOf('{', marker);
  if (start < 0) return null;
  try {
    return JSON.parse(stdout.slice(start)) as SuiteResult;
  } catch {
    return null;
  }
}

function runSpawn(workboardRel: string): { ok: boolean; status?: string } {
  const r = spawnSync('npx', ['tsx', workboardRel], {
    cwd: workboardRoot,
    shell: true,
    encoding: 'utf8',
  });
  if (r.status !== 0) return { ok: false, status: `exit ${r.status}` };
  const parsed = parseStdout(r.stdout ?? '');
  if (!parsed) return { ok: false, status: 'PARSE_ERROR' };
  return { ok: parsed.status !== 'FAIL', status: parsed.status };
}

async function runImport(repoPath: string, exportName: string): Promise<{ ok: boolean; status?: string }> {
  const mod = await import(pathToFileURL(join(repoRoot, repoPath)).href);
  const fn = mod[exportName] as (() => SuiteResult) | undefined;
  if (typeof fn !== 'function') return { ok: false, status: 'NO_EXPORT' };
  const parsed = fn();
  return { ok: parsed.status !== 'FAIL', status: parsed.status };
}

async function main() {
  const registry = readRepo('00_SYSTEM_BRAIN/006_PHASES/PHASE_REGISTRY.md');
  const lock = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_RUNTIME_V1_LOCK.md');

  const checks: { id: string; pass: boolean; detail?: string }[] = [];
  const push = (id: string, pass: boolean, detail?: string) => checks.push({ id, pass, detail });

  push(
    'T01_PREREQ_PHASES_RECORDED',
    PREREQ_PHASES.every((p) => registry.includes(p)),
    'All phases 01-10 in PHASE_REGISTRY',
  );

  push(
    'T01b_PREREQ_REPORTS_EXIST',
    PREREQ_PHASES.every((p) => existsRepo(`00_SYSTEM_BRAIN/000_REPORTS/${p}_REPORT.md`)),
  );

  push(
    'T02_LOCK_ARTIFACT',
    existsRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_RUNTIME_V1_LOCK.md') &&
      lock.includes('CONDITIONAL_LOCK') &&
      lock.includes('Checklist Runtime'),
  );

  push(
    'T03_REGRESSION_BASELINE',
    existsRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_RUNTIME_V1_REGRESSION_BASELINE.md') &&
      readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_RUNTIME_V1_REGRESSION_BASELINE.md').includes('RB-11'),
  );

  push('T04_OPERATOR_UAT', existsRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_RUNTIME_V1_OPERATOR_UAT.md'));

  push('T05_GOVERNANCE_LOCK', existsRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_RUNTIME_V1_GOVERNANCE_LOCK.md'));

  push(
    'T06_LOCKED_CAPABILITIES',
    lock.includes('Interaction feedback') && lock.includes('Dual pane runtime'),
  );

  push(
    'T07_LIMITATIONS_WARNINGS',
    lock.includes('Known limitations') && lock.includes('Open warnings'),
  );

  push('T08_UNLOCK_CONDITIONS', lock.includes('Unlock conditions'));

  push(
    'T09_FUTURE_CHANGE_PROCESS',
    readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_RUNTIME_V1_GOVERNANCE_LOCK.md').includes(
      'Required future phase process',
    ),
  );

  push(
    'T10_GOVERNANCE_ONLY_PHASE',
    existsRepo('00_SYSTEM_BRAIN/000_REPORTS/PHASE_CHECKLIST_RUNTIME_LOCK_REPORT.md') &&
      readRepo('00_SYSTEM_BRAIN/000_REPORTS/PHASE_CHECKLIST_RUNTIME_LOCK_REPORT.md').includes(
        'governance-only',
      ),
  );

  push(
    'T11_LINK_COMPAT',
    lock.includes('LINK Runtime v1') && existsRepo('00_SYSTEM_BRAIN/LINK/LINK_RUNTIME_V1_LOCK.md'),
  );

  push('T12_SHEET_COMPAT', lock.includes('Sheet runtime latency'));

  for (const { phase, path, exportName } of IMPORT_RUNNERS) {
    const run = await runImport(path, exportName);
    push(`T13_${phase}`, run.ok, run.status);
  }

  for (const { phase, workboardRel } of SPAWN_RUNNERS) {
    const run = runSpawn(workboardRel);
    push(`T13_${phase}`, run.ok, run.status);
  }

  const linkStep = await runImport(
    'apps/workboard/src/modules/task/inbox/link/stepDeepLinkChecks.ts',
    'runStepDeepLinkChecks',
  );
  push('T13_LINK_STEP', linkStep.ok, linkStep.status);

  const linkDeferred = await runImport(
    'apps/workboard/src/modules/task/inbox/link/deferredStepResolutionChecks.ts',
    'runDeferredStepResolutionChecks',
  );
  push('T13_LINK_DEFERRED', linkDeferred.ok, linkDeferred.status);

  const sheet = await runImport(
    'apps/workboard/src/modules/task/sheetRuntimeLatencyWarningFixChecks.ts',
    'runSheetRuntimeLatencyWarningFixChecks',
  );
  push('T13_SHEET_LATENCY', sheet.ok, sheet.status);

  const failed = checks.filter((c) => !c.pass);
  const warnings = [
    'Prerequisite phases recorded as GO_WITH_WARNINGS in registry (accepted for CONDITIONAL_LOCK)',
    'Operator UAT (RB-18) not executed in CI — see CHECKLIST_RUNTIME_V1_OPERATOR_UAT.md',
    'Lock status is CONDITIONAL_LOCK not PRODUCTION_LOCK',
  ];

  console.log(
    JSON.stringify(
      {
        suite: 'PHASE_CHECKLIST_RUNTIME_LOCK',
        status: failed.length ? 'FAIL' : 'GO_WITH_WARNINGS',
        lockStatus: failed.length ? 'LOCK_FAILED' : 'CONDITIONAL_LOCK',
        checks,
        warnings,
      },
      null,
      2,
    ),
  );

  if (failed.length) {
    console.error(`FAILED: ${failed.map((c) => c.id).join(', ')}`);
    process.exit(1);
  }
}

void main();
