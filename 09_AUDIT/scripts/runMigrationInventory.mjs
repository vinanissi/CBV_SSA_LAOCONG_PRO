#!/usr/bin/env node
/**
 * PHASE_DATA_REL_14 — run read-only migration inventories (repo baseline + optional CSV export dir).
 *
 * Usage:
 *   node 09_AUDIT/scripts/runMigrationInventory.mjs
 *   node 09_AUDIT/scripts/runMigrationInventory.mjs --input-dir path/to/export
 *   node 09_AUDIT/scripts/runMigrationInventory.mjs --input-dir 09_AUDIT/fixtures/migration-inventory-sample
 */
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inventoryFinance } from './migrationInventoryFinance.mjs';
import { inventoryHosoRelation } from './migrationInventoryHosoRelation.mjs';
import { inventoryUserRefs } from './migrationInventoryUserRefs.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..');

function parseArgs(argv) {
  let inputDir = null;
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--input-dir' && argv[i + 1]) {
      inputDir = argv[i + 1];
      i++;
    } else if (!argv[i].startsWith('-')) {
      inputDir = argv[i];
    }
  }
  if (inputDir && !existsSync(inputDir)) {
    const rel = join(repoRoot, inputDir);
    if (existsSync(rel)) inputDir = rel;
  }
  return { inputDir };
}

/** Documented counts from DATA_RELATIONSHIP_AUDIT_REPORT_20260603.md (no sheet I/O). */
function repoBaselineInventory() {
  return {
    source: '09_AUDIT/DATA_RELATIONSHIP_AUDIT_REPORT_20260603.md',
    readOnly: true,
    userRef: {
      TASK_MAIN_rows: 106,
      USER_DIRECTORY_rows: 8,
      drift: {
        USR_LOCAL_STAFF_OWNER: '1+',
        USR_LOCAL_MGR_REPORTER: '1+',
        UAT_OPERATOR: 2,
        USR_LOCAL_DONE_BY: 3,
        system_ACTOR_ID: '~132 combined',
      },
    },
    finance: {
      FINANCE_TRANSACTION_rows: 9,
      DON_VI_VP54_rows: 4,
      FINANCE_LOG_orphan_FIN_ID: 8,
      FINANCE_LOG_system_ACTOR: 12,
    },
    hoso: {
      HO_SO_RELATION_rows: 18,
      FROM_HO_SO_ID_empty_WITH_typed_graph: 'workbook drift (C populated, A empty)',
    },
    repoCodeDrift: {
      USR_LOCAL_defined_in: [
        'workers/api/src/auth/userContext.ts',
        'workers/api/src/adapters/taskWriteStore.ts',
        'apps/workboard/src/modules/task/TaskCreateForm.tsx',
      ],
      VP54_in_repo_source: 0,
    },
  };
}

const { inputDir } = parseArgs(process.argv);
const out = {
  suite: 'PHASE_DATA_REL_14_MIGRATION_INVENTORY',
  runAt: new Date().toISOString(),
  readOnly: true,
  inputDir: inputDir || null,
  repoBaseline: repoBaselineInventory(),
  csvInventories: {},
};

if (inputDir) {
  out.csvInventories.userRefs = inventoryUserRefs(inputDir);
  out.csvInventories.finance = inventoryFinance(inputDir);
  out.csvInventories.hosoRelation = inventoryHosoRelation(inputDir);
  const allOk = Object.values(out.csvInventories).every((x) => x.ok);
  out.csvResult = allOk ? 'GO' : 'INCOMPLETE_INPUT';
} else {
  out.csvResult = 'SKIPPED_NO_INPUT_DIR';
  out.hint =
    'Export sheet tabs to CSV (see 09_AUDIT/templates/migration-inventory/EXPORT_MANIFEST.md) and re-run with --input-dir';
}

const hasMigrationNeed =
  out.repoBaseline.finance.DON_VI_VP54_rows > 0 ||
  out.repoBaseline.hoso.HO_SO_RELATION_rows > 0 ||
  (out.csvInventories.finance?.summary?.needsDonViMigration > 0) ||
  (out.csvInventories.hosoRelation?.summary?.migrateTypedGraphToHybrid > 0);

out.overall = hasMigrationNeed ? 'GO_WITH_WARNINGS' : 'GO';
out.migrationBacklog = {
  phase02_user_refs: 'PLAN_ONLY — run csv inventory before UD_SYSTEM seed',
  phase03_finance: 'PLAN_ONLY — VP54 + FIN_20260418_* map',
  phase04_hoso: 'PLAN_ONLY — typed graph → hybrid A+B',
};

console.log(JSON.stringify(out, null, 2));
process.exit(0);
