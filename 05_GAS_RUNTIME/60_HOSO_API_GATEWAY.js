/**
 * HO_SO REST gateway for Lovable (Web App POST JSON).
 * Depends on HO_SO service/repository loaded earlier in push order.
 * Deploy: Web App, Execute as Me, POST { action, payload?, token? }.
 */

function _hosoGetHeader_(headers, name) {
  if (!headers || typeof headers !== 'object') return '';
  var lower = String(name || '').toLowerCase();
  var keys = Object.keys(headers);
  for (var i = 0; i < keys.length; i++) {
    if (String(keys[i]).toLowerCase() === lower) return String(headers[keys[i]] == null ? '' : headers[keys[i]]);
  }
  return '';
}

function _hosoGatewayAuth_(body, headers) {
  var stored = PropertiesService.getScriptProperties().getProperty('LOVABLE_API_TOKEN') || '';
  if (!stored || String(stored).trim() === '') return true;
  var incoming = _hosoGetHeader_(headers, 'X-Api-Token') || (body && body.token) || '';
  return String(incoming).trim() === String(stored).trim();
}

function _hosoResolveDisplay_(row) {
  if (!row) return null;
  var r = {};
  var HIDDEN = ['_rowNumber', 'IS_DELETED', 'BEFORE_JSON', 'AFTER_JSON', 'DRIVE_FILE_ID'];
  Object.keys(row).forEach(function(k) {
    if (HIDDEN.indexOf(k) === -1) r[k] = row[k];
  });

  if (r.OWNER_ID) {
    try {
      var userSheet = SpreadsheetApp.getActive().getSheetByName(CBV_CONFIG.SHEETS.USER_DIRECTORY);
      var users = typeof _rows === 'function' ? _rows(userSheet) : [];
      var u = users.find(function(x) { return String(x.ID) === String(r.OWNER_ID); });
      r.OWNER_NAME = u ? (u.DISPLAY_NAME || u.FULL_NAME || u.EMAIL || r.OWNER_ID) : r.OWNER_ID;
    } catch (e) {
      r.OWNER_NAME = r.OWNER_ID;
    }
  }

  if (r.HTX_ID) {
    try {
      var htx = typeof hosoRepoFindMasterById === 'function' ? hosoRepoFindMasterById(r.HTX_ID) : null;
      r.HTX_NAME = htx ? (htx.NAME || htx.HO_SO_CODE || htx.CODE || r.HTX_ID) : r.HTX_ID;
    } catch (e2) {
      r.HTX_NAME = r.HTX_ID;
    }
  }

  return r;
}

function _hosoNotDeletedMaster_(r) {
  return r && r.IS_DELETED !== true && String(r.IS_DELETED).toLowerCase() !== 'true';
}

function _hosoStripRowNumber_(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  var o = {};
  Object.keys(obj).forEach(function(k) {
    if (k !== '_rowNumber') o[k] = obj[k];
  });
  return o;
}

function _hosoStripFileForFe_(row) {
  var o = _hosoStripRowNumber_(row);
  if (o && o.DRIVE_FILE_ID !== undefined) delete o.DRIVE_FILE_ID;
  return o;
}

function _hosoSanitizeCbvData_(result) {
  if (!result || typeof result !== 'object' || result.data == null) return result;
  var d = result.data;
  if (typeof d === 'object' && !Array.isArray(d) && d._rowNumber !== undefined) {
    var copy = _hosoStripRowNumber_(d);
    var out = {};
    Object.keys(result).forEach(function(k) {
      out[k] = k === 'data' ? copy : result[k];
    });
    return out;
  }
  return result;
}

