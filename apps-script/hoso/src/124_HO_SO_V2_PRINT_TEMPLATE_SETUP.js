/**
 * HO_SO V2 — idempotent test Docs template + HO_SO_TEMPLATE row for TEST_TPL_TEST_1.
 */

var HOSO_PRINT_TEMPLATE_TEST_CODE_ = 'TEST_TPL_TEST_1';

/** @returns {{ source: string }} */
function HosoPrintTemplateSetup_configContext_() {
  return { source: 'TEMPLATE_SETUP' };
}

/**
 * @returns {string}
 */
function HosoPrintTemplateSetup_now_() {
  if (typeof cbvCoreV2IsoNow_ === 'function') {
    return cbvCoreV2IsoNow_();
  }
  return cbvCoreV2IsoNow_local_();
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @returns {Object<string, number>}
 */
function HosoPrintTemplateSetup_headerMap_(sheet) {
  if (typeof cbvCoreV2ReadHeaderMap_ === 'function') {
    return cbvCoreV2ReadHeaderMap_(sheet);
  }
  return cbvCoreV2ReadHeaderMap_local_(sheet);
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string} columnName
 * @param {string} value
 * @returns {number}
 */
function HosoPrintTemplateSetup_findRow_(sheet, columnName, value) {
  if (typeof cbvCoreV2FindFirstRowInColumn_ === 'function') {
    return cbvCoreV2FindFirstRowInColumn_(sheet, columnName, value);
  }
  return cbvCoreV2FindFirstRowInColumn_local_(sheet, columnName, value);
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {Object<string, *>} row
 */
function HosoPrintTemplateSetup_appendRow_(sheet, row) {
  if (typeof cbvCoreV2AppendRowByHeaders_ === 'function') {
    cbvCoreV2AppendRowByHeaders_(sheet, row);
    return;
  }
  cbvCoreV2AppendRowByHeaders_local_(sheet, row);
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {number} rowIndex
 * @param {Object<string, *>} updates
 */
function HosoPrintTemplateSetup_updateRow_(sheet, rowIndex, updates) {
  if (typeof cbvCoreV2UpdateRowByHeaders_ === 'function') {
    cbvCoreV2UpdateRowByHeaders_(sheet, rowIndex, updates);
    return;
  }
  cbvCoreV2UpdateRowByHeaders_local_(sheet, rowIndex, updates);
}

/**
 * @param {string} prefix
 * @returns {string}
 */
function HosoPrintTemplateSetup_makeId_(prefix) {
  if (typeof cbvMakeId === 'function') {
    return cbvMakeId(prefix || 'TPL');
  }
  return cbvMakeId_local(prefix || 'TPL');
}

/**
 * @returns {string}
 */
function HosoPrintTemplateSetup_configJson_() {
  if (typeof cbvCoreV2SafeStringify_ === 'function') {
    return cbvCoreV2SafeStringify_({ keepDocCopy: false });
  }
  return JSON.stringify({ keepDocCopy: false });
}

/**
 * @returns {{ docId: string, url: string }}
 */
function HosoPrintTemplateSetup_createGoogleDoc_() {
  var title = 'HO_SO_TEMPLATE_TEST_TPL_TEST_1';
  var doc = DocumentApp.create(title);
  var body = doc.getBody();
  body.clear();
  body.appendParagraph('THẺ / PHIẾU HỒ SƠ PHƯƠNG TIỆN');
  body.appendParagraph('');
  body.appendParagraph('Mã hồ sơ: {{HO_SO_CODE}}');
  body.appendParagraph('Tên hồ sơ: {{TITLE}}');
  body.appendParagraph('Chủ xe / xã viên: {{XA_VIEN_HO_TEN}}');
  body.appendParagraph('Biển số: {{PHUONG_TIEN_BIEN_SO}}');
  body.appendParagraph('Ngày in: {{PRINT_DATE}}');
  doc.saveAndClose();

  var docId = doc.getId();
  var url = 'https://docs.google.com/document/d/' + docId + '/edit';
  try {
    url = DriveApp.getFileById(docId).getUrl();
  } catch (eDrive) {
    /* keep constructed url */
  }
  return { docId: docId, url: url };
}

/**
 * @param {string} fileId
 */
function HosoPrintTemplateSetup_trashFileQuiet_(fileId) {
  var fid = String(fileId || '').trim();
  if (!fid) return;
  try {
    DriveApp.getFileById(fid).setTrashed(true);
  } catch (e) {
    /* ignore */
  }
}

/**
 * Tạo Google Docs mẫu + upsert dòng TEST_TPL_TEST_1 trên HO_SO_TEMPLATE (idempotent trên sheet).
 * @returns {Object}
 */
function HosoPrintTemplateSetup_createTestTemplate() {
  try {
    var ctx = HosoPrintTemplateSetup_configContext_();
    var sheet = HOSO_Config_getSheet_('TEMPLATE', ctx);
    var code = HOSO_PRINT_TEMPLATE_TEST_CODE_;
    var existingRow = HosoPrintTemplateSetup_findRow_(sheet, 'TEMPLATE_CODE', code);
    var oldSourceId = '';
    if (existingRow >= 2) {
      var map0 = HosoPrintTemplateSetup_headerMap_(sheet);
      var cSrc = map0['TEMPLATE_SOURCE_ID'];
      if (cSrc) {
        oldSourceId = String(sheet.getRange(existingRow, cSrc).getValue() || '').trim();
      }
    }

    var created = HosoPrintTemplateSetup_createGoogleDoc_();
    var docId = created.docId;
    var docUrl = created.url;
    var now = HosoPrintTemplateSetup_now_();
    var cfgJson = HosoPrintTemplateSetup_configJson_();

    if (oldSourceId && oldSourceId !== docId) {
      HosoPrintTemplateSetup_trashFileQuiet_(oldSourceId);
    }

    if (existingRow < 2) {
      var tplId = HosoPrintTemplateSetup_makeId_('TPL');
      HosoPrintTemplateSetup_appendRow_(sheet, {
        TEMPLATE_ID: tplId,
        TEMPLATE_CODE: code,
        TEMPLATE_NAME: 'Test Template Hồ Sơ',
        TEMPLATE_TYPE: 'GOOGLE_DOCS',
        TEMPLATE_SOURCE_ID: docId,
        TEMPLATE_SOURCE_URL: docUrl,
        STATUS: 'ACTIVE',
        VERSION: 1,
        CONFIG_JSON: cfgJson,
        CREATED_AT: now,
        UPDATED_AT: now
      });
      return {
        ok: true,
        templateCode: code,
        templateDocId: docId,
        templateDocUrl: docUrl,
        row: sheet.getLastRow(),
        message: 'TEST TEMPLATE READY'
      };
    }

    HosoPrintTemplateSetup_updateRow_(sheet, existingRow, {
      TEMPLATE_SOURCE_ID: docId,
      TEMPLATE_SOURCE_URL: docUrl,
      STATUS: 'ACTIVE',
      UPDATED_AT: now,
      CONFIG_JSON: cfgJson
    });
    return {
      ok: true,
      templateCode: code,
      templateDocId: docId,
      templateDocUrl: docUrl,
      row: existingRow,
      message: 'TEST TEMPLATE READY'
    };
  } catch (e) {
    return {
      ok: false,
      templateCode: HOSO_PRINT_TEMPLATE_TEST_CODE_,
      templateDocId: '',
      templateDocUrl: '',
      row: -1,
      message: 'FAILED',
      error: String(e && e.message ? e.message : e)
    };
  }
}

function HosoPrintTemplateSetup_menuCreateTestTemplate() {
  try {
    hoSoV2SetRuntimeSource_('MENU');
    var r = HosoPrintTemplateSetup_createTestTemplate();
    if (typeof hoSoV2AdminAlertJson_ === 'function') {
      hoSoV2AdminAlertJson_('Create Test Print Template', r);
    } else {
      try {
        SpreadsheetApp.getUi().alert(JSON.stringify(r, null, 2));
      } catch (eUi) {
        /* headless */
      }
    }
  } catch (e2) {
    var msg = String(e2 && e2.message ? e2.message : e2);
    if (typeof hoSoV2AdminAlertJson_ === 'function') {
      hoSoV2AdminAlertJson_('Create Test Print Template', { ok: false, error: msg });
    } else {
      try {
        SpreadsheetApp.getUi().alert(msg);
      } catch (e3) {
        /* ignore */
      }
    }
  } finally {
    hoSoV2SetRuntimeSource_('HOSO_SERVICE');
  }
}
