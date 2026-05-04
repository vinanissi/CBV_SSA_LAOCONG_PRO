/**
 * HO_SO V2 — admin menu (JSON alerts, không thay thế 121_HO_SO_V2_MENU).
 */

/**
 * @param {string} title
 * @param {*} payload
 */
function hoSoV2AdminAlertJson_(title, payload) {
  SpreadsheetApp.getUi().alert(title, JSON.stringify(payload, null, 2), SpreadsheetApp.getUi().ButtonSet.OK);
}

function buildHoSoV2AdminMenu_() {
  var ui = SpreadsheetApp.getUi();
  if (!ui) return;
  ui.createMenu('📁 HO_SO_V2 Admin')
    .addItem('Bootstrap HOSO DB', 'HoSoV2Admin_menuBootstrap')
    .addItem('Health Check', 'HoSoV2Admin_menuHealth')
    .addItem('Self Test', 'HoSoV2Admin_menuSelfTest')
    .addItem('Test Create Hồ sơ', 'HoSoV2Admin_menuTestCreate')
    .addItem('Rebuild Search Index', 'HoSoV2Admin_menuRebuildSearch')
    .addItem('Verify CONFIG Mapping', 'HoSoV2Admin_menuVerifyConfig')
    .addItem('Open HOSO DB', 'HoSoV2Admin_menuOpenHosoDb')
    .addItem('Open CONFIG DB', 'HoSoV2Admin_menuOpenConfigDb')
    .addItem('Open Command Log', 'HoSoV2Admin_menuOpenCommandLog')
    .addItem('Open Event Log', 'HoSoV2Admin_menuOpenEventLog')
    .addItem('Open System Health', 'HoSoV2Admin_menuOpenSystemHealth')
    .addSeparator()
    .addItem('Run Print Worker', 'HosoPrintWorker_menuRunPending')
    .addItem('Run Selected Print Job', 'HosoPrintWorker_menuRunSelected')
    .addItem('Install Print Worker Trigger', 'HosoPrintWorker_installTrigger')
    .addItem('Create Test Print Template', 'HosoPrintTemplateSetup_menuCreateTestTemplate')
    .addToUi();
}

function HoSoV2Admin_menuBootstrap() {
  try {
    hoSoV2SetRuntimeSource_('MENU');
    var r = HosoService_bootstrapSheets();
    hoSoV2AdminAlertJson_('Bootstrap HOSO DB', r);
  } catch (e) {
    hoSoV2AdminAlertJson_('Bootstrap HOSO DB', { ok: false, error: String(e && e.message ? e.message : e) });
  } finally {
    hoSoV2SetRuntimeSource_('HOSO_SERVICE');
  }
}

function HoSoV2Admin_menuHealth() {
  try {
    hoSoV2SetRuntimeSource_('MENU');
    var r =
      typeof HosoService_healthCheck === 'function' ? HosoService_healthCheck() : HoSoV2_Health_check();
    hoSoV2AdminAlertJson_('Health Check', r);
  } catch (e) {
    hoSoV2AdminAlertJson_('Health Check', { ok: false, error: String(e && e.message ? e.message : e) });
  } finally {
    hoSoV2SetRuntimeSource_('HOSO_SERVICE');
  }
}

function HoSoV2Admin_menuSelfTest() {
  try {
    hoSoV2SetRuntimeSource_('MENU');
    var r = typeof HosoService_selfTest === 'function' ? HosoService_selfTest() : HoSoV2_selfTest();
    hoSoV2AdminAlertJson_('Self Test', r);
  } catch (e) {
    hoSoV2AdminAlertJson_('Self Test', { ok: false, error: String(e && e.message ? e.message : e) });
  } finally {
    hoSoV2SetRuntimeSource_('HOSO_SERVICE');
  }
}

function HoSoV2Admin_menuTestCreate() {
  try {
    hoSoV2SetRuntimeSource_('MENU');
    var plate = hoSoV2TestPlate_();
    var res = CBV_CoreV2_dispatch({
      commandType: 'HOSO_CREATE',
      moduleCode: 'HOSO',
      source: 'MENU',
      requestBy: typeof cbvUser === 'function' ? cbvUser() : 'system',
      idempotencyKey: 'hoso_v2_admin_' + Utilities.getUuid(),
      payload: {
        hoSoType: 'XE',
        title: 'TEST Admin ' + plate,
        xaVien: { hoTen: 'Chủ xe ' + plate },
        phuongTien: { bienSo: plate, hieuXe: 'Ford' },
        taiXe: { hoTen: 'Lái xe test', phone: '0912345678' }
      }
    });
    hoSoV2AdminAlertJson_('Test Create Hồ sơ', res);
  } catch (e) {
    hoSoV2AdminAlertJson_('Test Create Hồ sơ', { ok: false, error: String(e && e.message ? e.message : e) });
  } finally {
    hoSoV2SetRuntimeSource_('HOSO_SERVICE');
  }
}

