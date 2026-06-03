/**
 * OCMS Case Strip — UAT session telemetry (read-only observability).
 * Stores counters in sessionStorage only — no API, no CASE persistence.
 * Active when VITE_OCMS_UAT_TELEMETRY=true (requires strip flag ON for impressions).
 */

import { isOcmsUatTelemetryEnabled } from './ocmsFeature';

const STORAGE_KEY = 'cbv_ocms_strip_uat_v1';

export interface OcmsUatMetrics {
  sessionStartedAt: string;
  focusTaskViews: number;
  stripImpressions: number;
  collapseClicks: number;
  relationLinkClicks: number;
  diagnosticLineImpressions: number;
  discoveryResolved: number;
  discoveryPartial: number;
  discoveryNone: number;
}

function emptyMetrics(): OcmsUatMetrics {
  return {
    sessionStartedAt: new Date().toISOString(),
    focusTaskViews: 0,
    stripImpressions: 0,
    collapseClicks: 0,
    relationLinkClicks: 0,
    diagnosticLineImpressions: 0,
    discoveryResolved: 0,
    discoveryPartial: 0,
    discoveryNone: 0,
  };
}

function canUseSessionStorage(): boolean {
  return typeof sessionStorage !== 'undefined';
}

function loadMetrics(): OcmsUatMetrics {
  if (!canUseSessionStorage()) return emptyMetrics();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyMetrics();
    return { ...emptyMetrics(), ...JSON.parse(raw) } as OcmsUatMetrics;
  } catch {
    return emptyMetrics();
  }
}

function saveMetrics(metrics: OcmsUatMetrics): void {
  if (!canUseSessionStorage()) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
  } catch {
    /* session full or private mode — ignore */
  }
}

function bump(mutator: (m: OcmsUatMetrics) => void): void {
  if (!isOcmsUatTelemetryEnabled()) return;
  const metrics = loadMetrics();
  mutator(metrics);
  saveMetrics(metrics);
}

export function recordFocusTaskView(): void {
  bump((m) => {
    m.focusTaskViews += 1;
  });
}

export function recordStripImpression(input: {
  level: string;
  discoveryOutcome?: string;
  warningCount?: number;
}): void {
  bump((m) => {
    m.stripImpressions += 1;
    if (input.warningCount && input.warningCount > 0) {
      m.diagnosticLineImpressions += input.warningCount;
    }
    switch (input.discoveryOutcome) {
      case 'RESOLVED':
        m.discoveryResolved += 1;
        break;
      case 'PARTIAL':
        m.discoveryPartial += 1;
        break;
      case 'NONE':
        m.discoveryNone += 1;
        break;
      default:
        break;
    }
  });
}

export function recordStripCollapseClick(): void {
  bump((m) => {
    m.collapseClicks += 1;
  });
}

export function recordRelationLinkClick(): void {
  bump((m) => {
    m.relationLinkClicks += 1;
  });
}

export function getOcmsUatMetrics(): OcmsUatMetrics {
  return loadMetrics();
}

export function resetOcmsUatMetrics(): void {
  if (!canUseSessionStorage()) return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function exportOcmsUatMetricsJson(): string {
  const m = loadMetrics();
  const rates = {
    stripUsageRate:
      m.focusTaskViews > 0 ? Number((m.stripImpressions / m.focusTaskViews).toFixed(4)) : null,
    collapseRate:
      m.stripImpressions > 0 ? Number((m.collapseClicks / m.stripImpressions).toFixed(4)) : null,
    relationClickRate:
      m.stripImpressions > 0 ? Number((m.relationLinkClicks / m.stripImpressions).toFixed(4)) : null,
    diagnosticFrequency:
      m.stripImpressions > 0
        ? Number((m.diagnosticLineImpressions / m.stripImpressions).toFixed(4))
        : null,
    discoverySuccessRate:
      m.stripImpressions > 0
        ? Number((m.discoveryResolved / m.stripImpressions).toFixed(4))
        : null,
  };
  return JSON.stringify({ metrics: m, rates, exportedAt: new Date().toISOString() }, null, 2);
}

/** Operator console: `window.__OCMS_UAT_EXPORT__()` when telemetry ON */
export function attachOcmsUatConsoleExport(): void {
  if (typeof window === 'undefined' || !isOcmsUatTelemetryEnabled()) return;
  (window as unknown as { __OCMS_UAT_EXPORT__?: () => string }).__OCMS_UAT_EXPORT__ =
    exportOcmsUatMetricsJson;
}
