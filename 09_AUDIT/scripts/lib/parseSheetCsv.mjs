/**
 * Minimal CSV reader for admin-exported sheet tabs (UTF-8, comma, optional quotes).
 */
import { readFileSync } from 'node:fs';

export function parseCsvText(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length === 0) return { headers: [], rows: [] };

  const rows = lines.map(parseCsvLine);
  const headers = rows[0].map((h) => String(h).trim());
  const data = rows.slice(1).map((cells) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = cells[i] !== undefined ? String(cells[i]).trim() : '';
    });
    return obj;
  });
  return { headers, rows: data };
}

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') inQ = false;
      else cur += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

export function readSheetCsv(filePath) {
  return parseCsvText(readFileSync(filePath, 'utf8'));
}

export function colValues(rows, column) {
  return rows.map((r) => r[column] ?? '').filter((v) => v !== '');
}

export function unique(values) {
  return [...new Set(values)];
}
