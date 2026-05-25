/**
 * PHASE_RF_05 — Plugin Runtime Baseline v1
 *
 * Read-only plugin registry + contract + bindings. No marketplace. No auto-execute.
 * Hardcoded registry in GAS — no schema change.
 */

var CBV_RF05_PHASE_ID = 'PHASE_RF_05_PLUGIN_RUNTIME';
var CBV_RF05_CONTRACT_VERSION = 'CBV_RF05_V1';

var CBV_PLUGIN_ALLOWED_STATUS = ['ACTIVE', 'ACTIVE_READONLY', 'PARTIAL', 'STUB', 'DISABLED', 'NOT_CONFIGURED', 'ERROR'];
var CBV_PLUGIN_ALLOWED_MODULES = ['TASK', 'FINANCE', 'HO_SO', 'INVOICE', 'OCR', 'ZALO', 'CRM', 'AI', 'SYSTEM'];

var CBV_PLUGIN_CAPABILITY_TYPES = [
  'READ', 'SEARCH', 'TIMELINE', 'FILE', 'NOTIFICATION', 'ASSIGNMENT', 'APPROVAL',
  'FINANCE_ACTION', 'HO_SO_ACTION', 'OBSERVATION', 'COORDINATION', 'QUICK_ACTION'
];

var CBV_PLUGIN_EXECUTION_MODES = [
  'READ_ONLY', 'NAVIGATE', 'EXECUTION_LOCKED', 'MANUAL_CONFIRM_REQUIRED', 'NOT_CONFIGURED'
];

function CBV_Plugin__safeEnvelope_(payload) {
  var p = payload || {};
  return {
    ok: p.ok !== false,
    phase: CBV_RF05_PHASE_ID,
    contractVersion: CBV_RF05_CONTRACT_VERSION,
    empty: p.empty === true,
    data: p.data != null ? p.data : null,
    warnings: p.warnings || [],
    errors: p.errors || [],
    checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date()
  };
}

function CBV_Plugin__href_(path, params) {
  if (typeof CBV_Observation__href_ === 'function') return CBV_Observation__href_(path, params);
  if (typeof CbvRf02__routeHref_ === 'function') return CbvRf02__routeHref_(path, params);
  return path;
}

function CBV_Plugin__assertView_(ctx) {
  CBV_Permission_assertCan(ctx, CBV_PERMISSION_ACTIONS.PLUGIN_VIEW, null);
}

function CBV_Plugin__cap_(capabilityId, label, type, enabled, status, permission, route, actionId, description) {
  return {
    capabilityId: capabilityId,
    label: label,
    type: type,
    enabled: enabled === true,
    status: status || (enabled ? 'ACTIVE' : 'STUB'),
    permission: permission || '',
    route: route || '',
    actionId: actionId || '',
    description: description || ''
  };
}

function CBV_Plugin__routeBind_(route, label, pluginId, module, permission, enabled, status) {
  return {
    route: route,
    label: label,
    pluginId: pluginId,
    module: module,
    permission: permission,
    enabled: enabled !== false,
    status: status || 'ACTIVE'
  };
}

function CBV_Plugin__quickAction_(actionId, pluginId, module, label, type, enabled, permission, requiresConfirmation, executionMode, reason, href) {
  return {
    actionId: actionId,
    pluginId: pluginId,
    module: module,
    label: label,
    type: type,
    enabled: enabled === true,
    permission: permission || '',
    requiresConfirmation: requiresConfirmation === true,
    executionMode: executionMode || 'NOT_CONFIGURED',
    reason: reason || '',
    href: href || '',
    autoExecute: false
  };
}

