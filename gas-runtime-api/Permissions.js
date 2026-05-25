/**
 * RF_12 — GAS Runtime API — Permissions (Worker pre-validates; GAS enforces defense-in-depth).
 */

function rf12CanWrite_(actor) {
  return actor.role !== 'VIEW_ONLY';
}

function rf12CanCreate_(actor) {
  return actor.role === 'ADMIN' || actor.role === 'MANAGER';
}

function rf12CanUpdateTask_(actor, taskRow) {
  if (actor.role === 'VIEW_ONLY') return false;
  if (actor.role === 'ADMIN' || actor.role === 'MANAGER') return true;
  if (actor.role === 'STAFF') {
    var assignee = String(taskRow.assignee || '').trim();
    return assignee === actor.userId || assignee === actor.displayName;
  }
  if (actor.role === 'FINANCE') {
    return Boolean(taskRow.related_finance_id);
  }
  if (actor.role === 'HO_SO') {
    return Boolean(taskRow.related_hoso_id);
  }
  return false;
}

function rf12CanAssign_(actor) {
  return actor.role === 'ADMIN' || actor.role === 'MANAGER';
}
