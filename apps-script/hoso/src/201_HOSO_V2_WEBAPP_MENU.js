/**
 * HO_SO V2 — WebApp menu (tokens, self-register, sync, registry status).
 */

function buildHoSoV2WebAppMenu_() {
  var ui = SpreadsheetApp.getUi();
  if (!ui) return;
  ui.createMenu('🌐 HO_SO WEBAPP')
    .addItem('Set HO_SO WebApp Token', 'HOSO_WebApp_menuSetLocalToken')
    .addItem('Set Main Control URL', 'HOSO_WebApp_menuSetMainUrl')
    .addItem('Set Main Control Token', 'HOSO_WebApp_menuSetMainToken')
    .addItem('Set Bound Spreadsheet ID (WebApp)', 'HOSO_WebApp_menuSetBoundDbId')
    .addSeparator()
    .addItem('Register Module', 'HOSO_WebApp_menuRegisterModule')
    .addItem('Refresh Connection', 'HOSO_WebApp_menuRefreshConnection')
    .addItem('Show Registry Status', 'HOSO_WebApp_menuShowRegistryStatus')
    .addItem('Force Sync', 'HOSO_WebApp_menuForceSync')
    .addSeparator()
    .addItem('Show Local Connection', 'HOSO_WebApp_menuShowLocal')
    .addItem('Test Health', 'HOSO_WebApp_menuTestHealth')
    .addSeparator()
    .addItem('Schema Health', 'HOSO_WebApp_menuSchemaHealth')
    .addItem('Ensure Schema V2', 'HOSO_WebApp_menuEnsureSchemaV2')
    .addItem('Ensure Print Job Sheet', 'HOSO_WebApp_menuEnsurePrintJobSheet')
    .addItem('Sync ENUM', 'HOSO_Menu_syncEnum')
    .addSeparator()
    .addItem('Enum V2 Health', 'HOSO_Menu_enumV2Health')
    .addItem('Sync Enum V2', 'HOSO_Menu_syncEnumV2')
    .addItem('Ensure Enum V2 Schema', 'HOSO_Menu_ensureEnumV2Schema')
    .addSeparator()
    .addItem('Run Print Worker Pending', 'HOSO_WebApp_menuRunPrintPending')
    .addToUi();
}

function HOSO_WebApp_menuSetLocalToken() {
  var ui = SpreadsheetApp.getUi();
  var pr = ui.prompt('CBV_HOSO_WEBAPP_TOKEN', 'Token để bảo vệ WebApp HO_SO:', ui.ButtonSet.OK_CANCEL);
  if (pr.getSelectedButton() !== ui.Button.OK) return;
  var v = String(pr.getResponseText() || '').trim();
  if (!v) {
    ui.alert('Token trống.');
    return;
  }
  PropertiesService.getScriptProperties().setProperty('CBV_HOSO_WEBAPP_TOKEN', v);
  ui.alert('Đã lưu CBV_HOSO_WEBAPP_TOKEN.');
}

function HOSO_WebApp_menuSetMainUrl() {
  var ui = SpreadsheetApp.getUi();
  var pr = ui.prompt('CBV_MAIN_CONTROL_WEBAPP_URL', 'URL WebApp MAIN_CONTROL (POST):', ui.ButtonSet.OK_CANCEL);
  if (pr.getSelectedButton() !== ui.Button.OK) return;
  var v = String(pr.getResponseText() || '').trim();
  if (!v) {
    ui.alert('URL trống.');
    return;
  }
  PropertiesService.getScriptProperties().setProperty('CBV_MAIN_CONTROL_WEBAPP_URL', v);
  ui.alert('Đã lưu CBV_MAIN_CONTROL_WEBAPP_URL.');
}

function HOSO_WebApp_menuSetMainToken() {
  var ui = SpreadsheetApp.getUi();
  var pr = ui.prompt('CBV_MAIN_WEBAPP_TOKEN', 'Token gọi MAIN_CONTROL:', ui.ButtonSet.OK_CANCEL);
  if (pr.getSelectedButton() !== ui.Button.OK) return;
  var v = String(pr.getResponseText() || '').trim();
  if (!v) {
    ui.alert('Token trống.');
    return;
  }
  PropertiesService.getScriptProperties().setProperty('CBV_MAIN_WEBAPP_TOKEN', v);
  ui.alert('Đã lưu CBV_MAIN_WEBAPP_TOKEN.');
}

function HOSO_WebApp_menuSetBoundDbId() {
  var ui = SpreadsheetApp.getUi();
  var pr = ui.prompt(
    'CBV_HOSO_BOUND_SPREADSHEET_ID',
    'ID spreadsheet HOSO khi WebApp không có active sheet (optional):',
    ui.ButtonSet.OK_CANCEL
  );
  if (pr.getSelectedButton() !== ui.Button.OK) return;
  var v = String(pr.getResponseText() || '').trim();
  PropertiesService.getScriptProperties().setProperty('CBV_HOSO_BOUND_SPREADSHEET_ID', v);
  ui.alert(v ? 'Đã lưu.' : 'Đã xóa (empty).');
}