function _api_getHoSoList_(payload) {
  try {
    payload = payload || {};
    var rows = hosoRepoRows(CBV_CONFIG.SHEETS.HO_SO_MASTER).filter(_hosoNotDeletedMaster_);

    if (payload.status != null && String(payload.status).trim() !== '') {
      var st = String(payload.status).trim();
      rows = rows.filter(function(r) { return String(r.STATUS || '') === st; });
    }
    if (payload.ho_so_type != null && String(payload.ho_so_type).trim() !== '') {
      var ht = String(payload.ho_so_type).trim();
      rows = rows.filter(function(r) {
        var tid = String(r.HO_SO_TYPE_ID || '').trim();
        if (!tid) return false;
        var mc = typeof _findById === 'function' ? _findById(CBV_CONFIG.SHEETS.MASTER_CODE, tid) : null;
        return mc && String(mc.CODE || '').trim() === ht;
      });
    }
    if (payload.htx_id != null && String(payload.htx_id).trim() !== '') {
      var hx = String(payload.htx_id).trim();
      rows = rows.filter(function(r) { return String(r.HTX_ID || '') === hx; });
    }
    if (payload.search != null && String(payload.search).trim() !== '') {
      var q = String(payload.search).trim().toLowerCase();
      rows = rows.filter(function(r) {
        var parts = [
          String(r.NAME || ''),
          String(r.CODE || ''),
          String(r.HO_SO_CODE || ''),
          String(r.TAGS_TEXT || '')
        ].join(' ').toLowerCase();
        return parts.indexOf(q) !== -1;
      });
    }

    var lim = parseInt(payload.limit, 10);
    if (isNaN(lim) || lim < 1) lim = 200;
    if (lim > 500) lim = 500;
    rows = rows.slice(0, lim);

    var mapped = rows.map(function(row) {
      return _hosoResolveDisplay_(row);
    });
    return { ok: true, data: mapped, total: mapped.length };
  } catch (e) {
    return { ok: false, message: e.message || String(e) };
  }
}

function _api_getHoSoById_(payload) {
  try {
    cbvAssert(payload && payload.id, 'id required');
    var row = hosoRepoFindMasterById(payload.id);
    if (!row || !_hosoNotDeletedMaster_(row)) {
      return { ok: false, message: 'HO_SO not found' };
    }
    return { ok: true, data: _hosoResolveDisplay_(row) };
  } catch (e) {
    return { ok: false, message: e.message || String(e) };
  }
}

function _api_createHoSo_(payload) {
  try {
    var data = Object.assign({}, payload || {});
    var hasTitle = data.TITLE != null && String(data.TITLE).trim() !== '';
    var hasDisp = data.DISPLAY_NAME != null && String(data.DISPLAY_NAME).trim() !== '';
    if (!hasTitle && !hasDisp && data.NAME != null && String(data.NAME).trim() !== '') {
      data.TITLE = data.NAME;
      data.DISPLAY_NAME = data.NAME;
    }
    return createHoSo(data);
  } catch (e) {
    return { ok: false, message: e.message || String(e) };
  }
}

function _api_updateHoSo_(payload) {
  try {
    cbvAssert(payload && payload.id, 'id required');
    cbvAssert(payload.patch, 'patch required');
    var patch = payload.patch || {};
    var forbidden = ['STATUS', 'ID', 'HO_SO_CODE', 'CREATED_AT', 'CREATED_BY', 'IS_DELETED', 'PENDING_ACTION'];
    for (var i = 0; i < forbidden.length; i++) {
      var k = forbidden[i];
      if (patch[k] !== undefined) throw new Error('Cannot patch field: ' + k);
    }
    var res = updateHoso(payload.id, patch);
    return _hosoSanitizeCbvData_(res);
  } catch (e) {
    return { ok: false, message: e.message || String(e) };
  }
}

function _api_changeHoSoStatus_(payload) {
  try {
    cbvAssert(payload && payload.id, 'id required');
    cbvAssert(payload.newStatus != null && String(payload.newStatus).trim() !== '', 'newStatus required');
    var row = hosoRepoFindMasterById(payload.id);
    if (!row || !_hosoNotDeletedMaster_(row)) {
      return { ok: false, message: 'HO_SO not found' };
    }
    var currentStatus = String(row.STATUS || '');
    var newStatus = String(payload.newStatus).trim();
    if (currentStatus !== newStatus) {
      var allowed = HOSO_STATUS_TRANSITIONS[currentStatus];
      if (!allowed) allowed = [];
      if (allowed.indexOf(newStatus) === -1) {
        return {
          ok: false,
          message: 'Invalid transition: ' + currentStatus + ' -> ' + newStatus + '. Allowed: [' + allowed.join(', ') + ']'
        };
      }
    }
    var res = changeHosoStatus(payload.id, newStatus, payload.note || '');
    return _hosoSanitizeCbvData_(res);
  } catch (e) {
    return { ok: false, message: e.message || String(e) };
  }
}

