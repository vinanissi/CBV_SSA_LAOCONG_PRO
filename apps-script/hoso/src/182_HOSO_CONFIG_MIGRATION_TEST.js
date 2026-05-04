/**
 * HOSO — smoke test for CONFIG tracked path.
 * Dependencies: 180, 181
 */

/**
 * @returns {{ ok: boolean, message: string, dbId: string }}
 */
function test_HOSO_UsesConfigTracked_() {
  var h = HOSO_Config_healthCheck_();
  if (!h.ok) throw new Error('HOSO_CONFIG_HEALTH_FAIL:' + JSON.stringify(h));

  var master = HOSO_Config_getSheet_('MASTER', { source: 'TEST' });
  if (!master) throw new Error('HOSO_MASTER_NOT_OPENED');

  return {
    ok: true,
    message: 'HOSO CONFIG TRACKED READY',
    dbId: h.dbId
  };
}
