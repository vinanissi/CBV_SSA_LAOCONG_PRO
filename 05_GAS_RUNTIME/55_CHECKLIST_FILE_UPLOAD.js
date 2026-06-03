/**
 * PHASE_CHECKLIST_13 — Checklist file upload to Drive + Sheet metadata via bridge.
 * Non-destructive: no overwrite, no delete, no public sharing.
 */

var CL_UPLOAD_MAX_BYTES_ = 10 * 1024 * 1024;
var CL_UPLOAD_SOURCE_ = 'checklist_upload_v1';

function clUploadSanitizeFileName_(name) {
  var base = String(name || 'file').trim();
  base = base.replace(/[\/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_');
  if (base.length > 160) base = base.substring(base.length - 160);
  return base || 'file';
}

function clUploadUniqueFileName_(folder, originalName) {
  var safe = clUploadSanitizeFileName_(originalName);
  var stamped = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'yyyyMMdd_HHmmss') + '_' + safe;
  var candidate = stamped;
  var suffix = 1;
  while (folder.getFilesByName(candidate).hasNext()) {
    candidate = stamped + '_' + suffix;
    suffix++;
  }
  if (candidate !== safe && candidate !== stamped) {
    return { fileName: candidate, renamed: true, warning: 'File renamed to avoid collision: ' + candidate };
  }
  if (candidate !== originalName) {
    return { fileName: candidate, renamed: true, warning: 'File renamed with timestamp prefix' };
  }
  return { fileName: candidate, renamed: false };
}

function clUploadValidateInput_(payload) {
  var errors = [];
  var taskId = String(payload.taskId || '').trim();
  var checklistItemId = String(payload.checklistItemId || '').trim();
  var fileName = String(payload.fileName || '').trim();
  var contentBase64 = String(payload.contentBase64 || payload.fileBase64 || '').trim();
  if (!taskId) errors.push('taskId is required');
  if (!checklistItemId) errors.push('checklistItemId is required');
  if (!fileName) errors.push('fileName is required');
  if (!contentBase64) errors.push('contentBase64 is required');
  var size = Number(payload.size) || 0;
  if (size > CL_UPLOAD_MAX_BYTES_) errors.push('File exceeds max size ' + CL_UPLOAD_MAX_BYTES_);
  return {
    ok: errors.length === 0,
    errors: errors,
    taskId: taskId,
    checklistItemId: checklistItemId,
    fileName: fileName,
    contentBase64: contentBase64,
    mimeType: String(payload.mimeType || 'application/octet-stream'),
    size: size,
  };
}

/**
 * Upload checklist file to Drive item folder and write Sheet metadata + history.
 */
function clBridgeUploadChecklistFile_(payload, actor, traceId) {
  traceId = typeof clBridgeTraceId_ === 'function' ? clBridgeTraceId_(payload, traceId) : traceId;
  var validated = clUploadValidateInput_(payload);
  if (!validated.ok) {
    return clBridgeResult_(false, 'FAIL', traceId, null, validated.errors.join('; '), [], validated.errors);
  }

  var warnings = [];

  if (typeof bootstrapChecklistDriveFolders !== 'function') {
    return clBridgeResult_(false, 'FAIL', traceId, null, 'Drive bootstrap missing', [], ['bootstrapChecklistDriveFolders missing']);
  }

  var folderReport = bootstrapChecklistDriveFolders({
    taskId: validated.taskId,
    checklistItemId: validated.checklistItemId,
  });
  var itemFolder = folderReport.itemFolders && folderReport.itemFolders[0];
  if (!itemFolder || !itemFolder.folderId) {
    return clBridgeResult_(
      false,
      'FAIL',
      traceId,
      null,
      'Drive item folder not available',
      folderReport.warnings || [],
      ['Ensure Drive root configured'],
    );
  }

  var bytes;
  try {
    bytes = Utilities.base64Decode(validated.contentBase64);
  } catch (e) {
    return clBridgeResult_(false, 'FAIL', traceId, null, 'Invalid base64 content', [], [String(e.message || e)]);
  }

  if (bytes.length > CL_UPLOAD_MAX_BYTES_) {
    return clBridgeResult_(false, 'FAIL', traceId, null, 'Decoded file too large', [], ['Max ' + CL_UPLOAD_MAX_BYTES_ + ' bytes']);
  }

  var driveFolder;
  try {
    driveFolder = DriveApp.getFolderById(itemFolder.folderId);
  } catch (e) {
    return clBridgeResult_(false, 'FAIL', traceId, null, 'Cannot open Drive folder', [], [String(e.message || e)]);
  }

  var nameResult = clUploadUniqueFileName_(driveFolder, validated.fileName);
  if (nameResult.warning) warnings.push(nameResult.warning);

  var blob = Utilities.newBlob(bytes, validated.mimeType, nameResult.fileName);
  var driveFile;
  try {
    driveFile = driveFolder.createFile(blob);
  } catch (e) {
    clBridgeAppendHistory_(
      validated.taskId,
      validated.checklistItemId,
      'upload_failed',
      'Upload thất bại: ' + validated.fileName,
      clBridgeActorLabel_(actor),
      '',
      'attachment',
      { error: String(e.message || e), traceId: traceId },
      traceId,
    );
    return clBridgeResult_(false, 'FAIL', traceId, null, 'Drive createFile failed', warnings, [String(e.message || e)]);
  }

  var driveFileId = driveFile.getId();
  var driveUrl = 'https://drive.google.com/file/d/' + driveFileId + '/view';
  var attachmentId = typeof taskDbMakeId_ === 'function' ? taskDbMakeId_('CLA') : 'CLA-' + Date.now();

  var metaPayload = {
    taskId: validated.taskId,
    checklistItemId: validated.checklistItemId,
    id: attachmentId,
    name: nameResult.fileName,
    fileName: nameResult.fileName,
    driveFileId: driveFileId,
    url: driveUrl,
    driveUrl: driveUrl,
    mimeType: validated.mimeType,
    size: bytes.length,
    source: CL_UPLOAD_SOURCE_,
    createdBy: clBridgeActorLabel_(actor),
  };

  var metaRes = clBridgeAppendAttachmentMetadata_(metaPayload, actor, traceId);
  if (!metaRes.ok) {
    warnings.push('Drive file created but metadata write failed — file id ' + driveFileId);
    return clBridgeResult_(
      false,
      'FAIL',
      traceId,
      {
        driveFileId: driveFileId,
        driveUrl: driveUrl,
        driveFolderId: itemFolder.folderId,
        metadataWritten: false,
      },
      metaRes.message || 'Metadata write failed',
      warnings,
      metaRes.errors || [],
    );
  }

  clBridgeAppendHistory_(
    validated.taskId,
    validated.checklistItemId,
    'file_uploaded',
    'Tải lên: ' + nameResult.fileName,
    clBridgeActorLabel_(actor),
    attachmentId,
    'attachment',
    { driveFileId: driveFileId, fileName: nameResult.fileName, traceId: traceId },
    traceId,
  );

  return clBridgeResult_(
    true,
    warnings.length ? 'GO_WITH_WARNINGS' : 'GO',
    traceId,
    {
      taskId: validated.taskId,
      checklistItemId: validated.checklistItemId,
      driveFolderId: itemFolder.folderId,
      driveFileId: driveFileId,
      driveUrl: driveUrl,
      attachmentId: attachmentId,
      fileName: nameResult.fileName,
      metadataWritten: true,
      historyWritten: true,
      attachment: metaRes.data && metaRes.data.attachment ? metaRes.data.attachment : null,
    },
    '',
    warnings,
    [],
  );
}

/**
 * Validate file upload runtime readiness.
 */
function validateChecklistFileUploadRuntime(options) {
  options = options || {};
  var traceId = typeof clBridgeTraceId_ === 'function' ? clBridgeTraceId_(options, options.traceId) : 'upload-val';
  var result = {
    ok: true,
    status: 'GO',
    checkedAt: typeof clBridgeNowIso_ === 'function' ? clBridgeNowIso_() : new Date().toISOString(),
    traceId: traceId,
    upload: { maxBytes: CL_UPLOAD_MAX_BYTES_, fn: typeof clBridgeUploadChecklistFile_ === 'function' },
    drive: { bootstrap: typeof bootstrapChecklistDriveFolders === 'function' },
    sheet: { bridge: typeof clBridgeAppendAttachmentMetadata_ === 'function' },
    history: { bridge: typeof clBridgeAppendHistory_ === 'function' },
    warnings: [],
    errors: [],
    nextStep: 'PHASE_CHECKLIST_14_MULTI_USER_SYNC',
  };

  if (!result.upload.fn) {
    result.ok = false;
    result.errors.push('clBridgeUploadChecklistFile_ missing');
  }
  if (!result.drive.bootstrap) {
    result.warnings.push('Drive folder bootstrap not loaded');
  }
  if (typeof validateChecklistSheetDriveBridge === 'function') {
    var bridgeVal = validateChecklistSheetDriveBridge(options);
    if (!bridgeVal.ok) {
      result.warnings.push('Sheet/Drive bridge validation issues');
    }
  }

  if (result.errors.length) {
    result.status = 'FAIL';
    result.ok = false;
  } else if (result.warnings.length) {
    result.status = 'GO_WITH_WARNINGS';
  }
  return result;
}
