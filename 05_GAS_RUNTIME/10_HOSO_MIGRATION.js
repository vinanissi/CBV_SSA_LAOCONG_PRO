/**
 * HO_SO PRO — one-way migration from legacy columns (non-destructive: sets PRO fields only).
 * Legacy: HO_SO_TYPE, CODE, NAME, HTX_ID on HO_SO_MASTER.
 * Dependencies: 10_HOSO_REPOSITORY, 10_HOSO_CONSTANTS, 00_CORE_UTILS
 */

var HOSO_LEGACY_TYPE_TO_MASTER_CODE = {
  HTX: 'KHAC',
  XE: 'HO_SO_PHUONG_TIEN',
  XA_VIEN: 'HO_SO_XA_VIEN',
  TAI_XE: 'HO_SO_TAI_XE',
  HO_SO: 'KHAC'
};

function hosoMigrationResolveTypeId_(legacyTypeToken) {
  var raw = String(legacyTypeToken || '').trim();
  var mcCode = HOSO_LEGACY_TYPE_TO_MASTER_CODE[raw] || raw;
  if (!mcCode || mcCode === '') mcCode = 'KHAC';
  var rows = typeof hosoRepoRows === 'function' ? hosoRepoRows(CBV_CONFIG.SHEETS.MASTER_CODE) : [];
  var m = rows.find(function(x) {
    return String(x.MASTER_GROUP || '') === HOSO_MASTER_GROUP_TYPE && String(x.CODE || '') === mcCode && String(x.STATUS || '').toUpperCase() === 'ACTIVE';
  });
  if (m) return String(m.ID || '').trim();
  var fb = rows.find(function(x) {
    return String(x.MASTER_GROUP || '') === HOSO_MASTER_GROUP_TYPE && String(x.CODE || '') === 'KHAC' && String(x.STATUS || '').toUpperCase() === 'ACTIVE';
  });
  return fb ? String(fb.ID || '').trim() : '';
}

/**
 * Fills HO_SO_TYPE_ID, HO_SO_CODE, TITLE/DISPLAY_NAME from legacy columns when missing.
 * Idempotent: skips rows that already look PRO-complete.
 * @returns {{ ok: boolean, updated: number, skipped: number, errors: string[] }}
 */
function migrateHosoLegacyToPro_() {
  var out = { ok: true, updated: 0, skipped: 0, errors: [] };
  var rows = typeof hosoRepoRows === 'function' ? hosoRepoRows(CBV_CONFIG.SHEETS.HO_SO_MASTER) : [];
  if (!rows.length) return out;

  rows.forEach(function(r) {
    var id = String(r.ID || '').trim();
    if (!id) return;
    var typeId = String(r.HO_SO_TYPE_ID || '').trim();
    var hoSoCode = String(r.HO_SO_CODE || '').trim();
    var legacyType = String(r.HO_SO_TYPE || '').trim();
    var legacyCode = String(r.CODE || '').trim();
    var legacyName = String(r.NAME || '').trim();
    var title = String(r.TITLE || '').trim();

    var htxNeed = String(r.HTX_ID || '').trim() && !String(r.DON_VI_ID || '').trim();
    var needMigrate = !typeId || !hoSoCode || (!title && legacyName) || htxNeed || String(r.STATUS || '').trim() === '';
    if (!needMigrate && typeId && hoSoCode) {
      out.skipped++;
      return;
    }

    var patch = {
      UPDATED_AT: typeof cbvNow === 'function' ? cbvNow() : new Date(),
      UPDATED_BY: typeof cbvUser === 'function' ? cbvUser() : 'system'
    };

    if (r['TAGS'] && !String(r['TAGS_TEXT'] || '').trim()) {
      patch['TAGS_TEXT'] = r['TAGS'];
    }

    var nextTypeId = typeId;
    if (!nextTypeId) {
      nextTypeId = hosoMigrationResolveTypeId_(legacyType);
      if (!nextTypeId) {
        out.errors.push('No HO_SO_TYPE master for row ' + id);
        out.skipped++;
        return;
      }
      patch.HO_SO_TYPE_ID = nextTypeId;
    }

    if (!hoSoCode) {
      if (typeof hosoRepoAllocateHoSoCode === 'function') {
        patch.HO_SO_CODE = hosoRepoAllocateHoSoCode(nextTypeId, 80);
      } else {
        var baseCode = legacyCode || id;
        patch.HO_SO_CODE = 'HS-MIG-' + String(baseCode).replace(/[^A-Z0-9_-]/gi, '').slice(0, 24);
      }
    }

    if (!title && legacyName) {
      patch.TITLE = legacyName;
      patch.DISPLAY_NAME = String(r.DISPLAY_NAME || '').trim() || legacyName;
    }

    var htx = String(r.HTX_ID || '').trim();
    if (htx && !String(r.DON_VI_ID || '').trim() && typeof _findById === 'function' && _findById(CBV_CONFIG.SHEETS.DON_VI, htx)) {
      patch.DON_VI_ID = htx;
    }

    if (String(r.STATUS || '').trim() === '') patch.STATUS = 'NEW';

    if (Object.keys(patch).length <= 2) {
      out.skipped++;
      return;
    }

    if (r._rowNumber && typeof hosoRepoUpdate === 'function') {
      hosoRepoUpdate(CBV_CONFIG.SHEETS.HO_SO_MASTER, r._rowNumber, patch);
      out.updated++;
    }
  });

  if (out.errors.length) out.ok = false;
  Logger.log('migrateHosoLegacyToPro_: ' + JSON.stringify(out));
  return out;
}
