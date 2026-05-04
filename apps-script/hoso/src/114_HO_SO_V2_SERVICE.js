/**
 * HO_SO V2 — core service: create, update, status, detail, rebuild index.
 */

/**
 * @param {Object} patch
 * @param {Object} map camelCase -> COLUMN
 * @returns {Object}
 */
function hoSoV2MapPatch_(patch, map) {
  var out = {};
  if (!patch) return out;
  var k;
  for (k in patch) {
    if (!Object.prototype.hasOwnProperty.call(patch, k)) continue;
    var col = map[k];
    if (col) {
      var v = patch[k];
      out[col] = v;
    }
  }
  return out;
}

var HO_SO_V2_MASTER_PATCH_MAP = {
  title: 'TITLE',
  hoSoType: 'HO_SO_TYPE',
  note: 'NOTE',
  ownerEmail: 'OWNER_EMAIL',
  primaryEntityType: 'PRIMARY_ENTITY_TYPE',
  primaryEntityId: 'PRIMARY_ENTITY_ID'
};

var HO_SO_V2_XV_PATCH_MAP = {
  hoTen: 'HO_TEN',
  namSinh: 'NAM_SINH',
  cccd: 'CCCD',
  cccdNgayCap: 'CCCD_NGAY_CAP',
  cccdNoiCap: 'CCCD_NOI_CAP',
  diaChi: 'DIA_CHI',
  phone1: 'PHONE_1',
  phone2: 'PHONE_2',
  email: 'EMAIL',
  nguoiDaiDien: 'NGUOI_DAI_DIEN',
  status: 'STATUS'
};

var HO_SO_V2_PT_PATCH_MAP = {
  bienSo: 'BIEN_SO',
  loaiXe: 'LOAI_XE',
  hieuXe: 'HIEU_XE',
  soLoai: 'SO_LOAI',
  mauXe: 'MAU_XE',
  namSanXuat: 'NAM_SAN_XUAT',
  nuocSanXuat: 'NUOC_SAN_XUAT',
  soChoTaiTrong: 'SO_CHO_TAI_TRONG',
  soKhung: 'SO_KHUNG',
  soMay: 'SO_MAY',
  gpsWeb: 'GPS_WEB',
  gpsUser: 'GPS_USER',
  gpsPass: 'GPS_PASS',
  status: 'STATUS'
};

var HO_SO_V2_TX_PATCH_MAP = {
  hoTen: 'HO_TEN',
  cccd: 'CCCD',
  phone: 'PHONE',
  gplxSo: 'GPLX_SO',
  gplxHang: 'GPLX_HANG',
  gplxNgayCap: 'GPLX_NGAY_CAP',
  gplxNoiCap: 'GPLX_NOI_CAP',
  diaChi: 'DIA_CHI',
  status: 'STATUS'
};

/**
 * @param {Object} command
 * @returns {Object}
 */
