function CBV_CoreV2_createCoreDb() {
  var ss = SpreadsheetApp.create('CBV_LAOCONG_CORE_DB');
  var id = ss.getId();

  PropertiesService.getScriptProperties().setProperty('CBV_CORE_DB_ID', id);

  var r = CBV_CoreV2_bootstrap();

  return {
    ok: true,
    code: 'CORE_DB_CREATED',
    coreDbId: id,
    url: ss.getUrl(),
    bootstrap: r
  };
}