/** Hardcoded plugin registry — read-only. */
function CBV_PluginRegistry__definitions_() {
  return [
    {
      pluginId: 'cbv-plugin-task',
      module: 'TASK',
      label: 'Task Module',
      version: '1.0.0',
      status: 'ACTIVE',
      enabled: true,
      owner: 'CBV',
      source: 'RF_02/RF_03/RF_04 runtime',
      routes: [
        CBV_Plugin__routeBind_('/workspace/workboard/tasks', 'Task list', 'cbv-plugin-task', 'TASK', CBV_PERMISSION_ACTIONS.TASK_VIEW, true, 'ACTIVE'),
        CBV_Plugin__routeBind_('/workspace/coordination/queue', 'Queue', 'cbv-plugin-task', 'TASK', CBV_PERMISSION_ACTIONS.COORDINATION_VIEW, true, 'ACTIVE'),
        CBV_Plugin__routeBind_('/workspace/coordination/overdue', 'Overdue', 'cbv-plugin-task', 'TASK', CBV_PERMISSION_ACTIONS.COORDINATION_VIEW, true, 'ACTIVE'),
        CBV_Plugin__routeBind_('/workspace/coordination/workload', 'Workload', 'cbv-plugin-task', 'TASK', CBV_PERMISSION_ACTIONS.COORDINATION_TEAM_VIEW, true, 'ACTIVE'),
        CBV_Plugin__routeBind_('/workspace/coordination/assignment', 'Assignment', 'cbv-plugin-task', 'TASK', CBV_PERMISSION_ACTIONS.COORDINATION_ASSIGN, true, 'ACTIVE'),
        CBV_Plugin__routeBind_('/workspace/plugins/task', 'Plugin Task', 'cbv-plugin-task', 'TASK', CBV_PERMISSION_ACTIONS.PLUGIN_VIEW, true, 'ACTIVE')
      ],
      permissions: [
        CBV_PERMISSION_ACTIONS.TASK_VIEW,
        CBV_PERMISSION_ACTIONS.TASK_SEARCH,
        CBV_PERMISSION_ACTIONS.TASK_TIMELINE_VIEW,
        CBV_PERMISSION_ACTIONS.TASK_ASSIGN,
        CBV_PERMISSION_ACTIONS.TASK_FILE_VIEW
      ],
      capabilities: [
        CBV_Plugin__cap_('task-list', 'Danh sách việc', 'READ', true, 'ACTIVE', CBV_PERMISSION_ACTIONS.TASK_VIEW, '/workspace/workboard/tasks', '', 'RF_02 task list'),
        CBV_Plugin__cap_('task-detail', 'Chi tiết việc', 'READ', true, 'ACTIVE', CBV_PERMISSION_ACTIONS.TASK_VIEW, '/workspace/workboard/task-detail', '', 'RF_02 task detail'),
        CBV_Plugin__cap_('task-timeline', 'Timeline', 'TIMELINE', true, 'ACTIVE', CBV_PERMISSION_ACTIONS.TASK_TIMELINE_VIEW, '/workspace/workboard/task-detail', '', 'RF_02 timeline'),
        CBV_Plugin__cap_('task-search', 'Tìm kiếm', 'SEARCH', true, 'ACTIVE', CBV_PERMISSION_ACTIONS.TASK_SEARCH, '/workspace/workboard/search', '', 'RF_02 search'),
        CBV_Plugin__cap_('task-notification', 'Thông báo', 'NOTIFICATION', true, 'ACTIVE', CBV_PERMISSION_ACTIONS.NOTIFICATION_VIEW, '/workspace/workboard/notifications', '', 'RF_02 notifications'),
        CBV_Plugin__cap_('task-file', 'File', 'FILE', true, 'ACTIVE', CBV_PERMISSION_ACTIONS.TASK_FILE_VIEW, '/workspace/workboard/files', '', 'RF_02 files'),
        CBV_Plugin__cap_('task-queue', 'Queue', 'COORDINATION', true, 'ACTIVE', CBV_PERMISSION_ACTIONS.COORDINATION_VIEW, '/workspace/coordination/queue', '', 'RF_03 queue'),
        CBV_Plugin__cap_('task-overdue', 'Quá hạn', 'COORDINATION', true, 'ACTIVE', CBV_PERMISSION_ACTIONS.COORDINATION_VIEW, '/workspace/coordination/overdue', '', 'RF_03 overdue'),
        CBV_Plugin__cap_('task-workload', 'Tải NV', 'COORDINATION', true, 'ACTIVE', CBV_PERMISSION_ACTIONS.COORDINATION_TEAM_VIEW, '/workspace/coordination/workload', '', 'RF_03 workload'),
        CBV_Plugin__cap_('task-assign', 'Giao việc', 'ASSIGNMENT', true, 'ACTIVE', CBV_PERMISSION_ACTIONS.TASK_ASSIGN, '/workspace/coordination/assignment', 'task-assign', 'EXECUTION_LOCKED from WebApp'),
        CBV_Plugin__cap_('task-observation', 'Quan sát', 'OBSERVATION', true, 'ACTIVE', CBV_PERMISSION_ACTIONS.OBSERVATION_VIEW, '/workspace/observation', '', 'RF_04 observation')
      ],
      projections: ['HOME_ALERT', 'TASK_LIST', 'QUEUE', 'OVERDUE', 'WORKLOAD'],
      actions: [
        CBV_Plugin__quickAction_('task-open-list', 'cbv-plugin-task', 'TASK', 'Mở danh sách việc', 'NAVIGATE', true, CBV_PERMISSION_ACTIONS.TASK_VIEW, false, 'NAVIGATE', '', CBV_Plugin__href_('/workspace/workboard/tasks')),
        CBV_Plugin__quickAction_('task-open-queue', 'cbv-plugin-task', 'TASK', 'Mở queue', 'NAVIGATE', true, CBV_PERMISSION_ACTIONS.COORDINATION_VIEW, false, 'NAVIGATE', '', CBV_Plugin__href_('/workspace/coordination/queue')),
        CBV_Plugin__quickAction_('task-assign-locked', 'cbv-plugin-task', 'TASK', 'Giao việc', 'ASSIGNMENT', true, CBV_PERMISSION_ACTIONS.TASK_ASSIGN, true, 'EXECUTION_LOCKED', 'WebApp không ghi TASK_MAIN trong RF_03', CBV_Plugin__href_('/workspace/coordination/assignment'))
      ],
      observation: { module: 'TASK', bindPhase: 'RF_04' },
      coordination: {
        pluginId: 'cbv-plugin-task',
        module: 'TASK',
        queueSupported: true,
        assignmentSupported: 'EXECUTION_LOCKED',
        workloadSupported: true,
        overdueSupported: true,
        quickActionsSupported: true,
        status: 'ACTIVE',
        notes: 'Bound to RF_03 coordination runtime'
      },
      risks: ['Assignment EXECUTION_LOCKED from WebApp'],
      notes: 'Primary operational module — ACTIVE via RF_02/03/04'
    },
    {
      pluginId: 'cbv-plugin-finance',
      module: 'FINANCE',
      label: 'Finance Module',
      version: '1.0.0',
      status: 'ACTIVE_READONLY',
      enabled: true,
      owner: 'CBV',
      source: 'FINANCE_TRANSACTION + FINANCE_ATTACHMENT (RF_06 read projection)',
      routes: [
        CBV_Plugin__routeBind_('/workspace/plugins/finance', 'Finance workboard', 'cbv-plugin-finance', 'FINANCE', CBV_PERMISSION_ACTIONS.FINANCE_VIEW, true, 'ACTIVE_READONLY'),
        CBV_Plugin__routeBind_('/workspace/plugins/finance/items', 'Finance items', 'cbv-plugin-finance', 'FINANCE', CBV_PERMISSION_ACTIONS.FINANCE_VIEW, true, 'ACTIVE_READONLY'),
        CBV_Plugin__routeBind_('/workspace/plugins/finance/alerts', 'Finance alerts', 'cbv-plugin-finance', 'FINANCE', CBV_PERMISSION_ACTIONS.FINANCE_VIEW, true, 'ACTIVE_READONLY'),
        CBV_Plugin__routeBind_('/workspace/plugins/finance/search', 'Finance search', 'cbv-plugin-finance', 'FINANCE', CBV_PERMISSION_ACTIONS.FINANCE_SEARCH, true, 'ACTIVE_READONLY')
      ],
      permissions: [
        CBV_PERMISSION_ACTIONS.FINANCE_VIEW,
        CBV_PERMISSION_ACTIONS.FINANCE_SEARCH,
        CBV_PERMISSION_ACTIONS.FINANCE_CONFIRM_PAYMENT,
        CBV_PERMISSION_ACTIONS.FINANCE_FILE_VIEW
      ],
      capabilities: [
        CBV_Plugin__cap_('finance-view', 'Xem tài chính', 'READ', true, 'ACTIVE', CBV_PERMISSION_ACTIONS.FINANCE_VIEW, '/workspace/plugins/finance', '', 'RF_06 read projection'),
        CBV_Plugin__cap_('finance-search', 'Tìm kiếm TC', 'SEARCH', true, 'ACTIVE', CBV_PERMISSION_ACTIONS.FINANCE_SEARCH, '/workspace/plugins/finance/search', '', 'RF_06 search adapter'),
        CBV_Plugin__cap_('finance-pending', 'Chờ thanh toán', 'FINANCE_ACTION', false, 'NOT_CONFIGURED', CBV_PERMISSION_ACTIONS.FINANCE_CONFIRM_PAYMENT, '', '', 'EXECUTION_LOCKED'),
        CBV_Plugin__cap_('finance-file', 'File TC', 'FILE', true, 'PARTIAL', CBV_PERMISSION_ACTIONS.FINANCE_FILE_VIEW, '', '', 'Read count only'),
        CBV_Plugin__cap_('finance-alert', 'Cảnh báo TC', 'NOTIFICATION', true, 'ACTIVE', CBV_PERMISSION_ACTIONS.FINANCE_VIEW, '/workspace/plugins/finance/alerts', '', 'RF_06 alerts'),
        CBV_Plugin__cap_('finance-timeline', 'Timeline TC', 'TIMELINE', true, 'PARTIAL', CBV_PERMISSION_ACTIONS.FINANCE_VIEW, '', '', 'FINANCE_LOG read-first'),
        CBV_Plugin__cap_('finance-observation', 'Quan sát TC', 'OBSERVATION', true, 'ACTIVE', CBV_PERMISSION_ACTIONS.PLUGIN_OBSERVATION_VIEW, '/workspace/plugins/health', '', 'RF_06 observation')
      ],
      projections: ['FINANCE_TRANSACTION', 'FINANCE_ATTACHMENT'],
      actions: [
        CBV_Plugin__quickAction_('finance-open', 'cbv-plugin-finance', 'FINANCE', 'Xem tài chính', 'NAVIGATE', true, CBV_PERMISSION_ACTIONS.FINANCE_VIEW, false, 'NAVIGATE', '', CBV_Plugin__href_('/workspace/plugins/finance')),
        CBV_Plugin__quickAction_('finance-confirm-locked', 'cbv-plugin-finance', 'FINANCE', 'Xác nhận thanh toán', 'FINANCE_ACTION', true, CBV_PERMISSION_ACTIONS.FINANCE_CONFIRM_PAYMENT, true, 'EXECUTION_LOCKED', 'Không auto-confirm từ WebApp', '')
      ],
      observation: { module: 'FINANCE', bindPhase: 'RF_06' },
      coordination: {
        pluginId: 'cbv-plugin-finance',
        module: 'FINANCE',
        queueSupported: 'STUB',
        assignmentSupported: false,
        workloadSupported: false,
        overdueSupported: 'STUB',
        quickActionsSupported: true,
        status: 'PARTIAL',
        notes: 'Read-only activation RF_06'
      },
      risks: ['Confirm payment EXECUTION_LOCKED from WebApp'],
      notes: 'ACTIVE_READONLY via RF_06 — no write from WebApp'
    },
    {
      pluginId: 'cbv-plugin-ho-so',
      module: 'HO_SO',
      label: 'Hồ sơ Module',
      version: '1.0.0',
      status: 'ACTIVE_READONLY',
      enabled: true,
      owner: 'CBV',
      source: 'HO_SO_MASTER + HO_SO_FILE (RF_06 read projection)',
      routes: [
        CBV_Plugin__routeBind_('/workspace/plugins/ho-so', 'Hồ sơ workboard', 'cbv-plugin-ho-so', 'HO_SO', CBV_PERMISSION_ACTIONS.HO_SO_VIEW, true, 'ACTIVE_READONLY'),
        CBV_Plugin__routeBind_('/workspace/plugins/ho-so/items', 'Hồ sơ items', 'cbv-plugin-ho-so', 'HO_SO', CBV_PERMISSION_ACTIONS.HO_SO_VIEW, true, 'ACTIVE_READONLY'),
        CBV_Plugin__routeBind_('/workspace/plugins/ho-so/alerts', 'Hồ sơ alerts', 'cbv-plugin-ho-so', 'HO_SO', CBV_PERMISSION_ACTIONS.HO_SO_VIEW, true, 'ACTIVE_READONLY'),
        CBV_Plugin__routeBind_('/workspace/plugins/ho-so/search', 'Hồ sơ search', 'cbv-plugin-ho-so', 'HO_SO', CBV_PERMISSION_ACTIONS.HO_SO_SEARCH, true, 'ACTIVE_READONLY')
      ],
      permissions: [
        CBV_PERMISSION_ACTIONS.HO_SO_VIEW,
        CBV_PERMISSION_ACTIONS.HO_SO_SEARCH,
        CBV_PERMISSION_ACTIONS.HO_SO_FILE_VIEW,
        CBV_PERMISSION_ACTIONS.HO_SO_APPROVAL
      ],
      capabilities: [
        CBV_Plugin__cap_('hoso-view', 'Xem hồ sơ', 'READ', true, 'ACTIVE', CBV_PERMISSION_ACTIONS.HO_SO_VIEW, '/workspace/plugins/ho-so', '', 'RF_06 read projection'),
        CBV_Plugin__cap_('hoso-search', 'Tìm kiếm HS', 'SEARCH', true, 'ACTIVE', CBV_PERMISSION_ACTIONS.HO_SO_SEARCH, '/workspace/plugins/ho-so/search', '', 'RF_06 search adapter'),
        CBV_Plugin__cap_('hoso-file', 'File HS', 'FILE', true, 'PARTIAL', CBV_PERMISSION_ACTIONS.HO_SO_FILE_VIEW, '', '', 'Read count + missing docs'),
        CBV_Plugin__cap_('hoso-approval', 'Duyệt HS', 'APPROVAL', false, 'NOT_CONFIGURED', CBV_PERMISSION_ACTIONS.HO_SO_APPROVAL, '', '', 'EXECUTION_LOCKED'),
        CBV_Plugin__cap_('hoso-alert', 'Cảnh báo HS', 'NOTIFICATION', true, 'ACTIVE', CBV_PERMISSION_ACTIONS.HO_SO_VIEW, '/workspace/plugins/ho-so/alerts', '', 'RF_06 alerts'),
        CBV_Plugin__cap_('hoso-timeline', 'Timeline HS', 'TIMELINE', true, 'PARTIAL', CBV_PERMISSION_ACTIONS.HO_SO_VIEW, '', '', 'HO_SO_UPDATE_LOG read-first'),
        CBV_Plugin__cap_('hoso-observation', 'Quan sát HS', 'OBSERVATION', true, 'ACTIVE', CBV_PERMISSION_ACTIONS.PLUGIN_OBSERVATION_VIEW, '/workspace/plugins/health', '', 'RF_06 observation')
      ],
      projections: ['HO_SO_MASTER', 'HO_SO_FILE'],
      actions: [
        CBV_Plugin__quickAction_('hoso-open', 'cbv-plugin-ho-so', 'HO_SO', 'Xem hồ sơ', 'NAVIGATE', true, CBV_PERMISSION_ACTIONS.HO_SO_VIEW, false, 'NAVIGATE', '', CBV_Plugin__href_('/workspace/plugins/ho-so')),
        CBV_Plugin__quickAction_('hoso-approve-locked', 'cbv-plugin-ho-so', 'HO_SO', 'Gửi duyệt', 'APPROVAL', true, CBV_PERMISSION_ACTIONS.HO_SO_APPROVAL, true, 'EXECUTION_LOCKED', 'Không auto-approve từ WebApp', '')
      ],
      observation: { module: 'HO_SO', bindPhase: 'RF_06' },
      coordination: {
        pluginId: 'cbv-plugin-ho-so',
        module: 'HO_SO',
        queueSupported: 'STUB',
        assignmentSupported: 'STUB',
        workloadSupported: false,
        overdueSupported: 'STUB',
        quickActionsSupported: true,
        status: 'PARTIAL',
        notes: 'Read-only activation RF_06'
      },
      risks: ['Approval EXECUTION_LOCKED from WebApp'],
      notes: 'ACTIVE_READONLY via RF_06 — no write from WebApp'
    }
  ];
}