function HosoService_create(command) {
  var p = (command && command.payload) || {};
  HoSoV2_bootstrapSheets();

  var v = HoSoV2_Validation_validateCreate(p);
  if (!v.ok) {
    return {
      ok: false,
      entityType: 'HO_SO',
      entityId: '',
      message: v.errors.map(function(e) { return e.message; }).join('; '),
      data: { errors: v.errors },
      error: { code: 'VALIDATION', message: 'VALIDATION_FAILED', details: v.errors }
    };
  }

  var np = v.normalizedPayload;
  var dup = HoSoV2_Duplicate_checkCreate(np);
  if (!dup.ok) {
    return {
      ok: false,
      entityType: 'HO_SO',
      entityId: '',
      message: dup.message || 'Duplicate',
      data: { duplicates: dup.duplicates },
      error: { code: dup.code || 'DUPLICATE_FOUND', message: dup.message }
    };
  }

  var hoSoId = hoSoV2NewId_(HO_SO_V2.ID_PREFIX.HO_SO);
  var hoSoCode = hoSoId;
  var now = cbvCoreV2IsoNow_();
  var actor = command.requestBy || cbvUser();
  var source = command.source || '';

  var primaryType = 'HO_SO';
  var primaryId = hoSoId;
  if (np.phuongTien) {
    primaryType = 'PHUONG_TIEN';
  } else if (np.xaVien) {
    primaryType = 'XA_VIEN';
  } else if (np.taiXe) {
    primaryType = 'TAI_XE';
  }

  hoSoV2AppendRow_(hoSoV2GetSheet_('MASTER'), {
    HO_SO_ID: hoSoId,
    HO_SO_CODE: hoSoCode,
    HO_SO_TYPE: np.hoSoType,
    TITLE: np.title,
    PRIMARY_ENTITY_TYPE: primaryType,
    PRIMARY_ENTITY_ID: primaryId,
    STATUS: HO_SO_V2.HO_SO_STATUS.DRAFT,
    SOURCE: source,
    OWNER_EMAIL: np.ownerEmail || actor,
    CREATED_AT: now,
    CREATED_BY: actor,
    UPDATED_AT: now,
    UPDATED_BY: actor,
    NOTE: np.note || '',
    META_JSON: hoSoV2MetaStringify_(np.meta)
  });

  var xvId = '';
  if (np.xaVien) {
    xvId = hoSoV2NewId_(HO_SO_V2.ID_PREFIX.XA_VIEN);
    var xa = np.xaVien;
    hoSoV2AppendRow_(hoSoV2GetSheet_('XA_VIEN'), {
      XA_VIEN_ID: xvId,
      HO_SO_ID: hoSoId,
      HO_TEN: xa.hoTen,
      NAM_SINH: xa.namSinh,
      CCCD: xa.cccd,
      CCCD_NGAY_CAP: xa.cccdNgayCap,
      CCCD_NOI_CAP: xa.cccdNoiCap,
      DIA_CHI: xa.diaChi,
      PHONE_1: xa.phone1,
      PHONE_2: xa.phone2,
      EMAIL: xa.email,
      NGUOI_DAI_DIEN: xa.nguoiDaiDien,
      STATUS: HO_SO_V2.ENTITY_STATUS.ACTIVE,
      CREATED_AT: now,
      UPDATED_AT: now,
      META_JSON: ''
    });
    if (primaryType === 'XA_VIEN') primaryId = xvId;
  }

  var ptId = '';
  if (np.phuongTien) {
    ptId = hoSoV2NewId_(HO_SO_V2.ID_PREFIX.PHUONG_TIEN);
    var pt = np.phuongTien;
    hoSoV2AppendRow_(hoSoV2GetSheet_('PHUONG_TIEN'), {
      PHUONG_TIEN_ID: ptId,
      HO_SO_ID: hoSoId,
      BIEN_SO: pt.bienSo,
      LOAI_XE: pt.loaiXe,
      HIEU_XE: pt.hieuXe,
      SO_LOAI: pt.soLoai,
      MAU_XE: pt.mauXe,
      NAM_SAN_XUAT: pt.namSanXuat,
      NUOC_SAN_XUAT: pt.nuocSanXuat,
      SO_CHO_TAI_TRONG: pt.soChoTaiTrong,
      SO_KHUNG: pt.soKhung,
      SO_MAY: pt.soMay,
      GPS_WEB: pt.gpsWeb,
      GPS_USER: pt.gpsUser,
      GPS_PASS: pt.gpsPass,
      STATUS: HO_SO_V2.ENTITY_STATUS.ACTIVE,
      CREATED_AT: now,
      UPDATED_AT: now,
      META_JSON: ''
    });
    if (primaryType === 'PHUONG_TIEN') primaryId = ptId;
  }

  var txId = '';
  if (np.taiXe) {
    txId = hoSoV2NewId_(HO_SO_V2.ID_PREFIX.TAI_XE);
    var tx = np.taiXe;
    hoSoV2AppendRow_(hoSoV2GetSheet_('TAI_XE'), {
      TAI_XE_ID: txId,
      HO_SO_ID: hoSoId,
      HO_TEN: tx.hoTen,
      CCCD: tx.cccd,
      PHONE: tx.phone,
      GPLX_SO: tx.gplxSo,
      GPLX_HANG: tx.gplxHang,
      GPLX_NGAY_CAP: tx.gplxNgayCap,
      GPLX_NOI_CAP: tx.gplxNoiCap,
      DIA_CHI: tx.diaChi,
      STATUS: HO_SO_V2.ENTITY_STATUS.ACTIVE,
      CREATED_AT: now,
      UPDATED_AT: now,
      META_JSON: ''
    });
    if (primaryType === 'TAI_XE') primaryId = txId;
  }

  if (xvId || ptId || txId) {
    hoSoV2UpdateRow_(hoSoV2GetSheet_('MASTER'), hoSoV2FindRowByColumn_(hoSoV2GetSheet_('MASTER'), 'HO_SO_ID', hoSoId), {
      PRIMARY_ENTITY_TYPE: primaryType,
      PRIMARY_ENTITY_ID: primaryId,
      UPDATED_AT: now,
      UPDATED_BY: actor
    });
  }

  var gi;
  for (gi = 0; gi < np.giayTo.length; gi++) {
    var g = np.giayTo[gi];
    var gid = hoSoV2NewId_(HO_SO_V2.ID_PREFIX.GIAY_TO);
    hoSoV2AppendRow_(hoSoV2GetSheet_('GIAY_TO'), {
      GIAY_TO_ID: gid,
      HO_SO_ID: hoSoId,
      ENTITY_TYPE: g.entityType || 'HO_SO',
      ENTITY_ID: hoSoId,
      DOC_TYPE: g.docType,
      DOC_NO: g.docNo,
      ISSUE_DATE: g.issueDate,
      EXPIRE_DATE: g.expireDate,
      STATUS: HO_SO_V2.ENTITY_STATUS.ACTIVE,
      FILE_URL: g.fileUrl,
      NOTE: g.note,
      CREATED_AT: now,
      UPDATED_AT: now,
      META_JSON: ''
    });
  }

  function addRel(fromType, fromId, toType, toId, relType) {
    if (!fromId || !toId) return;
    var rid = hoSoV2NewId_(HO_SO_V2.ID_PREFIX.RELATION);
    hoSoV2AppendRow_(hoSoV2GetSheet_('RELATION'), {
      RELATION_ID: rid,
      FROM_TYPE: fromType,
      FROM_ID: fromId,
      TO_TYPE: toType,
      TO_ID: toId,
      RELATION_TYPE: relType,
      STATUS: HO_SO_V2.ENTITY_STATUS.ACTIVE,
      CREATED_AT: now,
      UPDATED_AT: now,
      META_JSON: ''
    });
  }

  if (xvId) {
    addRel('HO_SO', hoSoId, 'XA_VIEN', xvId, HO_SO_V2.RELATION_TYPE.HO_SO_TO_XA_VIEN);
  }
  if (ptId) {
    addRel('HO_SO', hoSoId, 'PHUONG_TIEN', ptId, HO_SO_V2.RELATION_TYPE.HO_SO_TO_PHUONG_TIEN);
  }
  if (txId) {
    addRel('HO_SO', hoSoId, 'TAI_XE', txId, HO_SO_V2.RELATION_TYPE.HO_SO_TO_TAI_XE);
  }
  if (xvId && ptId) {
    addRel('XA_VIEN', xvId, 'PHUONG_TIEN', ptId, HO_SO_V2.RELATION_TYPE.XA_VIEN_TO_PHUONG_TIEN);
  }
  if (txId && ptId) {
    addRel('TAI_XE', txId, 'PHUONG_TIEN', ptId, HO_SO_V2.RELATION_TYPE.TAI_XE_TO_PHUONG_TIEN);
  }

  CBV_CoreV2_logAudit({
    moduleCode: 'HOSO',
    entityType: 'HO_SO',
    entityId: hoSoId,
    action: 'CREATE',
    fieldName: '',
    oldValue: '',
    newValue: hoSoCode,
    actorEmail: actor,
    source: source,
    commandId: command.commandId || ''
  });

  CBV_CoreV2_emitEvent({
    eventType: 'HOSO_CREATED',
    moduleCode: 'HOSO',
    entityType: 'HO_SO',
    entityId: hoSoId,
    sourceCommandId: command.commandId || '',
    payload: { hoSoCode: hoSoCode, primaryEntityType: primaryType },
    createdBy: actor
  });

  CBV_CoreV2_emitEvent({
    eventType: 'HOSO_SEARCH_INDEX_UPDATE_REQUESTED',
    moduleCode: 'HOSO',
    entityType: 'HO_SO',
    entityId: hoSoId,
    sourceCommandId: command.commandId || '',
    payload: {},
    createdBy: actor
  });

  HoSoV2_Search_rebuildForHoSo(hoSoId);

  CBV_CoreV2_emitEvent({
    eventType: 'HOSO_SEARCH_INDEX_UPDATED',
    moduleCode: 'HOSO',
    entityType: 'HO_SO',
    entityId: hoSoId,
    sourceCommandId: command.commandId || '',
    payload: { scope: 'HO_SO' },
    createdBy: actor
  });

  return {
    ok: true,
    entityType: 'HO_SO',
    entityId: hoSoId,
    message: 'Đã tạo hồ sơ',
    data: {
      hoSoId: hoSoId,
      hoSoCode: hoSoCode,
      xaVienId: xvId,
      phuongTienId: ptId,
      taiXeId: txId
    },
    error: null
  };
}

