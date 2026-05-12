/**
 * Phase 79 — TASK FE Operational Workspace — menus (business vs test separated).
 *
 * Install:
 * - Call `buildTaskFeWorkspaceMenu_()` from the bound spreadsheet `onOpen` (same pattern as other CBV menus).
 * - Test items are registered from `CBV_TEST_CONSOLE_MENU.js` (🧪 CBV Test Console only).
 */

/**
 * Operational menu — does not include test entries.
 */
function buildTaskFeWorkspaceMenu_() {
  try {
    var ui = SpreadsheetApp.getUi();
    if (!ui) return;

    ui.createMenu('📌 CBV TASK Workspace')
      .addItem('Home / Today Workspace', 'TASK_FE_Home_open')
      .addItem('Focus Task', 'TASK_FE_Focus_menuOpen')
      .addSeparator()
      .addItem('Admin Dashboard', 'TASK_FE_Admin_open')
      .addSeparator()
      .addItem('Task Detail / Timeline…', 'TASK_FE_Detail_menuPromptOpen')
      .addToUi();
  } catch (e) {
    Logger.log('buildTaskFeWorkspaceMenu_ error: ' + e);
  }
}

/**
 * Optional one-shot bootstrap for spreadsheets that only load Phase 79 menus.
 */
function TASK_FE_Menu_bootstrap() {
  buildTaskFeWorkspaceMenu_();
}

function TASK_FE_Focus_menuOpen() {
  TASK_FE_Focus_open('');
}

function TASK_FE_Detail_menuPromptOpen() {
  var ui = SpreadsheetApp.getUi();
  var r = ui.prompt('Task Detail / Timeline', 'Nhập TASK_ID:', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  var id = String(r.getResponseText() || '').trim();
  if (!id) {
    ui.alert('TASK_ID trống.');
    return;
  }
  TASK_FE_Detail_open(id);
}