function _api_getHoSoStatusTransitions_(payload) {
  try {
    cbvAssert(payload && payload.id, 'id required');
    var row = hosoRepoFindMasterById(payload.id);
    if (!row) {
      return { ok: false, message: 'HO_SO not found' };
    }
    var currentStatus = String(row.STATUS || '');
    var allowedTransitions = HOSO_STATUS_TRANSITIONS[currentStatus] || [];
    return { ok: true, data: { currentStatus: currentStatus, allowedTransitions: allowedTransitions } };
  } catch (e) {
    return { ok: false, message: e.message || String(e) };
  }
}

function _api_getHoSoFiles_(payload) {
  try {
    cbvAssert(payload && payload.hoSoId, 'hoSoId required');
    var hoSoId = String(payload.hoSoId).trim();
    var files = hosoRepoRows(CBV_CONFIG.SHEETS.HO_SO_FILE).filter(function(r) {
      return String(r.HO_SO_ID || '') === hoSoId && r.IS_DELETED !== true && String(r.IS_DELETED).toLowerCase() !== 'true';
    });
    files.sort(function(a, b) {
      var ta = String(a.CREATED_AT || '');
      var tb = String(b.CREATED_AT || '');
      if (ta < tb) return -1;
      if (ta > tb) return 1;
      return 0;
    });
    var out = files.map(function(r) {
      return _hosoStripFileForFe_(r);
    });
    return { ok: true, data: out };
  } catch (e) {
    return { ok: false, message: e.message || String(e) };
  }
}

function _api_addHoSoFile_(payload) {
  try {
    payload = payload || {};
    cbvAssert(payload.HO_SO_ID, 'HO_SO_ID required');
    cbvAssert(payload.FILE_GROUP, 'FILE_GROUP required');
    cbvAssert(payload.FILE_NAME, 'FILE_NAME required');
    cbvAssert(payload.FILE_URL, 'FILE_URL required');
    var url = String(payload.FILE_URL).trim();
    if (!url.toLowerCase().startsWith('http')) {
      return { ok: false, message: 'FILE_URL must be a valid http(s) URL' };
    }
    return addHosoFile(payload);
  } catch (e) {
    return { ok: false, message: e.message || String(e) };
  }
}

function _api_getHoSoRelations_(payload) {
  try {
    cbvAssert(payload && payload.hoSoId, 'hoSoId required');
    var hoSoId = String(payload.hoSoId).trim();
    var rels = hosoRepoRows(CBV_CONFIG.SHEETS.HO_SO_RELATION).filter(function(r) {
      var del = r.IS_DELETED === true || String(r.IS_DELETED).toLowerCase() === 'true';
      if (del) return false;
      return String(r.FROM_HO_SO_ID || '') === hoSoId ||
        String(r.TO_HO_SO_ID || '') === hoSoId;
    });
    var out = rels.map(function(r) {
      var o = _hosoStripRowNumber_(r);
      if (String(o.FROM_HO_SO_ID || '') === hoSoId && o.TO_HO_SO_ID) {
        var tm = hosoRepoFindMasterById(o.TO_HO_SO_ID);
        o.TO_HO_SO_NAME = tm ? (tm.NAME || tm.HO_SO_CODE || tm.CODE || o.TO_HO_SO_ID) : o.TO_HO_SO_ID;
      }
      if (String(o.TO_HO_SO_ID || '') === hoSoId && o.FROM_HO_SO_ID) {
        var fm = hosoRepoFindMasterById(o.FROM_HO_SO_ID);
        o.FROM_HO_SO_NAME = fm ? (fm.NAME || fm.HO_SO_CODE || fm.CODE || o.FROM_HO_SO_ID) : o.FROM_HO_SO_ID;
      }
      return o;
    });
    return { ok: true, data: out };
  } catch (e) {
    return { ok: false, message: e.message || String(e) };
  }
}

