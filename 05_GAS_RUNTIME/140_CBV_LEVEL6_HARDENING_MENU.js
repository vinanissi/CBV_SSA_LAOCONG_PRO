/**
 * CBV Level 6 Pro — UI menu.
 * Dependencies: 139
 */

function buildCbvLevel6Menu_() {
  var ui = SpreadsheetApp.getUi();
  if (!ui) return;
  ui.createMenu('🛡️ CBV Level 6 Pro')
    .addItem('Bootstrap Hardening', 'CBV_L6_menuBootstrapHardening')
    .addItem('Validate All Schemas', 'CBV_L6_menuValidateAllSchemas')
    .addItem('Seed Error Codes', 'CBV_L6_menuSeedErrorCodes')
    .addItem('Seed Permission Rules', 'CBV_L6_menuSeedPermissionRules')
    .addItem('Seed Retry Policies', 'CBV_L6_menuSeedRetryPolicies')
    .addItem('Seed Event Consumers', 'CBV_L6_menuSeedEventConsumers')
    .addItem('Run Governance Check', 'CBV_L6_menuRunGovernanceCheck')
    .addItem('Run Hardening Self Test', 'CBV_L6_menuHardeningSelfTest')
    .addToUi();
}

function CBV_L6_menuBootstrapHardening() {
  try {
    var r = CBV_L6_bootstrapHardening();
    SpreadsheetApp.getUi().alert('CBV Level 6 — Bootstrap', cbvCoreV2SafeStringify_(r), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('Bootstrap error', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function CBV_L6_menuValidateAllSchemas() {
  try {
    var r = CBV_L6_validateAllSchemas();
    SpreadsheetApp.getUi().alert('Validate All Schemas', cbvCoreV2SafeStringify_(r), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('Validate error', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function CBV_L6_menuSeedErrorCodes() {
  try {
    var r = CBV_L6_seedErrorCodes();
    SpreadsheetApp.getUi().alert('Seed Error Codes', cbvCoreV2SafeStringify_(r), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('Seed error', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function CBV_L6_menuSeedPermissionRules() {
  try {
    var r = CBV_L6_seedPermissionRules();
    SpreadsheetApp.getUi().alert('Seed Permission Rules', cbvCoreV2SafeStringify_(r), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('Seed error', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function CBV_L6_menuSeedRetryPolicies() {
  try {
    var r = CBV_L6_seedRetryPolicies();
    SpreadsheetApp.getUi().alert('Seed Retry Policies', cbvCoreV2SafeStringify_(r), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('Seed error', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function CBV_L6_menuSeedEventConsumers() {
  try {
    var r = CBV_L6_seedEventConsumers();
    SpreadsheetApp.getUi().alert('Seed Event Consumers', cbvCoreV2SafeStringify_(r), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('Seed error', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function CBV_L6_menuRunGovernanceCheck() {
  try {
    var r = CBV_L6_runDevGovernanceCheck();
    SpreadsheetApp.getUi().alert('Governance Check', cbvCoreV2SafeStringify_(r), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('Governance error', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function CBV_L6_menuHardeningSelfTest() {
  try {
    var r = CBV_L6_hardeningSelfTest();
    SpreadsheetApp.getUi().alert('Hardening Self Test', cbvCoreV2SafeStringify_(r), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('Self test error', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}
