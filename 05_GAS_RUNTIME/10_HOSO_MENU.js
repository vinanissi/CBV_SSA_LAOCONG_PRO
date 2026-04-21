/**
 * HO_SO PRO — Spreadsheet UI bindings (wrapper → Impl).
 * Submenu labels: 90_BOOTSTRAP_MENU.js → "Records (HO_SO)".
 * Dependencies: 10_HOSO_WRAPPERS, SpreadsheetApp UI
 */

function menuAuditHoSo() {
  return menuAuditHoSoImpl();
}

function menuAuditHoSoImpl() {
  var r = hosoRunTests();
  var ui = SpreadsheetApp.getUi();
  if (!ui) return r;
  var msg = (r.ok !== false ? 'OK' : 'Issues found') + '\nPassed: ' + r.passed + ' / ' + r.total;
  if (r.details && r.details.length) {
    msg += '\n\n' + r.details.filter(function(d) { return !d.passed; }).slice(0, 5).map(function(d) { return d.test + ': ' + d.message; }).join('\n');
  }
  ui.alert('HO_SO audit (PRO)', msg, ui.ButtonSet.OK);
  return r;
}

function menuSeedHoSoDemo() {
  return menuSeedHoSoDemoImpl();
}

function menuSeedHoSoDemoImpl() {
  var r = hosoSeedDemo();
  var ui = SpreadsheetApp.getUi();
  if (ui) ui.alert('Seed HO_SO demo', (r && r.message) ? r.message : JSON.stringify(r), ui.ButtonSet.OK);
  return r;
}

function menuTestHoSoRelations() {
  return menuTestHoSoRelationsImpl();
}

function menuTestHoSoRelationsImpl() {
  return menuAuditHoSoImpl();
}

function menuHosoFullDeploy() {
  return menuHosoFullDeployImpl();
}

function menuHosoFullDeployImpl() {
  var r = hosoFullDeploy({ includeMigration: false });
  var ui = SpreadsheetApp.getUi();
  if (ui) ui.alert('Deploy HO_SO', r.ok ? 'Finished (see Execution log)' : 'A step failed — see Execution log', ui.ButtonSet.OK);
  return r;
}
