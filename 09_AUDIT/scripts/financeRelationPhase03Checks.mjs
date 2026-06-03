#!/usr/bin/env node
/**
 * PHASE_DATA_REL_03 — finance FK repair-plan static checks (no workbook).
 * Phase 03 = plan-only; runtime guards may be added in PHASE 05.
 * This script validates plan/schema content and guard state without NO_GO when guards exist.
 */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..');

const checks = [];
const warnings = [];

function push(id, pass, detail) {
  checks.push({ id, pass, detail: detail || undefined });
}

function read(rel) {
  return readFileSync(join(repoRoot, rel), 'utf8');
}

const finSchema = read('01_SCHEMA/FINANCE_TRANSACTION_SCHEMA.md');
push('FIN_SCHEMA_DON_VI_REF', finSchema.includes('DON_VI_ID') && finSchema.includes('DON_VI'));

const finSvc = read('05_GAS_RUNTIME/30_FINANCE_SERVICE.js');
push('FIN_CREATE_USES_CbvMakeId', finSvc.includes("cbvMakeId('FIN')"));

const hasDonViGuard =
  /financeAssertOptionalDonViId_/.test(finSvc) || /assertActiveDonViId/.test(finSvc);
const logFinanceBlock = finSvc.slice(finSvc.indexOf('function logFinance'));
const logHasParentCheck = logFinanceBlock.includes(
  '_findById(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION, finId)',
);

const plan = read('09_AUDIT/PHASE_DATA_REL_03_FINANCE_RELATION_REPAIR_PLAN.md');
const planDocumentsDeferredGuards =
  plan.includes('PHASE 05') &&
  (plan.includes('assertActiveDonViId') || plan.includes('logFinance')) &&
  plan.includes('deferred');

push('PLAN_DOC_VP54_AND_LEGACY_FIN', plan.includes('VP54') && plan.includes('FIN_20260418'));

const audit = read('09_AUDIT/DATA_RELATIONSHIP_AUDIT_REPORT_20260603.md');
push(
  'VP54_DOCUMENTED_IN_AUDIT',
  audit.includes('VP54') && plan.includes('VP54'),
  'workbook-only code; not in GAS seed',
);

// Guard state: pass if present (Phase 05) OR absent but documented in plan (Phase 03 deferred)
if (hasDonViGuard) {
  push('FIN_DON_VI_GUARD_STATE', true, 'guard present after PHASE_DATA_REL_05');
} else if (planDocumentsDeferredGuards) {
  push('FIN_DON_VI_GUARD_STATE', true, 'guard deferred; documented in PHASE 03 plan');
  warnings.push('DON_VI guard not in runtime — see PHASE_DATA_REL_05');
} else {
  push('FIN_DON_VI_GUARD_STATE', false, 'no guard and no documented deferral in plan');
}

if (logHasParentCheck) {
  push('FIN_LOG_PARENT_GUARD_STATE', true, 'guard present after PHASE_DATA_REL_05');
} else if (planDocumentsDeferredGuards) {
  push('FIN_LOG_PARENT_GUARD_STATE', true, 'guard deferred; documented in PHASE 03 plan');
  warnings.push('logFinance parent guard not in runtime — see PHASE_DATA_REL_05');
} else {
  push('FIN_LOG_PARENT_GUARD_STATE', false, 'no guard and no documented deferral in plan');
}

const taskSvc = read('05_GAS_RUNTIME/20_TASK_SERVICE.js');
push('TASK_CREATE_HAS_DON_VI_GUARD', taskSvc.includes('assertActiveDonViId'));

const phase05ReportExists = (() => {
  try {
    read('09_AUDIT/PHASE_DATA_REL_05_RUNTIME_GUARD_AUDIT_REPORT.md');
    return true;
  } catch {
    return false;
  }
})();
if (hasDonViGuard && logHasParentCheck && phase05ReportExists) {
  push('PHASE05_GUARD_REPORT_ALIGNED', true, 'PHASE_DATA_REL_05 report present');
} else if (!phase05ReportExists && (hasDonViGuard || logHasParentCheck)) {
  warnings.push('Guards in code but PHASE_DATA_REL_05 report missing');
  push('PHASE05_GUARD_REPORT_ALIGNED', true, 'guards in code; report optional for 06A');
}

const failed = checks.filter((c) => !c.pass);
const result = failed.length === 0 ? (warnings.length ? 'GO_WITH_WARNINGS' : 'GO') : 'NO_GO';

const out = {
  suite: 'PHASE_DATA_REL_03_FINANCE_RELATION',
  phase: '03 plan verification (guards may be satisfied by PHASE 05)',
  result,
  checks,
  warnings,
};
console.log(JSON.stringify(out, null, 2));
process.exit(failed.length ? 1 : 0);