function _api_addHoSoRelation_(payload) {
  try {
    payload = payload || {};
    cbvAssert(payload.HO_SO_ID, 'HO_SO_ID required');
    cbvAssert(payload.RELATED_TABLE, 'RELATED_TABLE required');
    cbvAssert(payload.RELATED_RECORD_ID, 'RELATED_RECORD_ID required');
    cbvAssert(payload.RELATION_TYPE, 'RELATION_TYPE required');
    return addHosoRelation(payload);
  } catch (e) {
    return { ok: false, message: e.message || String(e) };
  }
}

function _api_getEnumOptions_(payload) {
  try {
    cbvAssert(payload && payload.group, 'group required');
    var sheet = SpreadsheetApp.getActive().getSheetByName(CBV_CONFIG.SHEETS.ENUM_DICTIONARY);
    var rows = typeof _rows === 'function' ? _rows(sheet) : [];
    var g = String(payload.group).trim();
    var filtered = rows.filter(function(r) {
      if (String(r.ENUM_GROUP || '') !== g) return false;
      if (r.IS_ACTIVE === false || String(r.IS_ACTIVE).toLowerCase() === 'false') return false;
      return true;
    });
    filtered.sort(function(a, b) {
      var sa = parseInt(a.SORT_ORDER, 10);
      var sb = parseInt(b.SORT_ORDER, 10);
      if (isNaN(sa)) sa = 999;
      if (isNaN(sb)) sb = 999;
      return sa - sb;
    });
    var options = filtered.map(function(r) {
      return {
        value: r.ENUM_VALUE,
        label: r.DISPLAY_TEXT || r.ENUM_VALUE
      };
    });
    return { ok: true, data: options };
  } catch (e) {
    return { ok: false, message: e.message || String(e) };
  }
}

function _api_getMasterCodeOptions_(payload) {
  try {
    payload = payload || {};
    cbvAssert(payload.group, 'group required');
    var g = String(payload.group).trim();
    var rows = hosoRepoRows(CBV_CONFIG.SHEETS.MASTER_CODE).filter(function(r) {
      return String(r.MASTER_GROUP || '') === g &&
        String(r.STATUS || '') === 'ACTIVE' &&
        r.IS_DELETED !== true &&
        String(r.IS_DELETED).toLowerCase() !== 'true';
    });
    rows.sort(function(a, b) {
      var sa = parseInt(a.SORT_ORDER, 10);
      var sb = parseInt(b.SORT_ORDER, 10);
      if (isNaN(sa)) sa = 999;
      if (isNaN(sb)) sb = 999;
      return sa - sb;
    });
    var options = rows.map(function(r) {
      return {
        id: r.ID,
        label: r.DISPLAY_TEXT || r.NAME || r.CODE
      };
    });
    return { ok: true, data: options };
  } catch (e) {
    return { ok: false, message: e.message || String(e) };
  }
}

function _api_getActiveUsers_(payload) {
  try {
    var sheet = SpreadsheetApp.getActive().getSheetByName(CBV_CONFIG.SHEETS.USER_DIRECTORY);
    var rows = typeof _rows === 'function' ? _rows(sheet) : [];
    var users = rows.filter(function(r) {
      return String(r.STATUS || '') === 'ACTIVE' &&
        r.IS_DELETED !== true &&
        String(r.IS_DELETED).toLowerCase() !== 'true' &&
        r.ALLOW_LOGIN !== false &&
        String(r.ALLOW_LOGIN).toLowerCase() !== 'false';
    }).map(function(r) {
      return {
        id: r.ID,
        label: r.DISPLAY_NAME || r.FULL_NAME || r.EMAIL,
        email: r.EMAIL
      };
    });
    return { ok: true, data: users };
  } catch (e) {
    return { ok: false, message: e.message || String(e) };
  }
}

function _api_getActiveHtxList_(payload) {
  try {
    var rows = hosoRepoRows(CBV_CONFIG.SHEETS.HO_SO_MASTER).filter(function(r) {
      if (!_hosoNotDeletedMaster_(r)) return false;
      if (String(r.HO_SO_TYPE || '') !== 'HTX') return false;
      var st = String(r.STATUS || '');
      if (st === 'ARCHIVED' || st === 'CLOSED') return false;
      return true;
    });
    var htxList = rows.map(function(r) {
      return {
        id: r.ID,
        label: r.NAME || r.HO_SO_CODE || r.CODE
      };
    });
    return { ok: true, data: htxList };
  } catch (e) {
    return { ok: false, message: e.message || String(e) };
  }
}

