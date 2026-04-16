/**
 * HO_SO PRO — Spreadsheet UI bindings (wrapper → Impl).
 * Submenu labels: 90_BOOTSTRAP_MENU.js → "📁 Hồ sơ Module".
 * Dependencies: 10_HOSO_WRAPPERS, SpreadsheetApp UI
 */

function menuAuditHoSo() {
  return menuAuditHoSoImpl();
}

function menuAuditHoSoImpl() {
  var r = runHosoTestsImpl();
  var ui = SpreadsheetApp.getUi();
  if (!ui) return r;
  var msg = (r.ok !== false ? 'OK' : 'Có vấn đề') + '\nPassed: ' + r.passed + ' / ' + r.total;
  if (r.details && r.details.length) {
    msg += '\n\n' + r.details.filter(function(d) { return !d.passed; }).slice(0, 5).map(function(d) { return d.test + ': ' + d.message; }).join('\n');
  }
  ui.alert('Audit Hồ sơ (PRO)', msg, ui.ButtonSet.OK);
  return r;
}

function menuSeedHoSoDemo() {
  return menuSeedHoSoDemoImpl();
}

function menuSeedHoSoDemoImpl() {
  var r = seedHoSoDemoImpl();
  var ui = SpreadsheetApp.getUi();
  if (ui) ui.alert('Gieo Hồ sơ Demo', (r && r.message) ? r.message : JSON.stringify(r), ui.ButtonSet.OK);
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
  var r = hosoRunFullDeploymentMenuImpl();
  var ui = SpreadsheetApp.getUi();
  if (ui) ui.alert('Triển khai HO_SO', r.ok ? 'Hoàn tất (xem log Execution)' : 'Có bước lỗi — xem log', ui.ButtonSet.OK);
  return r;
}