/**
 * Validate plugin descriptor contract v1.
 * @returns {{ ok: boolean, errors: string[], warnings: string[] }}
 */
function CBV_PluginRegistry_validateDescriptor(plugin) {
  var p = plugin || {};
  var errors = [];
  var warnings = [];
  var required = ['pluginId', 'module', 'label', 'version', 'status', 'enabled', 'capabilities'];
  for (var i = 0; i < required.length; i++) {
    if (p[required[i]] == null || p[required[i]] === '') errors.push('Missing required: ' + required[i]);
  }
  if (p.status && CBV_PLUGIN_ALLOWED_STATUS.indexOf(p.status) < 0) {
    errors.push('Invalid status: ' + p.status);
  }
  if (p.module && CBV_PLUGIN_ALLOWED_MODULES.indexOf(p.module) < 0) {
    warnings.push('Unknown module: ' + p.module);
  }
  if (!Array.isArray(p.capabilities) || p.capabilities.length === 0) {
    errors.push('capabilities must be non-empty array');
  } else {
    for (var c = 0; c < p.capabilities.length; c++) {
      var cap = p.capabilities[c] || {};
      if (cap.status === 'ACTIVE' && cap.enabled !== true && p.status === 'ACTIVE') {
        warnings.push('Capability ' + cap.capabilityId + ' marked ACTIVE status but enabled=false');
      }
      if (cap.status === 'ACTIVE' && p.status === 'STUB') {
        warnings.push('STUB plugin has ACTIVE capability: ' + cap.capabilityId);
      }
    }
  }
  if (p.actions) {
    for (var a = 0; a < p.actions.length; a++) {
      if (p.actions[a] && p.actions[a].autoExecute === true) {
        errors.push('autoExecute forbidden: ' + p.actions[a].actionId);
      }
    }
  }
  return { ok: errors.length === 0, errors: errors, warnings: warnings };
}

