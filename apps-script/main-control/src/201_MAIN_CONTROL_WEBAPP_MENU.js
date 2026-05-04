/**
 * MAIN_CONTROL — WebApp menu (token, health, connection package, registry).
 */

function buildMainControlWebAppMenu_() {
  var ui = SpreadsheetApp.getUi();
  if (!ui) return;
  ui.createMenu('🌐 CBV MAIN WEBAPP')
    .addItem('Set WebApp Token', 'MC_WebApp_menuSetToken')
    .addItem('Show Connection Package HO_SO_V2', 'MC_WebApp_menuShowPackageHoso')
    .addItem('Test Health', 'MC_WebApp_menuTestHealth')
    .addItem('Test Connection Package', 'MC_WebApp_menuTestConnectionPackage')
    .addSeparator()
    .addItem('View Module Registry', 'MC_WebApp_menuViewRegistry')
    .addItem('Reset Module Registry (HO_SO_V2 DB ID)', 'MC_WebApp_menuResetRegistryHoso')
    .addItem('Test Register HO_SO_V2', 'MC_WebApp_menuTestRegisterHoso')
    .addToUi();
}

function MC_WebApp_menuSetToken() {
  var ui = SpreadsheetApp.getUi();
  var pr = ui.prompt('CBV_MAIN_WEBAPP_TOKEN', 'Nhập token (lưu ScriptProperties):', ui.ButtonSet.OK_CANCEL);
  if (pr.getSelectedButton() !== ui.Button.OK) return;
  var v = String(pr.getResponseText() || '').trim();
  if (!v) {
    ui.alert('Token trống.');
    return;
  }
  PropertiesService.getScriptProperties().setProperty('CBV_MAIN_WEBAPP_TOKEN', v);
  ui.alert('Đã lưu CBV_MAIN_WEBAPP_TOKEN.');
}

function MC_WebApp_menuShowPackageHoso() {
  var ui = SpreadsheetApp.getUi();
  try {
    var r = MC_getConnectionPackage_('HO_SO_V2');
    ui.alert('Connection Package', MC_json_(r), ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Lỗi', String(e && e.message ? e.message : e), ui.ButtonSet.OK);
  }
}

function MC_WebApp_menuTestHealth() {
  var ui = SpreadsheetApp.getUi();
  try {
    var h = MC_stdResponse_(true, 'MAIN_CONTROL_WEBAPP_HEALTH_OK', 'OK', MC_healthPayload_(), null);
    ui.alert('Health', MC_json_(h), ui.ButtonSet.OK);
  } catch (e2) {
    ui.alert('Lỗi', String(e2 && e2.message ? e2.message : e2), ui.ButtonSet.OK);
  }
}

function MC_WebApp_menuTestConnectionPackage() {
  var ui = SpreadsheetApp.getUi();
  try {
    var tok = String(PropertiesService.getScriptProperties().getProperty('CBV_MAIN_WEBAPP_TOKEN') || '').trim();
    if (!tok) {
      ui.alert('Chưa set CBV_MAIN_WEBAPP_TOKEN.');
      return;
    }
    var url = MC_getMainWebAppUrl_();
    if (!url) {
      ui.alert('Chưa có URL WebApp (deploy hoặc set CBV_MAIN_CONTROL_WEBAPP_URL).');
      return;
    }
    var payload = { action: 'GET_CONNECTION_PACKAGE', moduleCode: 'HO_SO_V2', token: tok };
    var res = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      muteHttpExceptions: true,
      payload: MC_json_(payload)
    });
    var code = res.getResponseCode();
    var txt = res.getContentText() || '';
    ui.alert('HTTP ' + code, txt.length > 1800 ? txt.slice(0, 1800) + '…' : txt, ui.ButtonSet.OK);
  } catch (e3) {
    ui.alert('Lỗi', String(e3 && e3.message ? e3.message : e3), ui.ButtonSet.OK);
  }
}

function MC_WebApp_menuViewRegistry() {
  var ui = SpreadsheetApp.getUi();
  try {
    var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_CORE_V2.SHEETS.MODULE_REGISTRY);
    if (!sheet) {
      ui.alert('Không có sheet CBV_MODULE_REGISTRY.');
      return;
    }
    var map = cbvCoreV2ReadHeaderMap_(sheet);
    var cCode = map['MODULE_CODE'];
    if (!cCode) {
      ui.alert('Thiếu cột MODULE_CODE.');
      return;
    }
    var last = sheet.getLastRow();
    var lines = [];
    var r;
    var maxR = Math.min(last, 35);
    for (r = 2; r <= maxR; r++) {
      var rowObj = {};
      var k;
      for (k in map) {
        if (!Object.prototype.hasOwnProperty.call(map, k)) continue;
        rowObj[k] = sheet.getRange(r, map[k]).getValue();
      }
      lines.push(MC_json_(rowObj));
    }
    ui.alert('Module Registry (first rows)', lines.length ? lines.join('\n---\n') : '(empty)', ui.ButtonSet.OK);
  } catch (e4) {
    ui.alert('Lỗi', String(e4 && e4.message ? e4.message : e4), ui.ButtonSet.OK);
  }
}

function MC_WebApp_menuResetRegistryHoso() {
  var ui = SpreadsheetApp.getUi();
  var conf = ui.alert('Reset HO_SO_V2 MODULE_DB_ID?', 'Xóa MODULE_DB_ID cho dòng HO_SO_V2 (chỉ cột registry).', ui.ButtonSet.OK_CANCEL);
  if (conf !== ui.Button.OK) return;
  try {
    var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_CORE_V2.SHEETS.MODULE_REGISTRY);
    if (!sheet) {
      ui.alert('Không có CBV_MODULE_REGISTRY.');
      return;
    }
    var map = cbvCoreV2ReadHeaderMap_(sheet);
    var row = cbvCoreV2FindFirstRowInColumn_(sheet, 'MODULE_CODE', 'HO_SO_V2');
    if (row < 2 || !map['MODULE_DB_ID']) {
      ui.alert('Không tìm thấy dòng hoặc thiếu cột MODULE_DB_ID.');
      return;
    }
    cbvCoreV2UpdateRowByHeaders_(sheet, row, {
      MODULE_DB_ID: '',
      UPDATED_AT: MC_now_()
    });
    MC_appendEventLogRowTry_('MODULE_REGISTERED', 'HO_SO_V2', 'RESET', { action: 'RESET_MODULE_DB_ID' });
    ui.alert('Đã clear MODULE_DB_ID cho HO_SO_V2.');
  } catch (e5) {
    ui.alert('Lỗi', String(e5 && e5.message ? e5.message : e5), ui.ButtonSet.OK);
  }
}

function MC_WebApp_menuTestRegisterHoso() {
  var ui = SpreadsheetApp.getUi();
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      ui.alert('Mở spreadsheet HOSO (bound) hoặc nhập ID thủ công bằng deploy test.');
      return;
    }
    var id = String(ss.getId() || '').trim();
    var up = MC_upsertModuleRegistry_('HO_SO_V2', id);
    ui.alert('REGISTER', MC_json_({ spreadsheetId: id, result: up }), ui.ButtonSet.OK);
  } catch (e6) {
    ui.alert('Lỗi', String(e6 && e6.message ? e6.message : e6), ui.ButtonSet.OK);
  }
}
