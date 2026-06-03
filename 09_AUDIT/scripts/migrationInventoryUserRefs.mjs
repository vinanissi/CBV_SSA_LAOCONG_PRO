#!/usr/bin/env node
/**
 * Read-only user-ref drift inventory from exported CSVs.
 * Expects: USER_DIRECTORY.csv, TASK_MAIN.csv, optional TASK_CHECKLIST.csv, TASK_UPDATE_LOG.csv, FINANCE_LOG.csv
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { colValues, readSheetCsv, unique } from './lib/parseSheetCsv.mjs';

const DRIFT_PATTERNS = [
  { class: 'USR_LOCAL', re: /^USR-LOCAL-/i },
  { class: 'UAT_OPERATOR', re: /^UAT_OPERATOR$/i },
  { class: 'SYSTEM_LITERAL', re: /^system$/i },
  { class: 'EMAIL', re: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i },
];

function classifyValue(v) {
  const s = String(v).trim();
  if (!s) return 'EMPTY';
  for (const p of DRIFT_PATTERNS) {
    if (p.re.test(s)) return p.class;
  }
  return 'OTHER';
}

function countField(rows, field, validIds) {
  const values = colValues(rows, field);
  const byClass = {};
  let invalidFk = 0;
  for (const v of values) {
    const c = classifyValue(v);
    byClass[c] = (byClass[c] || 0) + 1;
    if (c === 'OTHER' && validIds && !validIds.has(v)) invalidFk++;
  }
  return { field, totalNonEmpty: values.length, byClass, invalidFk };
}

export function inventoryUserRefs(inputDir) {
  const dir = inputDir;
  const userPath = join(dir, 'USER_DIRECTORY.csv');
  const taskPath = join(dir, 'TASK_MAIN.csv');
  if (!existsSync(userPath) || !existsSync(taskPath)) {
    return {
      ok: false,
      error: 'Missing USER_DIRECTORY.csv or TASK_MAIN.csv',
      required: ['USER_DIRECTORY.csv', 'TASK_MAIN.csv'],
    };
  }

  const users = readSheetCsv(userPath);
  const tasks = readSheetCsv(taskPath);
  const validIds = new Set(colValues(users.rows, 'ID'));

  const fields = [
    { sheet: 'TASK_MAIN', rows: tasks.rows, field: 'OWNER_ID' },
    { sheet: 'TASK_MAIN', rows: tasks.rows, field: 'REPORTER_ID' },
  ];

  const optional = [
    ['TASK_CHECKLIST.csv', 'DONE_BY'],
    ['TASK_UPDATE_LOG.csv', 'ACTOR_ID'],
    ['FINANCE_LOG.csv', 'ACTOR_ID'],
    ['HO_SO_MASTER.csv', 'OWNER_ID'],
  ];
  for (const [file, field] of optional) {
    const p = join(dir, file);
    if (existsSync(p)) {
      const sheet = readSheetCsv(p);
      fields.push({ sheet: file.replace('.csv', ''), rows: sheet.rows, field });
    }
  }

  const counts = fields.map(({ sheet, rows, field }) => ({
    sheet,
    ...countField(rows, field, field === 'ACTOR_ID' ? null : validIds),
  }));

  const directoryIdCount = validIds.size;

  return {
    ok: true,
    directoryIdCount,
    directoryIdsSample: [...validIds].slice(0, 8),
    fieldCounts: counts,
    summary: {
      usrLocalHits: counts.reduce((n, c) => n + (c.byClass?.USR_LOCAL || 0), 0),
      uatOperatorHits: counts.reduce((n, c) => n + (c.byClass?.UAT_OPERATOR || 0), 0),
      systemHits: counts.reduce((n, c) => n + (c.byClass?.SYSTEM_LITERAL || 0), 0),
      invalidAssignmentFk: counts
        .filter((c) => c.field === 'OWNER_ID' || c.field === 'REPORTER_ID' || c.field === 'DONE_BY')
        .reduce((n, c) => n + (c.invalidFk || 0), 0),
    },
  };
}

if (process.argv[1]?.includes('migrationInventoryUserRefs.mjs')) {
  const inputDir = process.argv[2];
  if (!inputDir) {
    console.error('Usage: node migrationInventoryUserRefs.mjs <export-dir>');
    process.exit(1);
  }
  console.log(JSON.stringify(inventoryUserRefs(inputDir), null, 2));
}