function HOSO_WebApp_menuRegisterModule() {
  try {
    hoSoV2SetRuntimeSource_('MENU');
    var out = HOSO_registerModule_();
    if (typeof hoSoV2AdminAlertJson_ === 'function') {
      hoSoV2AdminAlertJson_('Register Module', out);
    } else {
      SpreadsheetApp.getUi().alert(HOSO_json_(out));
    }
  } catch (e) {
    if (typeof hoSoV2AdminAlertJson_ === 'function') {
      hoSoV2AdminAlertJson_('Register Module', { ok: false, error: String(e && e.message ? e.message : e) });
    }
  } finally {
    hoSoV2SetRuntimeSource_('HOSO_SERVICE');
  }
}

function HOSO_WebApp_menuRefreshConnection() {
  try {
    hoSoV2SetRuntimeSource_('MENU');
    var out = HOSO_refreshConnectionPackage_();
    if (typeof hoSoV2AdminAlertJson_ === 'function') {
      hoSoV2AdminAlertJson_('Refresh Connection', out);
    } else {
      SpreadsheetApp.getUi().alert(HOSO_json_(out));
    }
  } catch (e) {
    if (typeof hoSoV2AdminAlertJson_ === 'function') {
      hoSoV2AdminAlertJson_('Refresh Connection', { ok: false, error: String(e && e.message ? e.message : e) });
    }
  } finally {
    hoSoV2SetRuntimeSource_('HOSO_SERVICE');
  }
}

function HOSO_WebApp_menuShowRegistryStatus() {
  try {
    var d = HOSO_WebApp_healthData_();
    var lastReg = '';
    try {
      lastReg = String(PropertiesService.getScriptProperties().getProperty('CBV_HOSO_CONNECTION_PACKAGE_UPDATED_AT') || '');
    } catch (e0) {
      lastReg = '';
    }
    var pkg = HOSO_getConnectionPackage_();
    var payload = {
      healthData: d,
      packageUpdatedAt: lastReg,
      localPackage: pkg && pkg.data ? { ok: pkg.ok, code: pkg.code, warning: pkg.data.warning, moduleDbId: (pkg.data && pkg.data.package && pkg.data.package.moduleDbId) || '' } : pkg
    };
    if (typeof hoSoV2AdminAlertJson_ === 'function') {
      hoSoV2AdminAlertJson_('Registry / Package Status', payload);
    } else {
      SpreadsheetApp.getUi().alert(HOSO_json_(payload));
    }
  } catch (e2) {
    SpreadsheetApp.getUi().alert(String(e2 && e2.message ? e2.message : e2));
  }
}

function HOSO_WebApp_menuForceSync() {
  try {
    hoSoV2SetRuntimeSource_('MENU');
    var out = HOSO_refreshConnectionPackage_();
    if (typeof hoSoV2AdminAlertJson_ === 'function') {
      hoSoV2AdminAlertJson_('Force Sync', out);
    } else {
      SpreadsheetApp.getUi().alert(HOSO_json_(out));
    }
  } catch (e3) {
    if (typeof hoSoV2AdminAlertJson_ === 'function') {
      hoSoV2AdminAlertJson_('Force Sync', { ok: false, error: String(e3 && e3.message ? e3.message : e3) });
    }
  } finally {
    hoSoV2SetRuntimeSource_('HOSO_SERVICE');
  }
}

function HOSO_WebApp_menuShowLocal() {
  try {
    var out = HOSO_getConnectionPackage_();
    if (typeof hoSoV2AdminAlertJson_ === 'function') {
      hoSoV2AdminAlertJson_('Local Connection', out);
    } else {
      SpreadsheetApp.getUi().alert(HOSO_json_(out));
    }
  } catch (e2) {
    SpreadsheetApp.getUi().alert(String(e2 && e2.message ? e2.message : e2));
  }
}

function HOSO_WebApp_menuTestHealth() {
  try {
    var sync = HOSO_autoSyncConnection_();
    var out = HOSO_WebApp_healthResponse_(sync);
    if (typeof hoSoV2AdminAlertJson_ === 'function') {
      hoSoV2AdminAlertJson_('HO_SO WebApp Health', out);
    } else {
      SpreadsheetApp.getUi().alert(HOSO_json_(out));
    }
  } catch (e3) {
    SpreadsheetApp.getUi().alert(String(e3 && e3.message ? e3.message : e3));
  }
}

function HOSO_WebApp_menuSchemaHealth() {
  try {
    hoSoV2SetRuntimeSource_('MENU');
    var r =
      typeof HOSO_SchemaV2_healthCheck === 'function'
        ? HOSO_SchemaV2_healthCheck()
        : { ok: false, code: 'HANDLER_NOT_FOUND', message: 'HOSO_SchemaV2_healthCheck not loaded', data: {}, error: null };
    SpreadsheetApp.getUi().alert(JSON.stringify(r, null, 2));
  } catch (eSh) {
    SpreadsheetApp.getUi().alert(JSON.stringify({ ok: false, error: String(eSh && eSh.message ? eSh.message : eSh) }, null, 2));
  } finally {
    hoSoV2SetRuntimeSource_('HOSO_SERVICE');
  }
}

