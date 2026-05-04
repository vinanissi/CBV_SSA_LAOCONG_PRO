/**
 * HO_SO V2 — menu (không sửa CBV PRO).
 */

function buildHoSoV2Menu_() {
  var ui = SpreadsheetApp.getUi();
  if (!ui) return;
  ui.createMenu('📁 HO_SO V2')
    .addItem('Bootstrap HO_SO V2 sheets', 'HoSoV2_menuBootstrapSheets')
    .addItem('Health Check HO_SO', 'HoSoV2_menuHealth')
    .addItem('Self Test HO_SO', 'HoSoV2_menuSelfTest')
    .addItem('Rebuild Search Index (prompt HO_SO_ID)', 'HoSoV2_menuRebuildIndex')
    .addItem('Test Create Hồ sơ xe', 'HoSoV2_menuTestCreate')
    .addToUi();
}

function HoSoV2_menuBootstrapSheets() {
  try {
    var r = HoSoV2_bootstrapSheets();
    SpreadsheetApp.getUi().alert('HO_SO V2 Bootstrap', cbvCoreV2SafeStringify_(r), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('Error', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function HoSoV2_menuHealth() {
  try {
    var r = HoSoV2_Health_check();
    SpreadsheetApp.getUi().alert('HO_SO V2 Health', cbvCoreV2SafeStringify_(r), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('Error', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function HoSoV2_menuSelfTest() {
  try {
    var r = HoSoV2_selfTest();
    SpreadsheetApp.getUi().alert('HO_SO V2 Self Test', cbvCoreV2SafeStringify_(r), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('Error', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function HoSoV2_menuRebuildIndex() {
  try {
    var ui = SpreadsheetApp.getUi();
    var r = ui.prompt('Rebuild index', 'Nhập HO_SO_ID:', ui.ButtonSet.OK_CANCEL);
    if (r.getSelectedButton() !== ui.Button.OK) return;
    var id = String(r.getResponseText() || '').trim();
    if (!id) return;
    var cmd = {
      commandId: 'MENU_REBUILD_' + Utilities.getUuid().slice(0, 8),
      commandType: 'HO_SO_REBUILD_SEARCH_INDEX',
      moduleCode: 'HO_SO',
      source: 'MENU',
      requestBy: cbvUser(),
      payload: { hoSoId: id }
    };
    var out = CBV_CoreV2_dispatch(cmd);
    SpreadsheetApp.getUi().alert('Rebuild', cbvCoreV2SafeStringify_(out), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('Error', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function HoSoV2_menuTestCreate() {
  try {
    var plate = hoSoV2TestPlate_();
    var res = CBV_CoreV2_dispatch({
      commandType: 'HO_SO_CREATE',
      moduleCode: 'HO_SO',
      source: 'MENU',
      requestBy: cbvUser(),
      idempotencyKey: 'hoso_v2_menu_' + Utilities.getUuid(),
      payload: {
        hoSoType: 'XE',
        title: 'TEST Menu ' + plate,
        xaVien: { hoTen: 'Chủ xe ' + plate },
        phuongTien: { bienSo: plate, hieuXe: 'Ford' },
        taiXe: { hoTen: 'Lái xe test', phone: '0912345678' }
      }
    });
    SpreadsheetApp.getUi().alert('HO_SO_CREATE', cbvCoreV2SafeStringify_(res), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('Error', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}
