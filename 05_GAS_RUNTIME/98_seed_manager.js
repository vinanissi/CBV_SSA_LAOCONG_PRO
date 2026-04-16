/**
 * CBV Seed Manager - Idempotent seed for DON_VI, USER_DIRECTORY, MASTER_CODE, ENUM_DICTIONARY.
 * Only inserts missing rows. Never overwrites or deletes.
 *
 * Dependencies: 95_TASK_SYSTEM_BOOTSTRAP, 01_ENUM_SEED, 90_BOOTSTRAP_USER_SEED (optional)
 */

/**
 * Seeds all deployment-scope data. Skips existing rows.
 * @returns {{ ok: boolean, donVi: number, user: number, enum: number, masterCode: number, message: string }}
 */
function seedAllDataImpl() {
  var result = { ok: true, donVi: 0, user: 0, enum: 0, masterCode: 0, message: '' };

  // 1. DON_VI
  if (typeof ensureSeedDonVi === 'function') {
    var dv = ensureSeedDonVi();
    result.donVi = dv.inserted || 0;
  }

  // 2. USER_DIRECTORY (optional - may be empty; bootstrap has ensureDisplayTextForUserDirectoryRows)
  if (typeof ensureSeedUserDirectory === 'function') {
    var ud = ensureSeedUserDirectory();
    result.user = ud.inserted || ud.added || 0;
  }
  if (typeof seedUserDirectory === 'function') {
    var ud2 = seedUserDirectory();
    result.user = result.user || (ud2 && ud2.data && ud2.data.inserted) || 0;
  }

  // 3. ENUM_DICTIONARY
  if (typeof seedEnumDictionary === 'function') {
    var en = seedEnumDictionary();
    result.enum = (en && en.data && en.data.inserted) || 0;
    if (en && en.data && en.data.warnings) {
      en.data.warnings.forEach(function(w) {
        var m = (w || '').match(/Added (\d+) enum rows/);
        if (m) result.enum = parseInt(m[1], 10);
      });
    }
    if (en && en.errors && en.errors.length > 0) result.ok = false;
  }

  // 4. MASTER_CODE (TASK_TYPE)
  if (typeof ensureSeedTaskType === 'function') {
    var mc = ensureSeedTaskType();
    result.masterCode = mc.inserted || 0;
  }

  result.message = result.ok ? 'Seeded OK' : 'Some seeds failed';
  return result;
}