function CBV_PluginRegistry_list() {
  return CBV_PluginRegistry__definitions_().slice();
}

function CBV_PluginRegistry_get(pluginId) {
  var id = String(pluginId || '').trim();
  var list = CBV_PluginRegistry__definitions_();
  for (var i = 0; i < list.length; i++) {
    if (list[i].pluginId === id) return list[i];
  }
  return null;
}

function CBV_PluginRegistry_getByModule(module) {
  var mod = String(module || '').trim().toUpperCase();
  return CBV_PluginRegistry_list().filter(function (p) { return p.module === mod; });
}

function CBV_PluginRegistry_isEnabled(pluginId) {
  var p = CBV_PluginRegistry_get(pluginId);
  return !!(p && p.enabled === true && p.status !== 'DISABLED');
}

function CBV_PluginRegistry_getRouteBindings() {
  var list = CBV_PluginRegistry_list();
  var routes = [];
  for (var i = 0; i < list.length; i++) {
    var rts = list[i].routes || [];
    for (var j = 0; j < rts.length; j++) routes.push(rts[j]);
  }
  routes.push(CBV_Plugin__routeBind_('/workspace/plugins', 'Plugin Workboard', 'system', 'SYSTEM', CBV_PERMISSION_ACTIONS.PLUGIN_VIEW, true, 'ACTIVE'));
  routes.push(CBV_Plugin__routeBind_('/workspace/plugins/health', 'Plugin Health', 'system', 'SYSTEM', CBV_PERMISSION_ACTIONS.PLUGIN_OBSERVATION_VIEW, true, 'ACTIVE'));
  return routes;
}