function _api_getHoSoListForSearch_(payload) {
  try {
    payload = payload || {};
    var q = payload.search != null ? String(payload.search).trim().toLowerCase() : '';
    var excludeId = payload.exclude_id != null ? String(payload.exclude_id).trim() : '';
    var rows = hosoRepoRows(CBV_CONFIG.SHEETS.HO_SO_MASTER).filter(function(r) {
      if (!_hosoNotDeletedMaster_(r)) return false;
      if (excludeId && String(r.ID || '') === excludeId) return false;
      if (!q) return true;
      var blob = [
        String(r.NAME || ''),
        String(r.CODE || ''),
        String(r.HO_SO_CODE || '')
      ].join(' ').toLowerCase();
      return blob.indexOf(q) !== -1;
    });
    var limit = 20;
    rows = rows.slice(0, limit);
    var results = rows.map(function(r) {
      return {
        id: r.ID,
        label: r.NAME,
        code: r.HO_SO_CODE || r.CODE,
        type: r.HO_SO_TYPE
      };
    });
    return { ok: true, data: results };
  } catch (e) {
    return { ok: false, message: e.message || String(e) };
  }
}

function _api_getDashboard_() {
  try {
    var all = hosoRepoRows(CBV_CONFIG.SHEETS.HO_SO_MASTER);
    var active = all.filter(_hosoNotDeletedMaster_);

    var byType = {};
    var byStatus = {};
    active.forEach(function(r) {
      var t = r.HO_SO_TYPE || 'KHAC';
      byType[t] = (byType[t] || 0) + 1;
      var s = r.STATUS || 'UNKNOWN';
      byStatus[s] = (byStatus[s] || 0) + 1;
    });

    var today = new Date();
    var in30 = new Date();
    in30.setDate(today.getDate() + 30);
    var expiringSoon = active.filter(function(r) {
      if (!r.END_DATE) return false;
      var d = new Date(r.END_DATE);
      return d >= today && d <= in30;
    }).length;

    var expired = active.filter(function(r) {
      if (!r.END_DATE) return false;
      return new Date(r.END_DATE) < today && r.STATUS !== 'ARCHIVED' && r.STATUS !== 'CLOSED';
    }).length;

    return {
      ok: true,
      data: {
        total: active.length,
        totalXe: byType['XE'] || 0,
        totalLaiXe: byType['TAI_XE'] || 0,
        totalXaVien: byType['XA_VIEN'] || 0,
        totalHtx: byType['HTX'] || 0,
        byStatus: byStatus,
        expiringSoon: expiringSoon,
        expired: expired
      }
    };
  } catch (e) {
    return { ok: false, message: e.message || String(e) };
  }
}

