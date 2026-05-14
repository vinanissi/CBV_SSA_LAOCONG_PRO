/**
 * CBV — Marker contract self-check (pre-commit / local)
 *
 * Validates one or more marker contracts:
 * - M06 workboard: CBV_WORKBOARD_MARKER_CONTRACT.json ↔ WEBAPP_STAFF_WORKBOARD.html ↔ 998Z
 * - M07 live bridge: CBV_M07_APPSHEET_LIVE_BRIDGE_MARKER_CONTRACT.json ↔ same HTML ↔ 999C
 *
 * Usage: node scripts/cbv-marker-contract-self-check.mjs
 * Exit 1 if any contract has missingMarkers.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const CONTRACTS = [
  {
    id: 'M06_WORKBOARD',
    json: path.join(
      ROOT,
      '00_SYSTEM_BRAIN',
      '000_TEST_CONSOLE',
      'CBV_TCS_V1',
      'contracts',
      'CBV_WORKBOARD_MARKER_CONTRACT.json'
    ),
    htmlRel: path.join('05_GAS_RUNTIME', 'html', 'WEBAPP_STAFF_WORKBOARD.html'),
    zRel: path.join('05_GAS_RUNTIME', '998Z_MILESTONE_06_STAFF_WORKBOARD_TEST_CONSOLE.js')
  },
  {
    id: 'M07_APPSHEET_LIVE_BRIDGE',
    json: path.join(
      ROOT,
      '00_SYSTEM_BRAIN',
      '000_TEST_CONSOLE',
      'CBV_TCS_V1',
      'contracts',
      'CBV_M07_APPSHEET_LIVE_BRIDGE_MARKER_CONTRACT.json'
    ),
    htmlRel: path.join('05_GAS_RUNTIME', 'html', 'WEBAPP_STAFF_WORKBOARD.html'),
    zRel: path.join('05_GAS_RUNTIME', '999C_MILESTONE_07_APPSHEET_LIVE_BRIDGE_TEST_CONSOLE.js')
  }
];

function readUtf8(p) {
  return fs.readFileSync(p, 'utf8');
}

function validateContract(entry) {
  const contract = JSON.parse(readUtf8(entry.json));
  const required = contract.requiredMarkers || [];
  const htmlPath = path.join(ROOT, entry.htmlRel);
  const zPath = path.join(ROOT, entry.zRel);
  const html = readUtf8(htmlPath);
  const zJs = readUtf8(zPath);

  const attr = contract.probeSelectors?.htmlAttribute || 'data-cbv-marker-probe';
  const val = contract.probeSelectors?.htmlAttributeValue || '1';
  const probeAttr = attr + '="' + val + '"';

  const missingHtml = [];
  const missingZ = [];

  for (const m of required) {
    if (!html.includes(m)) missingHtml.push(m);
    if (!zJs.includes(m)) missingZ.push(m);
  }

  if (!html.includes(probeAttr)) {
    missingHtml.push('(probe attribute ' + probeAttr + ')');
  }

  return {
    id: entry.id,
    requiredCount: required.length,
    htmlRel: entry.htmlRel,
    zRel: entry.zRel,
    missingHtml,
    missingZ
  };
}

function main() {
  let failed = false;
  for (const entry of CONTRACTS) {
    if (!fs.existsSync(entry.json)) {
      console.error('[cbv-marker-contract] Missing contract JSON:', entry.json);
      failed = true;
      continue;
    }
    const r = validateContract(entry);
    console.log('[cbv-marker-contract]', r.id, 'requiredMarkers count:', r.requiredCount);
    console.log('[cbv-marker-contract]', r.id, 'HTML:', r.htmlRel);
    console.log('[cbv-marker-contract]', r.id, 'missing in HTML:', r.missingHtml.length ? r.missingHtml.join(', ') : '(none)');
    console.log('[cbv-marker-contract]', r.id, 'missing in console JS:', r.missingZ.length ? r.missingZ.join(', ') : '(none)');
    if (r.missingHtml.length || r.missingZ.length) {
      failed = true;
    }
  }

  if (failed) {
    console.error('[cbv-marker-contract] FAIL — fix HTML probe and/or milestone test console JS before commit/push.');
    process.exit(1);
  }
  console.log('[cbv-marker-contract] OK (all contracts)');
}

main();