function CBV_Plugin__filterForRole_(ctx, plugin) {
  if (!plugin || !plugin.enabled) return false;
  if (plugin.module === 'TASK') return true;
  if (plugin.module === 'FINANCE') {
    return ctx.role === 'ADMIN' || ctx.role === 'MANAGER' || ctx.role === 'FINANCE' || ctx.role === 'VIEW_ONLY';
  }
  if (plugin.module === 'HO_SO') {
    return ctx.role === 'ADMIN' || ctx.role === 'MANAGER' || ctx.role === 'HO_SO' || ctx.role === 'VIEW_ONLY';
  }
  return CBV_Permission_can(ctx, CBV_PERMISSION_ACTIONS.PLUGIN_VIEW, null);
}

function CBV_Plugin__countWarnings_(plugin) {
  var n = 0;
  var caps = plugin.capabilities || [];
  for (var i = 0; i < caps.length; i++) {
    if (caps[i].status === 'STUB' || caps[i].status === 'NOT_CONFIGURED') n++;
  }
  if (plugin.status === 'STUB') n++;
  return n;
}

function CBV_Plugin__nextStep_(plugin) {
  if (plugin.status === 'ACTIVE') return 'Sử dụng capability đã bật';
  if (plugin.module === 'FINANCE' || plugin.module === 'HO_SO') {
    if (plugin.status === 'ACTIVE_READONLY' || plugin.status === 'PARTIAL') return 'Sử dụng workboard read-only';
    return 'Chờ RF_06 activation';
  }
  return 'Kiểm tra descriptor';
}

