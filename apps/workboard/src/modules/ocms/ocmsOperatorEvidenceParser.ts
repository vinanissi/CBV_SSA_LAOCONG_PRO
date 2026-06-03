/**
 * Parse operator UAT export JSON (from window.__OCMS_UAT_EXPORT__).
 * Read-only — no persistence, no API.
 */

import type { OcmsUatMetrics } from './ocmsStripUatTelemetry';

export interface OcmsUatRates {
  stripUsageRate: number | null;
  collapseRate: number | null;
  relationClickRate: number | null;
  diagnosticFrequency: number | null;
  discoverySuccessRate: number | null;
}

export interface OcmsUatExportPayload {
  metrics: OcmsUatMetrics;
  rates: OcmsUatRates;
  exportedAt: string;
}

export type ParseOcmsUatExportResult =
  | { ok: true; payload: OcmsUatExportPayload }
  | { ok: false; errors: string[] };

const RATE_KEYS: (keyof OcmsUatRates)[] = [
  'stripUsageRate',
  'collapseRate',
  'relationClickRate',
  'diagnosticFrequency',
  'discoverySuccessRate',
];

export function parseOcmsUatExportJson(raw: string): ParseOcmsUatExportResult {
  const errors: string[] = [];
  if (!raw?.trim()) {
    return { ok: false, errors: ['EMPTY_EXPORT'] };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, errors: ['INVALID_JSON'] };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, errors: ['NOT_OBJECT'] };
  }

  const obj = parsed as Record<string, unknown>;
  if (!obj.metrics || typeof obj.metrics !== 'object') {
    errors.push('MISSING_METRICS');
  }
  if (!obj.rates || typeof obj.rates !== 'object') {
    errors.push('MISSING_RATES');
  }
  if (typeof obj.exportedAt !== 'string') {
    errors.push('MISSING_EXPORTED_AT');
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const rates = obj.rates as Record<string, unknown>;
  for (const key of RATE_KEYS) {
    const v = rates[key];
    if (v !== null && typeof v !== 'number') {
      errors.push(`INVALID_RATE:${key}`);
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    payload: {
      metrics: obj.metrics as OcmsUatMetrics,
      rates: obj.rates as OcmsUatRates,
      exportedAt: obj.exportedAt as string,
    },
  };
}

/** Markdown table for pasting into OCMS_CASE_STRIP_OPERATOR_EVIDENCE_LOG.md */
export function formatOcmsEvidenceMetricsTable(payload: OcmsUatExportPayload): string {
  const { metrics: m, rates: r } = payload;
  return [
    '| Metric | Value |',
    '|--------|-------|',
    `| focusTaskViews | ${m.focusTaskViews} |`,
    `| stripImpressions | ${m.stripImpressions} |`,
    `| stripUsageRate | ${r.stripUsageRate ?? 'N/A'} |`,
    `| collapseRate | ${r.collapseRate ?? 'N/A'} |`,
    `| relationClickRate | ${r.relationClickRate ?? 'N/A'} |`,
    `| diagnosticFrequency | ${r.diagnosticFrequency ?? 'N/A'} |`,
    `| discoverySuccessRate | ${r.discoverySuccessRate ?? 'N/A'} |`,
    `| discoveryResolved | ${m.discoveryResolved} |`,
    `| discoveryPartial | ${m.discoveryPartial} |`,
    `| discoveryNone | ${m.discoveryNone} |`,
    `| exportedAt | ${payload.exportedAt} |`,
  ].join('\n');
}

export function meetsMinimumEvidenceThreshold(payload: OcmsUatExportPayload): {
  pass: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  const m = payload.metrics;

  if (m.focusTaskViews < 20) {
    reasons.push(`focusTaskViews ${m.focusTaskViews} < 20 minimum target`);
  }
  if (m.stripImpressions < 1) {
    reasons.push('stripImpressions = 0 — strip may not have been enabled');
  }

  return { pass: reasons.length === 0, reasons };
}
