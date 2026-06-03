#!/usr/bin/env node
/**
 * PHASE_DATA_REL_12 — schema manifest vs authority doc alignment (static).
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const repoRoot = join(import.meta.dirname, '..', '..');
const checks = [];
const warnings = [];

function push(id, pass, detail) {
  checks.push({ id, pass, detail });
}

function read(rel) {
  return readFileSync(join(repoRoot, rel), 'utf8');
}

function exists(rel) {
  return existsSync(join(repoRoot, rel));
}

const manifest = read('05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.js');
const auditSchema = read('05_GAS_RUNTIME/90_BOOTSTRAP_AUDIT_SCHEMA.js');
const taskMainSchema = read('01_SCHEMA/TASK_MAIN_SCHEMA.md');
const taskContract = read('03_SHARED/TASK_KEY_CONTRACT.md');
const authorityIndex = read('03_SHARED/DATA_REL_AUTHORITY_INDEX.md');
const userMap = read('03_SHARED/USER_TASK_FINANCE_MAPPING.md');
const adr = read('00_SYSTEM_BRAIN/002_DECISIONS/ADR_HO_SO_RELATION_AUTHORITY.md');
const sheetDict = read('03_SHARED/SHEET_DICTIONARY_MASTER.md');
const dataModel = read('02_MODULES/HO_SO/DATA_MODEL.md');

const taskMainBlock = manifest.match(/TASK_MAIN:\s*\[([\s\S]*?)\]/);
const taskMainCols = taskMainBlock ? taskMainBlock[1].match(/'([^']+)'/g).map((s) => s.slice(1, -1)) : [];

push(
  'AUTHORITY_INDEX_EXISTS',
  authorityIndex.includes('Data Relationship Authority Index') && authorityIndex.includes('PHASE_DATA_REL_12'),
);
push('INDEX_LINKS_TASK_CONTRACT', authorityIndex.includes('TASK_KEY_CONTRACT.md'));
push('INDEX_LINKS_ADR', authorityIndex.includes('ADR_HO_SO_RELATION_AUTHORITY.md'));
push('INDEX_LINKS_BOOTSTRAP', authorityIndex.includes('90_BOOTSTRAP_SCHEMA.js'));

push('CONTRACT_LINKS_INDEX', taskContract.includes('DATA_REL_AUTHORITY_INDEX.md'));
push('USER_MAP_LINKS_INDEX', userMap.includes('DATA_REL_AUTHORITY_INDEX.md'));

push('MANIFEST_TASK_ID_FIRST', taskMainCols[0] === 'ID');
push('MANIFEST_NO_TASK_MAIN_TASK_ID_COL', !taskMainCols.includes('TASK_ID'));
push(
  'MANIFEST_SHARED_WITH_IS_PRIVATE',
  taskMainCols.includes('SHARED_WITH') && taskMainCols.includes('IS_PRIVATE'),
);
const swIdx = taskMainCols.indexOf('SHARED_WITH');
const privIdx = taskMainCols.indexOf('IS_PRIVATE');
const repIdx = taskMainCols.indexOf('REPORTER_ID');
push(
  'MANIFEST_VISIBILITY_AFTER_REPORTER',
  swIdx > repIdx && privIdx > swIdx,
  `REPORTER=${repIdx} SHARED_WITH=${swIdx} IS_PRIVATE=${privIdx}`,
);

push('AUDIT_FK_TASK_CHILD', auditSchema.includes("childCol: 'TASK_ID', parent: 'TASK_MAIN', parentKey: 'ID'"));
push('AUDIT_OPTIONAL_SHARED_PRIVATE', /TASK_MAIN:[\s\S]*optionalColumns:[\s\S]*SHARED_WITH[\s\S]*IS_PRIVATE/.test(auditSchema));

push('TASK_SCHEMA_SHARED_WITH', taskMainSchema.includes('SHARED_WITH'));
push('TASK_SCHEMA_IS_PRIVATE', taskMainSchema.includes('IS_PRIVATE'));
push('TASK_SCHEMA_NO_MAIN_TASK_ID', !taskMainSchema.includes('TASK_MAIN.TASK_ID') || taskMainSchema.includes('no `TASK_MAIN.TASK_ID`'));
push('TASK_SCHEMA_LINKS_CONTRACT', taskMainSchema.includes('TASK_KEY_CONTRACT.md'));

push('ADR_HYBRID_AB', adr.includes('A + B'));
push('DATA_MODEL_NO_FROM_TYPE_AUTHORITY', dataModel.includes('FROM_TYPE') && dataModel.includes('not') && dataModel.includes('authority'));

const hosoRelBlock = manifest.match(/HO_SO_RELATION:\s*\[([\s\S]*?)\]/);
const hosoCols = hosoRelBlock ? hosoRelBlock[1].match(/'([^']+)'/g).map((s) => s.slice(1, -1)) : [];
push(
  'MANIFEST_HOSO_HYBRID_COLS',
  ['FROM_HO_SO_ID', 'TO_HO_SO_ID', 'RELATED_TABLE', 'RELATED_RECORD_ID'].every((c) => hosoCols.includes(c)),
);
push('MANIFEST_HOSO_NO_FROM_TYPE', !hosoCols.includes('FROM_TYPE'));

const reportPaths = [
  '09_AUDIT/PHASE_DATA_REL_01_TASK_KEY_CONTRACT_REPORT.md',
  '09_AUDIT/PHASE_DATA_REL_04_HO_SO_RELATION_AUTHORITY_DECISION.md',
  '09_AUDIT/PHASE_GAS_WRITE_GUARD_COVERAGE_REPORT.md',
];
for (const p of reportPaths) {
  push(`REPORT_${p.split('/').pop().replace('.md', '')}`, exists(p));
}

if (sheetDict.includes('TASK_TYPE: enum TASK_TYPE') || sheetDict.includes('RESULT_NOTE')) {
  warnings.push('SHEET_DICTIONARY_MASTER.md still uses legacy TASK_MAIN labels — manifest wins; full dictionary refresh deferred');
}
if (!sheetDict.includes('SHARED_WITH')) {
  warnings.push('SHEET_DICTIONARY_MASTER TASK_MAIN section missing SHARED_WITH / IS_PRIVATE');
}

const failed = checks.filter((c) => !c.pass);
const result = failed.length ? 'NO_GO' : warnings.length ? 'GO_WITH_WARNINGS' : 'GO';

console.log(
  JSON.stringify(
    { suite: 'PHASE_DATA_REL_12_SCHEMA_AUTHORITY_DOC_SWEEP', phase: '12', result, checks, warnings },
    null,
    2,
  ),
);
process.exit(failed.length ? 1 : 0);
