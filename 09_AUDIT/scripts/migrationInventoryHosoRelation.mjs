#!/usr/bin/env node
/**
 * Read-only HO_SO_RELATION inventory: typed graph (C) vs hybrid A+B columns.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { readSheetCsv } from './lib/parseSheetCsv.mjs';

function has(v) {
  return v != null && String(v).trim() !== '';
}

export function inventoryHosoRelation(inputDir) {
  const relPath = join(inputDir, 'HO_SO_RELATION.csv');
  if (!existsSync(relPath)) {
    return { ok: false, error: 'Missing HO_SO_RELATION.csv' };
  }

  const rel = readSheetCsv(relPath);
  let typedGraphOnly = 0;
  let masterPair = 0;
  let polymorphicPair = 0;
  let partialRelated = 0;
  let emptyAuthority = 0;
  const samples = { typedGraphOnly: [], partialRelated: [] };

  for (const row of rel.rows) {
    const fromMaster = has(row.FROM_HO_SO_ID);
    const toMaster = has(row.TO_HO_SO_ID);
    const relTable = has(row.RELATED_TABLE);
    const relId = has(row.RELATED_RECORD_ID);
    const typed =
      has(row.FROM_TYPE) || has(row.FROM_ID) || has(row.TO_TYPE) || has(row.TO_ID);

    if (fromMaster && toMaster) masterPair++;
    if (relTable && relId) polymorphicPair++;
    if ((relTable && !relId) || (!relTable && relId)) {
      partialRelated++;
      if (samples.partialRelated.length < 5) samples.partialRelated.push(row.ID);
    }
    if (typed && !fromMaster && !toMaster && !(relTable && relId)) {
      typedGraphOnly++;
      if (samples.typedGraphOnly.length < 5) samples.typedGraphOnly.push(row.ID);
    }
    if (!fromMaster && !toMaster && !relTable && !relId && !typed) emptyAuthority++;
  }

  return {
    ok: true,
    rowCount: rel.rows.length,
    masterPairCount: masterPair,
    polymorphicPairCount: polymorphicPair,
    typedGraphOnlyCount: typedGraphOnly,
    partialRelatedCount: partialRelated,
    emptyAuthorityCount: emptyAuthority,
    samples,
    summary: {
      migrateTypedGraphToHybrid: typedGraphOnly,
      fixPartialRelated: partialRelated,
    },
  };
}

if (process.argv[1]?.includes('migrationInventoryHosoRelation.mjs')) {
  const inputDir = process.argv[2];
  if (!inputDir) {
    console.error('Usage: node migrationInventoryHosoRelation.mjs <export-dir>');
    process.exit(1);
  }
  console.log(JSON.stringify(inventoryHosoRelation(inputDir), null, 2));
}
