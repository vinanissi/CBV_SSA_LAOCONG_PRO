/**
 * CBV Core V2 — standalone menu (does not alter CBV PRO menu).
 */

function buildCbvCoreV2Menu_() {
  var ui = SpreadsheetApp.getUi();
  if (!ui) return;
  ui.createMenu('⚙️ CBV Core V2')
    .addItem('Bootstrap Core V2 (sheets + registry)', 'CBV_CoreV2_menuDeploySheets')
    .addItem('Health Check', 'CBV_CoreV2_menuHealthCheck')
    .addItem('Run Event Worker', 'CBV_CoreV2_menuRunEventWorker')
    .addSeparator()
    .addItem('Self Test', 'CBV_CoreV2_menuSelfTest')
    .addItem('Test HO_SO_CREATE', 'CBV_CoreV2_menuTestHoSoCreate')
    .addToUi();
}

/**
 * Install Core V2 menu (safe to call from onOpen or manually).
 */
function CBV_CoreV2_menuBootstrap() {
  buildCbvCoreV2Menu_();
}

/**
 * Run sheet/registry bootstrap with UI feedback (menu action).
 */
function CBV_CoreV2_menuDeploySheets() {
  try {
    var r = CBV_CoreV2_bootstrap();
    SpreadsheetApp.getUi().alert('CBV Core V2 — Bootstrap', cbvCoreV2SafeStringify_(r), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('Bootstrap error', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function CBV_CoreV2_menuHealthCheck() {
  try {
    var r = CBV_CoreV2_healthCheck();
    SpreadsheetApp.getUi().alert('CBV Core V2 — Health', r.ok ? 'OK\n' + r.message : JSON.stringify(r, null, 2), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('Health error', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function CBV_CoreV2_menuRunEventWorker() {
  try {
    var r = CBV_CoreV2_runEventWorker();
    SpreadsheetApp.getUi().alert('CBV Core V2 — Event Worker', r.message + '\n' + cbvCoreV2SafeStringify_(r.data || {}), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('Worker error', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function CBV_CoreV2_menuSelfTest() {
  try {
    var r = CBV_CoreV2_selfTest();
    SpreadsheetApp.getUi().alert('CBV Core V2 — Self Test', cbvCoreV2SafeStringify_(r), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('Self test error', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function CBV_CoreV2_menuTestHoSoCreate() {
  try {
    var plate = '99MNU' + Utilities.getUuid().replace(/-/g, '').slice(0, 6).toUpperCase();
    var res = CBV_CoreV2_dispatch({
      commandType: 'HO_SO_CREATE',
      moduleCode: 'HO_SO',
      source: 'MENU',
      requestBy: cbvUser(),
      idempotencyKey: 'menu_test_' + Utilities.getUuid(),
      payload: {
        hoSoType: 'XE',
        title: 'CoreV2 menu test ' + plate,
        xaVien: { hoTen: 'Menu test chủ xe' },
        phuongTien: { bienSo: plate }
      }
    });
    SpreadsheetApp.getUi().alert('HO_SO_CREATE', cbvCoreV2SafeStringify_(res), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('Dispatch error', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}