/**
 * @param {Object} command
 * @returns {Object}
 */
function HosoService_update(command) {
  var p = (command && command.payload) || {};
  var hoSoId = p.hoSoId != null ? String(p.hoSoId).trim() : '';
  if (!hoSoId) {
    return { ok: false, entityType: 'HO_SO', entityId: '', message: 'hoSoId required', data: {}, error: { code: 'VALIDATION', message: 'hoSoId required' } };
  }
  HoSoV2_bootstrapSheets();
  var m = hoSoV2GetSheet_('MASTER');
  var mr = hoSoV2FindRowByColumn_(m, 'HO_SO_ID', hoSoId);
  if (mr < 2) {
    return { ok: false, entityType: 'HO_SO', entityId: hoSoId, message: 'Not found', data: {}, error: { code: 'NOT_FOUND', message: 'HO_SO not found' } };
  }

  var patch = p.patch || {};
  var now = cbvCoreV2IsoNow_();
  var actor = command.requestBy || cbvUser();
  var before = hoSoV2ReadRowAsObject_(m, mr);

  var masterPatch = hoSoV2MapPatch_(patch.master || {}, HO_SO_V2_MASTER_PATCH_MAP);
  if (patch.master && patch.master.meta != null) {
    masterPatch.META_JSON = hoSoV2MetaStringify_(patch.master.meta);
  }
  if (Object.keys(masterPatch).length) {
    masterPatch.UPDATED_AT = now;
    masterPatch.UPDATED_BY = actor;
    hoSoV2UpdateRow_(m, mr, masterPatch);
    var fk;
    for (fk in masterPatch) {
      if (Object.prototype.hasOwnProperty.call(masterPatch, fk) && fk !== 'UPDATED_AT' && fk !== 'UPDATED_BY') {
        CBV_CoreV2_logAudit({
          moduleCode: 'HOSO',
          entityType: 'HO_SO',
          entityId: hoSoId,
          action: 'UPDATE',
          fieldName: fk,
          oldValue: before[fk] != null ? before[fk] : '',
          newValue: masterPatch[fk] != null ? String(masterPatch[fk]) : '',
          actorEmail: actor,
          source: command.source || '',
          commandId: command.commandId || ''
        });
      }
    }
  }

  if (patch.xaVien && typeof patch.xaVien === 'object') {
    var xvSh = hoSoV2GetSheet_('XA_VIEN');
    var xrows = hoSoV2FindAllRowsByHoSoId_(xvSh, 'HO_SO_ID', hoSoId);
    if (xrows.length) {
      var xu = hoSoV2MapPatch_(patch.xaVien, HO_SO_V2_XV_PATCH_MAP);
      if (patch.xaVien.cccd != null) xu.CCCD = hoSoV2NormalizeCccd_(patch.xaVien.cccd);
      if (patch.xaVien.phone1 != null) xu.PHONE_1 = hoSoV2NormalizePhone_(patch.xaVien.phone1);
      if (patch.xaVien.phone2 != null) xu.PHONE_2 = hoSoV2NormalizePhone_(patch.xaVien.phone2);
      if (Object.keys(xu).length) {
        xu.UPDATED_AT = now;
        hoSoV2UpdateRow_(xvSh, xrows[0], xu);
      }
    }
  }

  if (patch.phuongTien && typeof patch.phuongTien === 'object') {
    var ptSh = hoSoV2GetSheet_('PHUONG_TIEN');
    var prows = hoSoV2FindAllRowsByHoSoId_(ptSh, 'HO_SO_ID', hoSoId);
    if (prows.length) {
      var pu = hoSoV2MapPatch_(patch.phuongTien, HO_SO_V2_PT_PATCH_MAP);
      if (patch.phuongTien.bienSo != null) pu.BIEN_SO = String(patch.phuongTien.bienSo).trim().toUpperCase();
      if (Object.keys(pu).length) {
        pu.UPDATED_AT = now;
        hoSoV2UpdateRow_(ptSh, prows[0], pu);
      }
    }
  }

  if (patch.taiXe && typeof patch.taiXe === 'object') {
    var txSh = hoSoV2GetSheet_('TAI_XE');
    var trows = hoSoV2FindAllRowsByHoSoId_(txSh, 'HO_SO_ID', hoSoId);
    if (trows.length) {
      var tu = hoSoV2MapPatch_(patch.taiXe, HO_SO_V2_TX_PATCH_MAP);
      if (patch.taiXe.cccd != null) tu.CCCD = hoSoV2NormalizeCccd_(patch.taiXe.cccd);
      if (patch.taiXe.phone != null) tu.PHONE = hoSoV2NormalizePhone_(patch.taiXe.phone);
      if (Object.keys(tu).length) {
        tu.UPDATED_AT = now;
        hoSoV2UpdateRow_(txSh, trows[0], tu);
      }
    }
  }

  CBV_CoreV2_emitEvent({
    eventType: 'HOSO_UPDATED',
    moduleCode: 'HOSO',
    entityType: 'HO_SO',
    entityId: hoSoId,
    sourceCommandId: command.commandId || '',
    payload: { patchKeys: Object.keys(patch) },
    createdBy: actor
  });

  HoSoV2_Search_rebuildForHoSo(hoSoId);
  CBV_CoreV2_emitEvent({
    eventType: 'HOSO_SEARCH_INDEX_UPDATED',
    moduleCode: 'HOSO',
    entityType: 'HO_SO',
    entityId: hoSoId,
    sourceCommandId: command.commandId || '',
    payload: { reason: 'UPDATE' },
    createdBy: actor
  });

  return { ok: true, entityType: 'HO_SO', entityId: hoSoId, message: 'Đã cập nhật', data: {}, error: null };
}

