#!/usr/bin/env node
/**
 * PHASE_DATA_REL_04 — HO_SO_RELATION authority static checks.
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

const schema = read('05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.js');
push(
  'MANIFEST_HAS_FROM_TO_MASTER',
  schema.includes('FROM_HO_SO_ID') && schema.includes('TO_HO_SO_ID'),
);
push(
  'MANIFEST_HAS_RELATED_TABLE',
  schema.includes('RELATED_TABLE') && schema.includes('RELATED_RECORD_ID'),
);
push(
  'MANIFEST_NO_FROM_TYPE',
  !/FROM_TYPE|TO_TYPE/.test(schema),
  'FROM_TYPE not in bootstrap manifest (expected)',
);

const hosoSvc = read('05_GAS_RUNTIME/10_HOSO_SERVICE.js');
push('GAS_CREATE_HOSO_RELATION', hosoSvc.includes('function createHoSoRelation'));
push('GAS_ADD_HOSO_RELATION', hosoSvc.includes('function addHosoRelation'));
push(
  'GAS_ADD_USES_RELATED_TABLE',
  /addHosoRelation[\s\S]*RELATED_TABLE/.test(hosoSvc),
);

const adr = read('00_SYSTEM_BRAIN/002_DECISIONS/ADR_HO_SO_RELATION_AUTHORITY.md');
push('ADR_HYBRID_DECISION', adr.includes('A + B') && adr.includes('not') && adr.includes('FROM_TYPE'));

const audit = read('09_AUDIT/DATA_RELATIONSHIP_AUDIT_REPORT_20260603.md');
push('AUDIT_NOTES_TYPED_GRAPH', audit.includes('FROM_TYPE'));

if (!schema.includes('FROM_TYPE')) {
  warnings.push('Workbook typed columns (FROM_TYPE) absent from manifest — normalize via migration');
}

const failed = checks.filter((c) => !c.pass);
const result = failed.length === 0 ? (warnings.length ? 'GO_WITH_WARNINGS' : 'GO') : 'NO_GO';

console.log(JSON.stringify({ suite: 'PHASE_DATA_REL_04_HO_SO_RELATION', result, checks, warnings }, null, 2));
process.exit(result === 'NO_GO' ? 1 : 0);