/**
 * Plugin observation health — adapter for RF_04 or standalone page.
 */
function CBV_PluginObservation_getHealth(userContext) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  var errors = [];
  var items = [];
  try {
    CBV_Permission_assertCan(ctx, CBV_PERMISSION_ACTIONS.PLUGIN_OBSERVATION_VIEW, null);
  } catch (ePerm) {
    try { CBV_Plugin__assertView_(ctx); } catch (e2) {
      errors.push(e2 && e2.message ? e2.message : String(e2));
      return CBV_Plugin__safeEnvelope_({ ok: false, errors: errors, data: { plugins: [] } });
    }
  }

  var list = CBV_PluginRegistry_list();
  for (var i = 0; i < list.length; i++) {
    var p = list[i];
    if (!CBV_Plugin__filterForRole_(ctx, p)) continue;
    var activeCaps = (p.capabilities || []).filter(function (c) { return c.enabled && c.status === 'ACTIVE'; }).length;
    var totalCaps = (p.capabilities || []).length;
    var ok = p.status === 'ACTIVE' || p.status === 'ACTIVE_READONLY';
    if (p.status === 'ACTIVE_READONLY' || p.status === 'PARTIAL') ok = activeCaps > 0;
    var severity = ok ? 'OK' : (p.status === 'STUB' ? 'WARNING' : 'ERROR');
    var message = (p.status === 'ACTIVE' || p.status === 'ACTIVE_READONLY' || p.status === 'PARTIAL')
      ? (activeCaps + '/' + totalCaps + ' capability active')
      : ('Plugin ' + p.status + ' — ' + (p.notes || ''));
    items.push({
      pluginId: p.pluginId,
      module: p.module,
      ok: ok,
      status: p.status,
      severity: severity,
      message: message,
      nextStep: CBV_Plugin__nextStep_(p),
      checkedAt: new Date().toISOString()
    });
  }

  if (typeof CBV_Rf06PluginObservation_getHealth_ === 'function') {
    try {
      var rf06 = CBV_Rf06PluginObservation_getHealth_(ctx);
      if (rf06.ok && rf06.data && rf06.data.plugins) {
        rf06.data.plugins.forEach(function (r6) {
          for (var j = 0; j < items.length; j++) {
            if (items[j].pluginId === r6.pluginId) {
              items[j] = r6;
              break;
            }
          }
        });
      }
    } catch (eRf06) { /* optional merge */ }
  }

  return CBV_Plugin__safeEnvelope_({
    ok: true,
    data: { plugins: items, autoExecute: false },
    warnings: ctx.warnings || []
  });
}

