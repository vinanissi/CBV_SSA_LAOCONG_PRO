/**
 * HO_SO V2 — self test (prefix TEST_*, không xóa dữ liệu).
 */

/**
 * @returns {string}
 */
function hoSoV2TestPlate_() {
  return 'TEST_' + Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase();
}

/**
 * @returns {Object}
 */
function HoSoV2_selfTest() {
  var steps = [];
  var okAll = true;

  function step(name, pass, detail) {
    steps.push({ name: name, ok: !!pass, detail: detail || '' });
    if (!pass) okAll = false;
  }

  try {
    var b = HoSoV2_bootstrapSheets();
    step('bootstrap_sheets', !!(b && b.ok), JSON.stringify(b.sheets ? b.sheets.length : 0));

    var plate = hoSoV2TestPlate_();
    var actor = 'system';
    var cmdBase = { source: 'TEST', requestBy: actor, moduleCode: 'HOSO' };

    var c1 = HosoService_create({
      commandId: 'TST_CREATE_1',
      commandType: 'HOSO_CREATE',
      source: 'TEST',
      requestBy: actor,
      payload: {
        hoSoType: 'XE',
        title: 'TEST_HOSO_V2_' + plate,
        ownerEmail: 'test@example.com',
        xaVien: { hoTen: 'TEST Chủ xe ' + plate, cccd: '079' + Utilities.getUuid().replace(/\D/g, '').slice(0, 9) },
        phuongTien: { bienSo: plate, hieuXe: 'TEST_XE' },
        taiXe: { hoTen: 'TEST Tài xế', phone: '0901234567' }
      }
    });
    step('create_sample', !!(c1 && c1.ok && c1.entityId), c1.message || '');
    var hoSoId = c1.entityId;

    var m = hoSoV2GetSheet_('MASTER');
    var mr = hoSoV2FindRowByColumn_(m, 'HO_SO_ID', hoSoId);
    step('master_row', mr >= 2, 'row=' + mr);

    var ptRows = hoSoV2FindAllRowsByHoSoId_(hoSoV2GetSheet_('PHUONG_TIEN'), 'HO_SO_ID', hoSoId);
    var xvRows = hoSoV2FindAllRowsByHoSoId_(hoSoV2GetSheet_('XA_VIEN'), 'HO_SO_ID', hoSoId);
    step('child_rows', ptRows.length >= 1 && xvRows.length >= 1, 'pt=' + ptRows.length + ' xv=' + xvRows.length);

    var dup = HosoService_create({
      commandId: 'TST_DUP',
      commandType: 'HOSO_CREATE',
      source: 'TEST',
      requestBy: actor,
      payload: {
        hoSoType: 'XE',
        title: 'TEST_DUP',
        xaVien: { hoTen: 'Khác' },
        phuongTien: { bienSo: plate }
      }
    });
    step('duplicate_blocked', !!(dup && dup.ok === false && dup.error && dup.error.code === 'DUPLICATE_FOUND'), dup.message || '');

    var sr = HoSoV2_Search_search({ keyword: plate, entityType: 'ALL', limit: 20 });
    step('search_by_plate', !!(sr && sr.ok && sr.results && sr.results.length > 0), (sr.results && sr.results.length) || 0);

    var att = HoSoV2_Attachment_attachFile({
      commandId: 'TST_ATT',
      commandType: 'HOSO_ATTACH_FILE',
      source: 'TEST',
      requestBy: actor,
      payload: {
        hoSoId: hoSoId,
        entityType: 'HO_SO',
        entityId: hoSoId,
        fileType: 'TEST',
        fileName: 'TEST_file.pdf',
        fileUrl: 'https://example.com/test.pdf',
        note: 'TEST attach'
      }
    });
    step('attach_file', !!(att && att.ok), att.message || '');

    hoSoV2EnsureSheet_('TEMPLATE', 'TEMPLATE');
    var tplSh = hoSoV2GetSheet_('TEMPLATE');
    var tplCode = 'TEST_TPL_' + plate.slice(0, 6);
    hoSoV2AppendRow_(tplSh, {
      TEMPLATE_ID: hoSoV2NewId_('TPL'),
      TEMPLATE_CODE: tplCode,
      TEMPLATE_NAME: 'Test template',
      TEMPLATE_TYPE: 'PDF',
      TEMPLATE_SOURCE_ID: '',
      TEMPLATE_SOURCE_URL: '',
      STATUS: 'ACTIVE',
      VERSION: '1',
      CONFIG_JSON: '{}',
      CREATED_AT: cbvCoreV2IsoNow_(),
      UPDATED_AT: cbvCoreV2IsoNow_()
    });

    var pr = HoSoV2_Print_createPrintJob({
      commandId: 'TST_PRN',
      commandType: 'HOSO_PRINT',
      source: 'TEST',
      requestBy: actor,
      payload: { hoSoId: hoSoId, templateCode: tplCode, payloadOverride: { test: true } }
    });
    step(
      'print_job',
      !!(pr && pr.ok && pr.data && (pr.data.status === HO_SO_V2.PRINT_JOB_STATUS.PENDING || pr.data.status === HO_SO_V2.PRINT_JOB_STATUS.PENDING_TEMPLATE)),
      pr.data ? pr.data.status : ''
    );

    var gd = HosoService_getDetail({
      commandId: 'TST_GET',
      commandType: 'HOSO_GET_DETAIL',
      source: 'TEST',
      requestBy: actor,
      payload: { hoSoId: hoSoId }
    });
    step(
      'get_detail',
      !!(gd && gd.ok && gd.data && gd.data.master && gd.data.phuongTienList && gd.data.phuongTienList.length),
      gd.data ? 'ok' : 'fail'
    );

    var st = HosoService_changeStatus({
      commandId: 'TST_ST',
      commandType: 'HOSO_CHANGE_STATUS',
      source: 'TEST',
      requestBy: actor,
      payload: { hoSoId: hoSoId, status: 'ACTIVE', reason: 'TEST' }
    });
    step('change_status_active', !!(st && st.ok), st.message || '');

    var hh = HoSoV2_Health_check();
    step('health_ok', !!(hh && hh.ok), hh.message || '');
  } catch (e) {
    okAll = false;
    steps.push({ name: 'exception', ok: false, detail: String(e && e.message ? e.message : e) });
  }

  return {
    ok: okAll,
    code: okAll ? 'HOSO_V2_SELFTEST_PASS' : 'HOSO_V2_SELFTEST_FAIL',
    message: okAll ? 'OK' : 'See steps',
    data: { steps: steps },
    error: okAll ? null : { code: 'HOSO_V2_SELFTEST_FAIL', message: 'Failed' }
  };
}