function HoSoV2Admin_menuRebuildSearch() {
  try {
    hoSoV2SetRuntimeSource_('MENU');
    var ui = SpreadsheetApp.getUi();
    var pr = ui.prompt('Rebuild Search Index', 'Nhập HO_SO_ID:', ui.ButtonSet.OK_CANCEL);
    if (pr.getSelectedButton() !== ui.Button.OK) {
      hoSoV2AdminAlertJson_('Rebuild Search Index', { ok: false, cancelled: true });
      return;
    }
    var hoSoId = String(pr.getResponseText() || '').trim();
    if (!hoSoId) {
      hoSoV2AdminAlertJson_('Rebuild Search Index', { ok: false, error: 'HO_SO_ID empty' });
      return;
    }
    var out = HosoService_rebuildSearchIndex({
      commandId: 'ADMIN_REBUILD_' + Utilities.getUuid().slice(0, 12),
      commandType: 'HOSO_REBUILD_SEARCH_INDEX',
      moduleCode: 'HOSO',
      source: 'MENU',
      requestBy: typeof cbvUser === 'function' ? cbvUser() : 'system',
      payload: { hoSoId: hoSoId }
    });
    hoSoV2AdminAlertJson_('Rebuild Search Index', out);
  } catch (e) {
    hoSoV2AdminAlertJson_('Rebuild Search Index', { ok: false, error: String(e && e.message ? e.message : e) });
  } finally {
    hoSoV2SetRuntimeSource_('HOSO_SERVICE');
  }
}

function HoSoV2Admin_menuVerifyConfig() {
  try {
    var out = {};
    if (typeof HOSO_Config_healthCheck_ === 'function') {
      out.hosoConfigHealth = HOSO_Config_healthCheck_();
    } else {
      out.hosoConfigHealth = { ok: false, skipped: true, message: 'HOSO_Config_healthCheck_ not loaded' };
    }
    if (typeof test_HOSO_UsesConfigTracked_ === 'function') {
      try {
        out.trackedSmoke = test_HOSO_UsesConfigTracked_();
      } catch (e2) {
        out.trackedSmoke = { ok: false, error: String(e2 && e2.message ? e2.message : e2) };
      }
    } else {
      out.trackedSmoke = { ok: false, skipped: true, message: 'test_HOSO_UsesConfigTracked_ not loaded' };
    }
    hoSoV2AdminAlertJson_('Verify CONFIG Mapping', out);
  } catch (e) {
    hoSoV2AdminAlertJson_('Verify CONFIG Mapping', { ok: false, error: String(e && e.message ? e.message : e) });
  }
}

function HoSoV2Admin_menuOpenHosoDb() {
  try {
    var id = '';
    if (typeof HOSO_Config_getDbId_ === 'function') {
      id = String(HOSO_Config_getDbId_({ source: 'MENU' }) || '').trim();
    }
    if (!id && typeof CBV_Config_getDbId === 'function') {
      id = String(CBV_Config_getDbId('HOSO') || '').trim();
    }
    if (!id) throw new Error('HOSO_DB_ID_MISSING');
    var url = 'https://docs.google.com/spreadsheets/d/' + id + '/edit';
    hoSoV2AdminAlertJson_('Open HOSO DB', { ok: true, spreadsheetId: id, url: url, hint: 'Mở URL trong trình duyệt' });
  } catch (e) {
    hoSoV2AdminAlertJson_('Open HOSO DB', { ok: false, error: String(e && e.message ? e.message : e) });
  }
}

function HoSoV2Admin_menuOpenConfigDb() {
  try {
    var id = String(PropertiesService.getScriptProperties().getProperty('CBV_CONFIG_DB_ID') || '').trim();
    if (!id) throw new Error('CBV_CONFIG_DB_ID_MISSING');
    var url = 'https://docs.google.com/spreadsheets/d/' + id + '/edit';
    hoSoV2AdminAlertJson_('Open CONFIG DB', { ok: true, spreadsheetId: id, url: url, hint: 'Mở URL trong trình duyệt' });
  } catch (e) {
    hoSoV2AdminAlertJson_('Open CONFIG DB', { ok: false, error: String(e && e.message ? e.message : e) });
  }
}

function HoSoV2Admin_menuOpenCommandLog() {
  hoSoV2AdminOpenSheet_('CBV_COMMAND_LOG');
}

function HoSoV2Admin_menuOpenEventLog() {
  hoSoV2AdminOpenSheet_('CBV_EVENT_LOG');
}

function HoSoV2Admin_menuOpenSystemHealth() {
  hoSoV2AdminOpenSheet_('CBV_SYSTEM_HEALTH');
}

function hoSoV2AdminOpenSheet_(sheetName) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(sheetName);
    if (!sh) {
      hoSoV2AdminAlertJson_('Open Sheet', {
        ok: false,
        message: 'Sheet not found: ' + sheetName
      });
      return;
    }
    ss.setActiveSheet(sh);
  } catch (e) {
    hoSoV2AdminAlertJson_('Open Sheet Error', {
      ok: false,
      message: String(e && e.message ? e.message : e)
    });
  }
}