function CBV_Plugin_getDashboardModel_(userContext) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  try {
    CBV_Plugin__assertView_(ctx);
  } catch (e) {
    return CBV_Plugin__safeEnvelope_({ ok: false, errors: [e.message || String(e)] });
  }

  var plugins = CBV_PluginRegistry_list().filter(function (p) { return CBV_Plugin__filterForRole_(ctx, p); });
  var cards = plugins.map(function (p) {
    var val = CBV_PluginRegistry_validateDescriptor(p);
    return {
      pluginId: p.pluginId,
      module: p.module,
      label: p.label,
      status: p.status,
      enabled: p.enabled,
      capabilityCount: (p.capabilities || []).length,
      activeCapabilityCount: (p.capabilities || []).filter(function (c) { return c.enabled && c.status === 'ACTIVE'; }).length,
      warningCount: CBV_Plugin__countWarnings_(p),
      descriptorValid: val.ok,
      nextStep: CBV_Plugin__nextStep_(p),
      href: CBV_Plugin__href_('/workspace/plugins/' + (p.module === 'HO_SO' ? 'ho-so' : p.module.toLowerCase()))
    };
  });

  return CBV_Plugin__safeEnvelope_({
    ok: true,
    data: { plugins: cards, registryCount: plugins.length, hardcoded: true }
  });
}