function HOSO_WebApp_menuEnsureSchemaV2() {
  try {
    hoSoV2SetRuntimeSource_('MENU');
    var r =
      typeof HOSO_SchemaV2_ensureAll === 'function'
        ? HOSO_SchemaV2_ensureAll()
        : { ok: false, code: 'HANDLER_NOT_FOUND', message: 'HOSO_SchemaV2_ensureAll not loaded', data: {}, error: null };
    SpreadsheetApp.getUi().alert(JSON.stringify(r, null, 2));
  } catch (eE) {
    SpreadsheetApp.getUi().alert(JSON.stringify({ ok: false, error: String(eE && eE.message ? eE.message : eE) }, null, 2));
  } finally {
    hoSoV2SetRuntimeSource_('HOSO_SERVICE');
  }
}

function HOSO_WebApp_menuEnsurePrintJobSheet() {
  try {
    hoSoV2SetRuntimeSource_('MENU');
    var r =
      typeof HOSO_SchemaV2_ensurePrintJobSheet === 'function'
        ? HOSO_SchemaV2_ensurePrintJobSheet()
        : { ok: false, code: 'HANDLER_NOT_FOUND', message: 'HOSO_SchemaV2_ensurePrintJobSheet not loaded', data: {}, error: null };
    SpreadsheetApp.getUi().alert(JSON.stringify(r, null, 2));
  } catch (eP) {
    SpreadsheetApp.getUi().alert(JSON.stringify({ ok: false, error: String(eP && eP.message ? eP.message : eP) }, null, 2));
  } finally {
    hoSoV2SetRuntimeSource_('HOSO_SERVICE');
  }
}

function HOSO_WebApp_menuRunPrintPending() {
  try {
    hoSoV2SetRuntimeSource_('MENU');
    if (typeof HosoPrintWorker_runPending !== 'function') {
      SpreadsheetApp.getUi().alert('HosoPrintWorker_runPending không tồn tại.');
      return;
    }
    var r = HosoPrintWorker_runPending();
    if (typeof hoSoV2AdminAlertJson_ === 'function') {
      hoSoV2AdminAlertJson_('Print Worker Pending', r);
    } else {
      SpreadsheetApp.getUi().alert(HOSO_json_(r));
    }
  } catch (e4) {
    SpreadsheetApp.getUi().alert(String(e4 && e4.message ? e4.message : e4));
  } finally {
    hoSoV2SetRuntimeSource_('HOSO_SERVICE');
  }
}

function HOSO_Menu_enumV2Health() {
  try {
    hoSoV2SetRuntimeSource_('MENU');
    var r =
      typeof HOSO_EnumV2_healthCheck === 'function'
        ? HOSO_EnumV2_healthCheck()
        : { ok: false, code: 'HANDLER_NOT_FOUND', message: 'HOSO_EnumV2_healthCheck not loaded' };
    SpreadsheetApp.getUi().alert(JSON.stringify(r, null, 2));
  } catch (eH) {
    SpreadsheetApp.getUi().alert(JSON.stringify({ ok: false, error: String(eH && eH.message ? eH.message : eH) }, null, 2));
  } finally {
    hoSoV2SetRuntimeSource_('HOSO_SERVICE');
  }
}

function HOSO_Menu_syncEnumV2() {
  try {
    hoSoV2SetRuntimeSource_('MENU');
    var r =
      typeof HOSO_EnumV2_syncAll === 'function'
        ? HOSO_EnumV2_syncAll()
        : { ok: false, code: 'HANDLER_NOT_FOUND', message: 'HOSO_EnumV2_syncAll not loaded' };
    SpreadsheetApp.getUi().alert(JSON.stringify(r, null, 2));
  } catch (eS) {
    SpreadsheetApp.getUi().alert(JSON.stringify({ ok: false, error: String(eS && eS.message ? eS.message : eS) }, null, 2));
  } finally {
    hoSoV2SetRuntimeSource_('HOSO_SERVICE');
  }
}

function HOSO_Menu_ensureEnumV2Schema() {
  try {
    hoSoV2SetRuntimeSource_('MENU');
    var r =
      typeof HOSO_EnumV2_ensureSchema === 'function'
        ? HOSO_EnumV2_ensureSchema()
        : { ok: false, code: 'HANDLER_NOT_FOUND', message: 'HOSO_EnumV2_ensureSchema not loaded' };
    SpreadsheetApp.getUi().alert(JSON.stringify(r, null, 2));
  } catch (eE) {
    SpreadsheetApp.getUi().alert(JSON.stringify({ ok: false, error: String(eE && eE.message ? eE.message : eE) }, null, 2));
  } finally {
    hoSoV2SetRuntimeSource_('HOSO_SERVICE');
  }
}
