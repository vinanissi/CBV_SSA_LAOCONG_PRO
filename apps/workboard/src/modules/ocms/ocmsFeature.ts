/**
 * OCMS Case Context Strip — feature flag (OCMS_03).
 * Default OFF when unset — zero runtime delta pre-OCMS.
 */
export function isOcmsCaseStripEnabled(): boolean {
  const env = typeof import.meta !== 'undefined' ? import.meta.env : undefined;
  const flag = env?.VITE_OCMS_CASE_STRIP_ENABLED;
  return flag === 'true' || flag === '1';
}

/**
 * Case Workspace (CASE_REFACTOR_03) — full Case-centric focus layout.
 * Default OFF — restores legacy Focus Task Workspace when unset.
 */
export function isCaseWorkspaceEnabled(): boolean {
  const env = typeof import.meta !== 'undefined' ? import.meta.env : undefined;
  const flag = env?.VITE_CASE_WORKSPACE_ENABLED;
  return flag === 'true' || flag === '1';
}

/** Derive Case read models when strip and/or workspace flag is on. */
export function isCaseReadModelDerivationEnabled(): boolean {
  return isOcmsCaseStripEnabled() || isCaseWorkspaceEnabled();
}

/**
 * Case Workspace UAT telemetry (PHASE_CASE_REFACTOR_04) — sessionStorage only.
 * Requires workspace flag ON during operator sessions.
 */
export function isCaseWorkspaceUatTelemetryEnabled(): boolean {
  const env = typeof import.meta !== 'undefined' ? import.meta.env : undefined;
  const flag = env?.VITE_CASE_WORKSPACE_UAT_TELEMETRY;
  return flag === 'true' || flag === '1';
}

/** UAT-only session counters — sessionStorage, no backend (OCMS_03B). */
export function isOcmsUatTelemetryEnabled(): boolean {
  const env = typeof import.meta !== 'undefined' ? import.meta.env : undefined;
  const flag = env?.VITE_OCMS_UAT_TELEMETRY;
  return flag === 'true' || flag === '1';
}