function CBV_Plugin_getDetailModel_(pluginId, userContext) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  var id = String(pluginId || '').trim();
  try {
    CBV_Plugin__assertView_(ctx);
  } catch (e) {
    return CBV_Plugin__safeEnvelope_({ ok: false, errors: [e.message || String(e)] });
  }

  var plugin = CBV_PluginRegistry_get(id);
  if (!plugin) {
    return CBV_Plugin__safeEnvelope_({ ok: false, errors: ['Plugin not found: ' + id] });
  }
  if (!CBV_Plugin__filterForRole_(ctx, plugin)) {
    return CBV_Plugin__safeEnvelope_({ ok: false, errors: ['Plugin not visible for role ' + ctx.role] });
  }

  var validation = CBV_PluginRegistry_validateDescriptor(plugin);
  var visibleCaps = (plugin.capabilities || []).filter(function (c) {
    return !c.permission || CBV_Permission_can(ctx, c.permission, null);
  });
  var visibleActions = (plugin.actions || []).filter(function (a) {
    return a.enabled && CBV_Permission_can(ctx, a.permission, null) && a.autoExecute !== true;
  });
  var filteredActions = CBV_Permission_filterActions(ctx, visibleActions.map(function (a) {
    return { code: a.permission, label: a.label, href: a.href, action: a.actionId };
  }));

  var obsHealth = null;
  var obsEnv = CBV_PluginObservation_getHealth(ctx);
  if (obsEnv.ok && obsEnv.data && obsEnv.data.plugins) {
    for (var i = 0; i < obsEnv.data.plugins.length; i++) {
      if (obsEnv.data.plugins[i].pluginId === id) { obsHealth = obsEnv.data.plugins[i]; break; }
    }
  }

  return CBV_Plugin__safeEnvelope_({
    ok: true,
    data: {
      descriptor: plugin,
      validation: validation,
      capabilities: visibleCaps,
      routes: plugin.routes || [],
      permissions: plugin.permissions || [],
      coordination: plugin.coordination || null,
      quickActions: visibleActions,
      filteredActions: filteredActions,
      observationHealth: obsHealth,
      autoExecute: false
    }
  });
}

function CBV_Plugin_getDetailByModule_(module, userContext) {
  var list = CBV_PluginRegistry_getByModule(module);
  if (!list.length) return CBV_Plugin__safeEnvelope_({ ok: false, errors: ['No plugin for module ' + module] });
  return CBV_Plugin_getDetailModel_(list[0].pluginId, userContext);
}

function CBV_Plugin_resolvePluginIdFromParams_(params) {
  var p = params || {};
  if (p.pluginId) return String(p.pluginId);
  var route = String(p.route || '');
  if (route.indexOf('/task') >= 0) return 'cbv-plugin-task';
  if (route.indexOf('/finance') >= 0) return 'cbv-plugin-finance';
  if (route.indexOf('/ho-so') >= 0) return 'cbv-plugin-ho-so';
  return '';
}
