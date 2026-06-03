#!/usr/bin/env node
/**
 * Read-only finance FK inventory: DON_VI_ID orphans, VP54, FINANCE_LOG.FIN_ID orphans.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { colValues, readSheetCsv, unique } from './lib/parseSheetCsv.mjs';

export function inventoryFinance(inputDir) {
  const finPath = join(inputDir, 'FINANCE_TRANSACTION.csv');
  const logPath = join(inputDir, 'FINANCE_LOG.csv');
  const donViPath = join(inputDir, 'DON_VI.csv');

  if (!existsSync(finPath)) {
    return { ok: false, error: 'Missing FINANCE_TRANSACTION.csv' };
  }

  const fin = readSheetCsv(finPath);
  const donViIds = existsSync(donViPath)
    ? new Set(colValues(readSheetCsv(donViPath).rows, 'ID'))
    : null;
  const donViCodes = existsSync(donViPath)
    ? new Set(colValues(readSheetCsv(donViPath).rows, 'CODE'))
    : null;

  const txnIds = new Set(colValues(fin.rows, 'ID'));
  const donViCol = fin.rows.map((r) => ({
    id: r.ID,
    donViId: r.DON_VI_ID || '',
  }));

  const vp54Rows = donViCol.filter((r) => r.donViId === 'VP54');
  const orphanDonVi = donViIds
    ? donViCol.filter((r) => r.donViId && !donViIds.has(r.donViId))
    : [];
  const codeNotId = donViCodes
    ? donViCol.filter((r) => r.donViId && donViCodes.has(r.donViId) && !donViIds?.has(r.donViId))
    : [];

  let logOrphans = [];
  let legacyFinIds = [];
  if (existsSync(logPath)) {
    const logs = readSheetCsv(logPath);
    for (const row of logs.rows) {
      const finId = row.FIN_ID || '';
      if (!finId) continue;
      if (!txnIds.has(finId)) {
        logOrphans.push({ logId: row.ID, finId });
        if (/^FIN_\d{8}_/i.test(finId)) legacyFinIds.push(finId);
      }
    }
  }

  return {
    ok: true,
    transactionCount: fin.rows.length,
    donViIdProvided: !donViIds,
    vp54RowCount: vp54Rows.length,
    vp54TransactionIds: vp54Rows.map((r) => r.id),
    orphanDonViIdCount: orphanDonVi.length,
    orphanDonViSamples: orphanDonVi.slice(0, 10),
    donViIdLooksLikeCodeCount: codeNotId.length,
    financeLogOrphanCount: logOrphans.length,
    financeLogOrphanSamples: logOrphans.slice(0, 10),
    legacyFinIdPatternCount: unique(legacyFinIds).length,
    legacyFinIdSamples: unique(legacyFinIds).slice(0, 8),
    summary: {
      needsDonViMigration: vp54Rows.length + orphanDonVi.length,
      needsFinIdMigration: logOrphans.length,
    },
  };
}

if (process.argv[1]?.includes('migrationInventoryFinance.mjs')) {
  const inputDir = process.argv[2];
  if (!inputDir) {
    console.error('Usage: node migrationInventoryFinance.mjs <export-dir>');
    process.exit(1);
  }
  console.log(JSON.stringify(inventoryFinance(inputDir), null, 2));
}