/**
 * @param {Object} command
 * @returns {Object}
 */
function HosoService_changeStatus(command) {
  var p = (command && command.payload) || {};
  var hoSoId = p.hoSoId != null ? String(p.hoSoId).trim() : '';
  var status = p.status != null ? String(p.status).trim().toUpperCase() : '';
  if (!hoSoId || !status) {
    return { ok: false, entityType: 'HO_SO', entityId: hoSoId, message: 'hoSoId và status required', data: {}, error: { code: 'VALIDATION', message: 'INVALID' } };
  }
  var allowed = false;
  var ks = Object.keys(HO_SO_V2.HO_SO_STATUS);
  var i;
  for (i = 0; i < ks.length; i++) {
    if (HO_SO_V2.HO_SO_STATUS[ks[i]] === status) allowed = true;
  }
  if (!allowed) {
    return { ok: false, entityType: 'HO_SO', entityId: hoSoId, message: 'Status không hợp lệ', data: {}, error: { code: 'VALIDATION', message: 'BAD_STATUS' } };
  }

  HoSoV2_bootstrapSheets();
  var m = hoSoV2GetSheet_('MASTER');
  var mr = hoSoV2FindRowByColumn_(m, 'HO_SO_ID', hoSoId);
  if (mr < 2) {
    return { ok: false, entityType: 'HO_SO', entityId: hoSoId, message: 'Not found', data: {}, error: { code: 'NOT_FOUND', message: 'HO_SO not found' } };
  }
  var before = hoSoV2ReadRowAsObject_(m, mr).STATUS;
  var now = cbvCoreV2IsoNow_();
  var actor = command.requestBy || cbvUser();
  hoSoV2UpdateRow_(m, mr, {
    STATUS: status,
    UPDATED_AT: now,
    UPDATED_BY: actor
  });

  CBV_CoreV2_logAudit({
    moduleCode: 'HOSO',
    entityType: 'HO_SO',
    entityId: hoSoId,
    action: 'CHANGE_STATUS',
    fieldName: 'STATUS',
    oldValue: before,
    newValue: status,
    actorEmail: actor,
    source: command.source || '',
    commandId: command.commandId || ''
  });

  CBV_CoreV2_emitEvent({
    eventType: 'HOSO_STATUS_CHANGED',
    moduleCode: 'HOSO',
    entityType: 'HO_SO',
    entityId: hoSoId,
    sourceCommandId: command.commandId || '',
    payload: { status: status, reason: p.reason || '' },
    createdBy: actor
  });

  return { ok: true, entityType: 'HO_SO', entityId: hoSoId, message: 'Đã đổi trạng thái', data: { status: status }, error: null };
}

