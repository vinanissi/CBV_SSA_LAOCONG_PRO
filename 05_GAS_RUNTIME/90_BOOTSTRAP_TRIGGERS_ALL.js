/**
 * Gỡ / cài **tất cả** trigger do CBV PRO quản lý (một chỗ, menu).
 * Phụ thuộc: 90_BOOTSTRAP_INSTALL (installTriggersImpl), 90_BOOTSTRAP_ON_EDIT (installTaskSyncTrigger),
 *           04_CORE_EVENT_TRIGGERS (installCoreEventQueueTrigger).
 *
 * Handler names phải khớp mọi nơi tạo ScriptApp.newTrigger(...).
 */
var CBV_MANAGED_TRIGGER_HANDLERS = [
  'dailyHealthCheck',
  'keepWebhookWarm',
  'taskSyncMinutely',
  'onEditTaskHandler',
  'coreEventQueueProcessMinutely'
];

/**
 * Gỡ mọi trigger có handler thuộc CBV_MANAGED_TRIGGER_HANDLERS.
 * @returns {number} Số trigger đã xóa
 */
function removeAllCbvTriggersImpl() {
  var removed = 0;
  ScriptApp.getProjectTriggers().forEach(function(t) {
    var h = t.getHandlerFunction();
    if (CBV_MANAGED_TRIGGER_HANDLERS.indexOf(h) !== -1) {
      ScriptApp.deleteTrigger(t);
      removed++;
    }
  });
  Logger.log('[CBV] removeAllCbvTriggersImpl: removed ' + removed);
  return removed;
}

/**
 * Cài đủ: bootstrap (daily + warm), task sync 1 phút, EVENT_QUEUE 5 phút.
 * @returns {{ ok: boolean, message: string, code: string }}
 */
function installAllCbvTriggersImpl() {
  var parts = [];
  if (typeof installTriggersImpl === 'function') {
    var r = installTriggersImpl();
    parts.push('Bootstrap: ' + (r && r.message ? r.message : 'OK'));
  } else {
    parts.push('Bootstrap: thiếu installTriggersImpl');
  }
  if (typeof installTaskSyncTrigger === 'function') {
    installTaskSyncTrigger();
    parts.push('Task: taskSyncMinutely mỗi 1 phút');
  } else {
    parts.push('Task: thiếu installTaskSyncTrigger');
  }
  if (typeof installCoreEventQueueTrigger === 'function') {
    installCoreEventQueueTrigger();
    parts.push('EVENT_QUEUE: coreEventQueueProcessMinutely mỗi 5 phút');
  } else {
    parts.push('EVENT_QUEUE: thiếu installCoreEventQueueTrigger');
  }
  return { ok: true, message: parts.join('\n'), code: 'INSTALL_ALL_OK' };
}

/**
 * Gỡ hết rồi cài lại (đồng bộ cấu hình trigger).
 * @returns {{ ok: boolean, message: string, code: string, removed: number }}
 */
function reinstallAllCbvTriggersImpl() {
  var removed = removeAllCbvTriggersImpl();
  var r = installAllCbvTriggersImpl();
  r.removed = removed;
  r.message = 'Đã gỡ ' + removed + ' trigger.\n\n' + r.message;
  r.code = 'REINSTALL_ALL_OK';
  return r;
}
