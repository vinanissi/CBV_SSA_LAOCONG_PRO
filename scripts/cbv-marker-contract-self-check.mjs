/**
 * CBV — Marker contract self-check (pre-commit / local)
 *
 * Rules:
 * - Every marker in CBV_WORKBOARD_MARKER_CONTRACT.json must appear in the HTML probe template.
 * - Every marker must appear as a substring in 998Z (so Test Console checks stay aligned).
 *
 * Usage: node scripts/cbv-marker-contract-self-check.mjs
 * Exit 1 if missingMarkers non-empty.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const CONTRACT = path.join(
  ROOT,
  '00_SYSTEM_BRAIN',
  '000_TEST_CONSOLE',
  'CBV_TCS_V1',
  'contracts',
  'CBV_WORKBOARD_MARKER_CONTRACT.json'
);
const HTML_REL = path.join('05_GAS_RUNTIME', 'html', 'WEBAPP_STAFF_WORKBOARD.html');
const Z_REL = path.join('05_GAS_RUNTIME', '998Z_MILESTONE_06_STAFF_WORKBOARD_TEST_CONSOLE.js');

function readUtf8(p) {
  return fs.readFileSync(p, 'utf8');
}

function main() {
  const contract = JSON.parse(readUtf8(CONTRACT));
  const required = contract.requiredMarkers || [];
  const htmlPath = path.join(ROOT, HTML_REL);
  const zPath = path.join(ROOT, Z_REL);
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

  console.log('[cbv-marker-contract] requiredMarkers count:', required.length);
  console.log('[cbv-marker-contract] HTML:', HTML_REL);
  console.log('[cbv-marker-contract] missing in HTML:', missingHtml.length ? missingHtml.join(', ') : '(none)');
  console.log('[cbv-marker-contract] missing in 998Z:', missingZ.length ? missingZ.join(', ') : '(none)');

  if (missingHtml.length || missingZ.length) {
    console.error('[cbv-marker-contract] FAIL — fix HTML probe and/or 998Z before commit/push.');
    process.exit(1);
  }
  console.log('[cbv-marker-contract] OK');
}

main();