/**
 * @param {string} hoSoId
 * @param {Object} idSet
 * @returns {Array<Object>}
 */
function hoSoV2LoadRelationsForHoSo_(hoSoId, idSet) {
  var sh = hoSoV2GetSheet_('RELATION');
  if (!sh) return [];
  var last = sh.getLastRow();
  if (last < 2) return [];
  var map = cbvCoreV2ReadHeaderMap_(sh);
  var cF = map['FROM_ID'];
  var cT = map['TO_ID'];
  if (!cF || !cT) return [];
  var out = [];
  var r;
  for (r = 2; r <= last; r++) {
    var fr = String(sh.getRange(r, cF).getValue() || '');
    var tr = String(sh.getRange(r, cT).getValue() || '');
    if (idSet[fr] || idSet[tr]) {
      out.push(hoSoV2ReadRowAsObject_(sh, r));
    }
  }
  return out;
}

/**
 * @param {Object} command
 * @returns {Object}
 */
function HosoService_getDetail(command) {
  var p = (command && command.payload) || {};
  var hoSoId = p.hoSoId != null ? String(p.hoSoId).trim() : '';
  if (!hoSoId) {
    return { ok: false, entityType: 'HO_SO', entityId: '', message: 'hoSoId required', data: {}, error: { code: 'VALIDATION', message: 'hoSoId required' } };
  }
  HoSoV2_bootstrapSheets();
  var m = hoSoV2GetSheet_('MASTER');
  var mr = hoSoV2FindRowByColumn_(m, 'HO_SO_ID', hoSoId);
  if (mr < 2) {
    return { ok: false, entityType: 'HO_SO', entityId: hoSoId, message: 'Not found', data: {}, error: { code: 'NOT_FOUND', message: 'HO_SO not found' } };
  }
  var master = hoSoV2ReadRowAsObject_(m, mr);

  function listFor(sheetKey, hoCol) {
    var sh = hoSoV2GetSheet_(sheetKey);
    var rows = hoSoV2FindAllRowsByHoSoId_(sh, hoCol, hoSoId);
    var L = [];
    var j;
    for (j = 0; j < rows.length; j++) {
      L.push(hoSoV2ReadRowAsObject_(sh, rows[j]));
    }
    return L;
  }

  var xaVienList = listFor('XA_VIEN', 'HO_SO_ID');
  var phuongTienList = listFor('PHUONG_TIEN', 'HO_SO_ID');
  var taiXeList = listFor('TAI_XE', 'HO_SO_ID');
  var giayToList = listFor('GIAY_TO', 'HO_SO_ID');
  var attachmentList = listFor('ATTACHMENT', 'HO_SO_ID');

  var idSet = {};
  idSet[hoSoId] = true;
  var a;
  for (a = 0; a < xaVienList.length; a++) idSet[xaVienList[a].XA_VIEN_ID] = true;
  for (a = 0; a < phuongTienList.length; a++) idSet[phuongTienList[a].PHUONG_TIEN_ID] = true;
  for (a = 0; a < taiXeList.length; a++) idSet[taiXeList[a].TAI_XE_ID] = true;

  var relationList = hoSoV2LoadRelationsForHoSo_(hoSoId, idSet);

  var pjSh = hoSoV2GetSheet_('PRINT_JOB');
  var printJobList = [];
  if (pjSh) {
    var rows = hoSoV2FindAllRowsByHoSoId_(pjSh, 'HO_SO_ID', hoSoId);
    for (a = 0; a < rows.length; a++) {
      printJobList.push(hoSoV2ReadRowAsObject_(pjSh, rows[a]));
    }
  }

  return {
    ok: true,
    entityType: 'HO_SO',
    entityId: hoSoId,
    message: 'OK',
    data: {
      master: master,
      xaVienList: xaVienList,
      phuongTienList: phuongTienList,
      taiXeList: taiXeList,
      giayToList: giayToList,
      attachmentList: attachmentList,
      relationList: relationList,
      printJobList: printJobList
    },
    error: null
  };
}