function _jsonOut_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function _gatewayDoPost_(e) {
  try {
    var body = {};
    try {
      body = JSON.parse(e && e.postData && e.postData.contents ? e.postData.contents : '{}');
    } catch (pe) {
      body = {};
    }

    if (!_hosoGatewayAuth_(body, e && e.headers ? e.headers : {})) {
      return _jsonOut_({ ok: false, message: 'Unauthorized' });
    }

    var action = String(body.action || '').trim();
    var payload = body.payload || {};

    if (!action) return _jsonOut_({ ok: false, message: 'action required' });

    switch (action) {
      case 'getHoSoList':
        return _jsonOut_(_api_getHoSoList_(payload));
      case 'getHoSoById':
        return _jsonOut_(_api_getHoSoById_(payload));
      case 'createHoSo':
        return _jsonOut_(_api_createHoSo_(payload));
      case 'updateHoSo':
        return _jsonOut_(_api_updateHoSo_(payload));
      case 'changeHoSoStatus':
        return _jsonOut_(_api_changeHoSoStatus_(payload));
      case 'getHoSoStatusTransitions':
        return _jsonOut_(_api_getHoSoStatusTransitions_(payload));
      case 'getHoSoFiles':
        return _jsonOut_(_api_getHoSoFiles_(payload));
      case 'addHoSoFile':
        return _jsonOut_(_api_addHoSoFile_(payload));
      case 'getHoSoRelations':
        return _jsonOut_(_api_getHoSoRelations_(payload));
      case 'addHoSoRelation':
        return _jsonOut_(_api_addHoSoRelation_(payload));
      case 'getEnumOptions':
        return _jsonOut_(_api_getEnumOptions_(payload));
      case 'getMasterCodeOptions':
        return _jsonOut_(_api_getMasterCodeOptions_(payload));
      case 'getActiveUsers':
        return _jsonOut_(_api_getActiveUsers_(payload));
      case 'getActiveHtxList':
        return _jsonOut_(_api_getActiveHtxList_(payload));
      case 'getHoSoListForSearch':
        return _jsonOut_(_api_getHoSoListForSearch_(payload));
      case 'getHoSoXe':
        return _jsonOut_(_api_getHoSoList_(Object.assign({}, payload, { ho_so_type: payload.ho_so_type || 'XE' })));
      case 'getHoSoXeById':
        return _jsonOut_(_api_getHoSoById_(payload));
      case 'createHoSoXe':
        return _jsonOut_(_api_createHoSo_(payload));
      case 'updateHoSoXe':
        return _jsonOut_(_api_updateHoSo_(payload));
      case 'getHoSoLaiXe':
        return _jsonOut_(_api_getHoSoList_(Object.assign({}, payload, { ho_so_type: payload.ho_so_type || 'TAI_XE' })));
      case 'getHoSoLaiXeById':
        return _jsonOut_(_api_getHoSoById_(payload));
      case 'createHoSoLaiXe':
        return _jsonOut_(_api_createHoSo_(payload));
      case 'updateHoSoLaiXe':
        return _jsonOut_(_api_updateHoSo_(payload));
      case 'getDashboard':
        return _jsonOut_(_api_getDashboard_());
      default:
        return _jsonOut_({ ok: false, message: 'Unknown action: ' + action });
    }
  } catch (err) {
    Logger.log('[HOSO_GATEWAY] doPost error: ' + (err.message || err));
    return _jsonOut_({ ok: false, message: err.message || 'Internal error' });
  }
}

/**
 * Chạy thủ công trong Apps Script Editor để test gateway.
 * Menu: CBV → Run → (gọi trực tiếp)
 */
function smokeTestHoSoGateway() {
  var tests = [
    { action: 'getEnumOptions', payload: { group: 'HO_SO_STATUS' } },
    { action: 'getMasterCodeOptions', payload: { group: 'HO_SO_TYPE' } },
    { action: 'getActiveUsers', payload: {} },
    { action: 'getActiveHtxList', payload: {} },
    { action: 'getHoSoList', payload: { limit: 5 } }
  ];

  var results = tests.map(function(t) {
    try {
      var fn = null;
      switch (t.action) {
        case 'getEnumOptions':
          fn = _api_getEnumOptions_;
          break;
        case 'getMasterCodeOptions':
          fn = _api_getMasterCodeOptions_;
          break;
        case 'getActiveUsers':
          fn = _api_getActiveUsers_;
          break;
        case 'getActiveHtxList':
          fn = _api_getActiveHtxList_;
          break;
        case 'getHoSoList':
          fn = _api_getHoSoList_;
          break;
        default:
          fn = null;
      }
      if (!fn) return { action: t.action, ok: false, message: 'no fn' };
      var r = fn(t.payload);
      return {
        action: t.action,
        ok: r.ok,
        count: r.data ? (Array.isArray(r.data) ? r.data.length : 1) : 0
      };
    } catch (e) {
      return { action: t.action, ok: false, error: e.message };
    }
  });

  Logger.log('smokeTestHoSoGateway: ' + JSON.stringify(results, null, 2));
  Logger.log('smokeTestHoSoGateway results:\n' +
    results.map(function(r) {
      return (r.ok ? '✓' : '✗') + ' ' + r.action +
        (r.count !== undefined ? ' [' + r.count + ']' : '') +
        (r.error ? ': ' + r.error : '');
    }).join('\n')
  );
  return results;
}
