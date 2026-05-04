/**
 * CONFIG module — UI menu (dispatches through CBV_CoreV2_dispatch).
 * Dependencies: 20, 162 (handler), 166, 201 (V2_2 import menu handlers)
 */

function buildConfigMenu_() {
  var ui = SpreadsheetApp.getUi();
  if (!ui) return;
  ui.createMenu('⚙️ CONFIG')
    .addItem('Health Check', 'Config_menuHealthCheck')
    .addItem('Bootstrap CONFIG module (DB + registry)', 'Config_menuBootstrapConfigModule')
    .addItem('Seed Enum', 'Config_menuSeedEnum')
    .addSeparator()
    .addItem('Import V1 Data to V2_2 — Dry Run', 'Config_menuV22ImportDryRun')
    .addItem('Import V1 Data to V2_2 — Apply', 'Config_menuV22ImportApply')
    .addItem('Import V1 Data to V2_2 — Verify', 'Config_menuV22ImportVerify')
    .addSeparator()
    .addItem('HOSO Config Health (tracked)', 'HOSO_Config_menuHealthCheck')
    .addItem('HOSO Config Tracked Test', 'HOSO_Config_menuTestTracked')
    .addToUi();
}

function Config_menuHealthCheck() {
  try {
    var r = CBV_CoreV2_dispatch({
      commandType: 'CONFIG_HEALTH_CHECK',
      moduleCode: 'CONFIG',
      source: 'MENU',
      requestBy: typeof cbvUser === 'function' ? cbvUser() : 'system',
      idempotencyKey: 'cfg_menu_health_' + Utilities.getUuid(),
      payload: {}
    });
    SpreadsheetApp.getUi().alert('CONFIG Health', cbvCoreV2SafeStringify_(r), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('CONFIG Health error', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function Config_menuBootstrapConfigModule() {
  try {
    var r = CBV_ConfigModule_bootstrap();
    SpreadsheetApp.getUi().alert('CONFIG Bootstrap', cbvCoreV2SafeStringify_(r), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('CONFIG Bootstrap error', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function HOSO_Config_menuHealthCheck() {
  try {
    var r = HOSO_Config_healthCheck_();
    SpreadsheetApp.getUi().alert('HOSO Config Health', JSON.stringify(r, null, 2), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('HOSO Config Health', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function HOSO_Config_menuTestTracked() {
  try {
    var r = test_HOSO_UsesConfigTracked_();
    SpreadsheetApp.getUi().alert('HOSO Config Tracked', JSON.stringify(r, null, 2), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('HOSO Config Tracked', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function Config_menuSeedEnum() {
  try {
    var r = CBV_CoreV2_dispatch({
      commandType: 'CONFIG_ADD_ENUM',
      moduleCode: 'CONFIG',
      source: 'MENU',
      requestBy: typeof cbvUser === 'function' ? cbvUser() : 'system',
      idempotencyKey: 'cfg_menu_seed_enum_' + Utilities.getUuid(),
      payload: {
        enumGroup: 'SYSTEM',
        enumKey: 'MENU_SEED',
        enumValue: cbvCoreV2IsoNow_(),
        status: 'ACTIVE'
      }
    });
    SpreadsheetApp.getUi().alert('CONFIG Seed Enum', cbvCoreV2SafeStringify_(r), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('CONFIG Seed Enum error', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}
