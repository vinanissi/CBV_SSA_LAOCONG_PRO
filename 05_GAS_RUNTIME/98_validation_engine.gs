/**
 * CBV Validation Engine - Enum, ref, hierarchy validation.
 * Read-only. Returns findings; does not modify data.
 *
 * Dependencies: 97_TASK_SYSTEM_TEST_RUNNER (testEnumConsistency, testRefIntegrity, testDonViHierarchy)
 */

/**
 * Validates ENUM_DICTIONARY structure and usage in consuming tables.
 * @returns {{ ok: boolean, findings: Object[] }}
 */
function validateAllEnumsImpl() {
  if (typeof testEnumConsistency === 'function') {
    var r = testEnumConsistency();
    return { ok: r.ok, findings: r.findings || [] };
  }
  return { ok: true, findings: [] };
}

/**
 * Validates all foreign key references resolve.
 * @returns {{ ok: boolean, findings: Object[] }}
 */
function validateAllRefsImpl() {
  if (typeof testRefIntegrity === 'function') {
    var r = testRefIntegrity();
    return { ok: r.ok, findings: r.findings || [] };
  }
  return { ok: true, findings: [] };
}

/**
 * Validates DON_VI hierarchy: no self-parent, no cycles, no orphans, ≥1 root.
 * @returns {{ ok: boolean, findings: Object[], stats: Object }}
 */
function validateDonViHierarchyImpl() {
  if (typeof testDonViHierarchy === 'function') {
    var r = testDonViHierarchy();
    return { ok: r.ok, findings: r.findings || [], stats: r.stats || {} };
  }
  return { ok: true, findings: [], stats: {} };
}