/**
 * @param {Object} command
 * @returns {Object}
 */
function HosoService_rebuildSearchIndex(command) {
  var p = (command && command.payload) || {};
  var hoSoId = p.hoSoId != null ? String(p.hoSoId).trim() : '';
  if (!hoSoId) {
    return { ok: false, entityType: 'HO_SO', entityId: '', message: 'hoSoId required', data: {}, error: { code: 'VALIDATION', message: 'hoSoId required' } };
  }
  var actor = command.requestBy || cbvUser();
  CBV_CoreV2_emitEvent({
    eventType: 'HOSO_SEARCH_INDEX_UPDATE_REQUESTED',
    moduleCode: 'HOSO',
    entityType: 'HO_SO',
    entityId: hoSoId,
    sourceCommandId: command.commandId || '',
    payload: { manual: true },
    createdBy: actor
  });
  HoSoV2_Search_rebuildForHoSo(hoSoId);
  CBV_CoreV2_emitEvent({
    eventType: 'HOSO_SEARCH_INDEX_UPDATED',
    moduleCode: 'HOSO',
    entityType: 'HO_SO',
    entityId: hoSoId,
    sourceCommandId: command.commandId || '',
    payload: { manual: true },
    createdBy: actor
  });
  return { ok: true, entityType: 'HO_SO', entityId: hoSoId, message: 'Index rebuilt', data: {}, error: null };
}

function HoSoV2_Service_create(command) {
  return HosoService_create(command);
}
function HoSoV2_Service_update(command) {
  return HosoService_update(command);
}
function HoSoV2_Service_changeStatus(command) {
  return HosoService_changeStatus(command);
}
function HoSoV2_Service_getDetail(command) {
  return HosoService_getDetail(command);
}
function HoSoV2_Service_rebuildSearchIndex(command) {
  return HosoService_rebuildSearchIndex(command);
}
