/**
 * Main Control — onOpen: install bound menus (Core V2, Level 6, HOSO setup, dashboard).
 */

function onOpen(e) {
  try {
    if (typeof CBV_CoreV2_menuBootstrap === 'function') {
      CBV_CoreV2_menuBootstrap();
    }
  } catch (err) {
    Logger.log('CBV_CoreV2_menuBootstrap error: ' + err);
  }

  try {
    if (typeof buildCbvLevel6Menu_ === 'function') {
      buildCbvLevel6Menu_();
    }
  } catch (err) {
    Logger.log('buildCbvLevel6Menu_ error: ' + err);
  }

  try {
    if (typeof buildHosoV22SetupMenu_ === 'function') {
      buildHosoV22SetupMenu_();
    }
  } catch (err) {
    Logger.log('buildHosoV22SetupMenu_ error: ' + err);
  }

  try {
    if (typeof buildMainControlDashboardMenu_ === 'function') {
      buildMainControlDashboardMenu_();
    }
  } catch (err) {
    Logger.log('buildMainControlDashboardMenu_ error: ' + err);
  }

  try {
    if (typeof buildConfigMenu_ === 'function') {
      buildConfigMenu_();
    }
  } catch (err) {
    Logger.log('buildConfigMenu_ error: ' + err);
  }

  try {
    if (typeof buildMainControlWebAppMenu_ === 'function') {
      buildMainControlWebAppMenu_();
    }
  } catch (err) {
    Logger.log('buildMainControlWebAppMenu_ error: ' + err);
  }
}
