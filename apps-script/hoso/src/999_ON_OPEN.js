function onOpen(e) {
  try {
    if (typeof buildHoSoV2Menu_ === 'function') {
      buildHoSoV2Menu_();
    }
  } catch (err) {
    Logger.log('buildHoSoV2Menu_ error: ' + err);
  }

  try {
    if (typeof buildHoSoV2AdminMenu_ === 'function') {
      buildHoSoV2AdminMenu_();
    }
  } catch (err2) {
    Logger.log('buildHoSoV2AdminMenu_ error: ' + err2);
  }

  try {
    if (typeof buildHoSoV2WebAppMenu_ === 'function') {
      buildHoSoV2WebAppMenu_();
    }
  } catch (err3) {
    Logger.log('buildHoSoV2WebAppMenu_ error: ' + err3);
  }
}
