/**
 * PHASE_CHECKLIST_10_DRIVE_FOLDER_BOOTSTRAP — idempotent Drive folders for checklist files.
 * Non-destructive: no folder delete, file move, permission changes, or uploads.
 */

var CBV_CHECKLIST_DRIVE_ROOT_FOLDER_NAME = 'OCMS_CHECKLIST_FILES';
var CBV_CHECKLIST_DRIVE_SCRIPT_PROP_ROOT = 'CBV_CHECKLIST_DRIVE_ROOT_FOLDER_ID';
var CBV_CHECKLIST_DRIVE_SCRIPT_PROP_PARENT = 'CBV_OPERATIONAL_DRIVE_ROOT_FOLDER_ID';

function cbvClDriveNowIso_() {
  try {
    return Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', "yyyy-MM-dd'T'HH:mm:ss");
  } catch (e) {
    return String(new Date().toISOString());
  }
}

/**
 * Sanitize a Drive folder name segment (task id / checklist item id).
 * @param {string} value
 * @param {string} label
 * @returns {{ ok: boolean, segment?: string, error?: string }}
 */
function sanitizeChecklistDriveSegment(value, label) {
  var s = String(value || '').trim();
  if (!s) {
    return { ok: false, error: (label || 'id') + ' is required' };
  }
  s = s.replace(/[\/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_');
  if (s.length > 180) {
    s = s.substring(0, 180);
  }
  return { ok: true, segment: s };
}

/**
 * @param {string} taskId
 * @returns {{ ok: boolean, folderName?: string, error?: string }}
 */
function buildChecklistTaskFolderName(taskId) {
  var r = sanitizeChecklistDriveSegment(taskId, 'taskId');
  if (!r.ok) {
    return r;
  }
  return { ok: true, folderName: 'TASK_' + r.segment };
}

/**
 * @param {string} checklistItemId
 * @returns {{ ok: boolean, folderName?: string, error?: string }}
 */
function buildChecklistItemFolderName(checklistItemId) {
  var r = sanitizeChecklistDriveSegment(checklistItemId, 'checklistItemId');
  if (!r.ok) {
    return r;
  }
  return { ok: true, folderName: 'ITEM_' + r.segment };
}

function cbvClDriveFolderUrl_(folderId) {
  return 'https://drive.google.com/drive/folders/' + String(folderId);
}

function cbvClDriveGetConfiguredRootId_() {
  try {
    var v = PropertiesService.getScriptProperties().getProperty(CBV_CHECKLIST_DRIVE_SCRIPT_PROP_ROOT);
    if (v && String(v).trim()) {
      return String(v).trim();
    }
  } catch (e) {}
  return null;
}

function cbvClDriveResolveOperationalParentId_(options) {
  options = options || {};
  if (options.parentFolderId) {
    return String(options.parentFolderId).trim();
  }
  try {
    var props = PropertiesService.getScriptProperties();
    var op = props.getProperty(CBV_CHECKLIST_DRIVE_SCRIPT_PROP_PARENT);
    if (op && String(op).trim()) {
      return String(op).trim();
    }
    if (typeof HomeAlert_getSystemBrainDriveFolderId_ === 'function') {
      return HomeAlert_getSystemBrainDriveFolderId_();
    }
    var sys = props.getProperty('CBV_SYSTEM_BRAIN_DRIVE_FOLDER_ID');
    if (sys && String(sys).trim()) {
      return String(sys).trim();
    }
  } catch (e) {}
  return null;
}

function cbvClDriveFindChildFolderByName_(parentFolder, folderName) {
  var it = parentFolder.getFoldersByName(folderName);
  if (it.hasNext()) {
    return it.next();
  }
  return null;
}

function cbvClDriveGetOrCreateChild_(parentFolder, folderName, dryRun) {
  var existing = cbvClDriveFindChildFolderByName_(parentFolder, folderName);
  if (existing) {
    var eid = existing.getId();
    return {
      folder: existing,
      created: false,
      existed: true,
      folderId: eid,
      folderName: folderName,
      driveUrl: cbvClDriveFolderUrl_(eid),
    };
  }
  if (dryRun) {
    return {
      folder: null,
      created: false,
      existed: false,
      dryRun: true,
      folderName: folderName,
    };
  }
  var created = parentFolder.createFolder(folderName);
  var cid = created.getId();
  return {
    folder: created,
    created: true,
    existed: false,
    folderId: cid,
    folderName: folderName,
    driveUrl: cbvClDriveFolderUrl_(cid),
  };
}

function cbvClDriveEnsureRoot_(options) {
  options = options || {};
  var dryRun = options.dryRun === true;
  var out = {
    rootFolderName: CBV_CHECKLIST_DRIVE_ROOT_FOLDER_NAME,
    rootFolderId: null,
    driveUrl: null,
    source: null,
    createdAt: cbvClDriveNowIso_(),
    created: false,
    warnings: [],
    errors: [],
  };

  var configuredId = cbvClDriveGetConfiguredRootId_();
  if (configuredId) {
    try {
      var cfgFolder = DriveApp.getFolderById(configuredId);
      out.rootFolderId = cfgFolder.getId();
      out.driveUrl = cbvClDriveFolderUrl_(out.rootFolderId);
      out.source = 'configured_root';
      return out;
    } catch (e) {
      out.errors.push('Configured root not accessible: ' + configuredId + ' — ' + String(e.message || e));
      out.source = 'configured_root';
      return out;
    }
  }

  var parentId = cbvClDriveResolveOperationalParentId_(options);
  if (!parentId) {
    out.warnings.push(
      'No checklist Drive root configured. Set ' +
        CBV_CHECKLIST_DRIVE_SCRIPT_PROP_ROOT +
        ' or parent ' +
        CBV_CHECKLIST_DRIVE_SCRIPT_PROP_PARENT,
    );
    out.source = 'missing_config';
    return out;
  }

  try {
    var parent = DriveApp.getFolderById(parentId);
    var child = cbvClDriveGetOrCreateChild_(parent, CBV_CHECKLIST_DRIVE_ROOT_FOLDER_NAME, dryRun);
    if (child.folderId) {
      out.rootFolderId = child.folderId;
      out.driveUrl = child.driveUrl;
      out.source = child.created ? 'created_root' : 'existing_root';
      out.created = !!child.created;
    } else if (dryRun) {
      out.source = 'dry_run';
      out.warnings.push('dryRun: would ensure ' + CBV_CHECKLIST_DRIVE_ROOT_FOLDER_NAME + ' under parent ' + parentId);
    }
    if (options.persistRootId && out.rootFolderId && !dryRun) {
      PropertiesService.getScriptProperties().setProperty(CBV_CHECKLIST_DRIVE_SCRIPT_PROP_ROOT, out.rootFolderId);
      out.warnings.push('Persisted ' + CBV_CHECKLIST_DRIVE_SCRIPT_PROP_ROOT);
    }
  } catch (e) {
    out.errors.push('Parent folder error: ' + String(e.message || e));
  }

  return out;
}

/**
 * Idempotent Drive folder bootstrap for checklist file storage.
 * @param {Object} [options] dryRun, taskId, checklistItemId, parentFolderId, persistRootId
 * @returns {Object}
 */
function bootstrapChecklistDriveFolders(options) {
  options = options || {};
  var dryRun = options.dryRun === true;
  var report = {
    ok: true,
    status: 'GO',
    phase: 'PHASE_CHECKLIST_10_DRIVE_FOLDER_BOOTSTRAP',
    checkedAt: cbvClDriveNowIso_(),
    dryRun: dryRun,
    rootFolder: null,
    taskFolders: [],
    itemFolders: [],
    createdFolders: [],
    existingFolders: [],
    warnings: [],
    errors: [],
    nextStep: 'Run validateChecklistDriveFolders()',
  };

  var root = cbvClDriveEnsureRoot_(options);
  report.rootFolder = {
    rootFolderId: root.rootFolderId,
    rootFolderName: root.rootFolderName,
    source: root.source,
    driveUrl: root.driveUrl,
    createdAt: root.createdAt,
    created: root.created,
  };
  root.warnings.forEach(function (w) {
    report.warnings.push('root: ' + w);
  });
  root.errors.forEach(function (err) {
    report.errors.push('root: ' + err);
  });

  if (root.created && root.rootFolderId) {
    report.createdFolders.push({ level: 'root', folderId: root.rootFolderId, name: root.rootFolderName });
  } else if (root.rootFolderId) {
    report.existingFolders.push({ level: 'root', folderId: root.rootFolderId, name: root.rootFolderName });
  }

  if (root.errors.length) {
    report.ok = false;
    report.status = 'FAIL';
  } else if (!root.rootFolderId) {
    report.status = 'GO_WITH_WARNINGS';
    report.warnings.push('Root folder not resolved — configure script properties before task/item folders');
  }

  if (!root.rootFolderId || !options.taskId) {
    if (report.errors.length) {
      report.nextStep = 'Fix Drive configuration or permissions';
    }
    return report;
  }

  var taskBuilt = buildChecklistTaskFolderName(options.taskId);
  if (!taskBuilt.ok) {
    report.warnings.push(taskBuilt.error);
    report.status = 'GO_WITH_WARNINGS';
    return report;
  }

  try {
    var rootFolder = DriveApp.getFolderById(root.rootFolderId);
    var taskRes = cbvClDriveGetOrCreateChild_(rootFolder, taskBuilt.folderName, dryRun);
    var taskFolder = {
      taskId: options.taskId,
      folderName: taskBuilt.folderName,
      folderId: taskRes.folderId || null,
      parentFolderId: root.rootFolderId,
      driveUrl: taskRes.driveUrl || null,
      createdAt: cbvClDriveNowIso_(),
      created: !!taskRes.created,
      dryRun: !!taskRes.dryRun,
    };
    report.taskFolders.push(taskFolder);

    if (taskRes.created && taskRes.folderId) {
      report.createdFolders.push({ level: 'task', folderId: taskRes.folderId, name: taskBuilt.folderName });
    } else if (taskRes.folderId) {
      report.existingFolders.push({ level: 'task', folderId: taskRes.folderId, name: taskBuilt.folderName });
    }

    if (!options.checklistItemId) {
      if (report.warnings.length || report.status === 'GO_WITH_WARNINGS') {
        /* keep */
      }
      return report;
    }

    var itemBuilt = buildChecklistItemFolderName(options.checklistItemId);
    if (!itemBuilt.ok) {
      report.warnings.push(itemBuilt.error);
      report.status = 'GO_WITH_WARNINGS';
      return report;
    }

    if (!taskRes.folderId && dryRun) {
      report.warnings.push('dryRun: item folder ' + itemBuilt.folderName + ' not created (task folder dry-run)');
      return report;
    }

    if (!taskRes.folderId) {
      report.errors.push('Task folder missing after bootstrap');
      report.ok = false;
      report.status = 'FAIL';
      return report;
    }

    var taskFolderRef = DriveApp.getFolderById(taskRes.folderId);
    var itemRes = cbvClDriveGetOrCreateChild_(taskFolderRef, itemBuilt.folderName, dryRun);
    var itemFolder = {
      taskId: options.taskId,
      checklistItemId: options.checklistItemId,
      folderName: itemBuilt.folderName,
      folderId: itemRes.folderId || null,
      parentFolderId: taskRes.folderId,
      driveUrl: itemRes.driveUrl || null,
      createdAt: cbvClDriveNowIso_(),
      created: !!itemRes.created,
      dryRun: !!itemRes.dryRun,
    };
    report.itemFolders.push(itemFolder);

    if (itemRes.created && itemRes.folderId) {
      report.createdFolders.push({ level: 'item', folderId: itemRes.folderId, name: itemBuilt.folderName });
    } else if (itemRes.folderId) {
      report.existingFolders.push({ level: 'item', folderId: itemRes.folderId, name: itemBuilt.folderName });
    }
  } catch (e) {
    report.errors.push(String(e.message || e));
    report.ok = false;
    report.status = 'FAIL';
  }

  if (report.errors.length) {
    report.ok = false;
    report.status = 'FAIL';
  } else if (report.warnings.length && report.status === 'GO') {
    report.status = 'GO_WITH_WARNINGS';
  }

  report.nextStep = report.ok
    ? 'PHASE_CHECKLIST_11_SHEET_DRIVE_BRIDGE_IMPLEMENTATION'
    : 'Fix errors and re-run validateChecklistDriveFolders()';

  return report;
}

/**
 * Validate checklist Drive folder configuration (read-only when dryRun; no file ops).
 * @param {Object} [options] taskId, checklistItemId, parentFolderId
 * @returns {Object}
 */
function validateChecklistDriveFolders(options) {
  options = options || {};
  var result = {
    ok: true,
    status: 'GO',
    checkedAt: cbvClDriveNowIso_(),
    rootFolder: null,
    taskFolders: [],
    itemFolders: [],
    createdFolders: [],
    existingFolders: [],
    warnings: [],
    errors: [],
    nextStep: 'PHASE_CHECKLIST_11_SHEET_DRIVE_BRIDGE_IMPLEMENTATION',
  };

  var configuredId = cbvClDriveGetConfiguredRootId_();
  if (configuredId) {
    try {
      var f = DriveApp.getFolderById(configuredId);
      result.rootFolder = {
        rootFolderId: f.getId(),
        rootFolderName: CBV_CHECKLIST_DRIVE_ROOT_FOLDER_NAME,
        source: 'configured_root',
        driveUrl: cbvClDriveFolderUrl_(f.getId()),
      };
      result.existingFolders.push({ level: 'root', folderId: f.getId(), name: CBV_CHECKLIST_DRIVE_ROOT_FOLDER_NAME });
    } catch (e) {
      result.errors.push('Configured root invalid: ' + String(e.message || e));
      result.ok = false;
    }
  } else {
    var parentId = cbvClDriveResolveOperationalParentId_(options);
    if (!parentId) {
      result.warnings.push('Root not configured; set ' + CBV_CHECKLIST_DRIVE_SCRIPT_PROP_ROOT);
      result.rootFolder = {
        rootFolderId: null,
        rootFolderName: CBV_CHECKLIST_DRIVE_ROOT_FOLDER_NAME,
        source: 'missing_config',
        driveUrl: null,
      };
      result.status = 'GO_WITH_WARNINGS';
    } else {
      try {
        var parent = DriveApp.getFolderById(parentId);
        var found = cbvClDriveFindChildFolderByName_(parent, CBV_CHECKLIST_DRIVE_ROOT_FOLDER_NAME);
        if (found) {
          result.rootFolder = {
            rootFolderId: found.getId(),
            rootFolderName: CBV_CHECKLIST_DRIVE_ROOT_FOLDER_NAME,
            source: 'existing_root',
            driveUrl: cbvClDriveFolderUrl_(found.getId()),
          };
          result.existingFolders.push({ level: 'root', folderId: found.getId(), name: CBV_CHECKLIST_DRIVE_ROOT_FOLDER_NAME });
        } else {
          result.warnings.push(CBV_CHECKLIST_DRIVE_ROOT_FOLDER_NAME + ' not found under parent ' + parentId);
          result.rootFolder = {
            rootFolderId: null,
            rootFolderName: CBV_CHECKLIST_DRIVE_ROOT_FOLDER_NAME,
            source: 'missing_root',
            driveUrl: null,
          };
          result.status = 'GO_WITH_WARNINGS';
        }
      } catch (e) {
        result.errors.push(String(e.message || e));
        result.ok = false;
      }
    }
  }

  if (!options.taskId) {
    result.warnings.push('taskId omitted — task/item naming not validated');
  } else {
    var tn = buildChecklistTaskFolderName(options.taskId);
    if (!tn.ok) {
      result.errors.push(tn.error);
      result.ok = false;
    } else {
      result.taskFolders.push({
        taskId: options.taskId,
        folderName: tn.folderName,
        folderId: null,
        parentFolderId: result.rootFolder && result.rootFolder.rootFolderId,
        driveUrl: null,
      });
      if (result.rootFolder && result.rootFolder.rootFolderId) {
        try {
          var rootF = DriveApp.getFolderById(result.rootFolder.rootFolderId);
          var tf = cbvClDriveFindChildFolderByName_(rootF, tn.folderName);
          if (tf) {
            result.taskFolders[0].folderId = tf.getId();
            result.taskFolders[0].driveUrl = cbvClDriveFolderUrl_(tf.getId());
            result.existingFolders.push({ level: 'task', folderId: tf.getId(), name: tn.folderName });
          } else {
            result.warnings.push('Task folder not found: ' + tn.folderName);
          }
        } catch (e) {
          result.warnings.push('Cannot inspect task folder: ' + String(e.message || e));
        }
      }
    }
  }

  if (options.checklistItemId) {
    var in_ = buildChecklistItemFolderName(options.checklistItemId);
    if (!in_.ok) {
      result.errors.push(in_.error);
      result.ok = false;
    } else {
      var itemEntry = {
        taskId: options.taskId || '',
        checklistItemId: options.checklistItemId,
        folderName: in_.folderName,
        folderId: null,
        parentFolderId: result.taskFolders[0] && result.taskFolders[0].folderId,
        driveUrl: null,
      };
      result.itemFolders.push(itemEntry);
      if (itemEntry.parentFolderId) {
        try {
          var taskF = DriveApp.getFolderById(itemEntry.parentFolderId);
          var itf = cbvClDriveFindChildFolderByName_(taskF, in_.folderName);
          if (itf) {
            itemEntry.folderId = itf.getId();
            itemEntry.driveUrl = cbvClDriveFolderUrl_(itf.getId());
            result.existingFolders.push({ level: 'item', folderId: itf.getId(), name: in_.folderName });
          } else {
            result.warnings.push('Item folder not found: ' + in_.folderName);
          }
        } catch (e) {
          result.warnings.push('Cannot inspect item folder: ' + String(e.message || e));
        }
      }
    }
  } else if (options.taskId) {
    result.warnings.push('checklistItemId omitted — item folder not validated');
  }

  if (result.errors.length) {
    result.status = 'FAIL';
    result.ok = false;
    result.nextStep = 'Run bootstrapChecklistDriveFolders() after fixing config';
  } else if (result.warnings.length) {
    result.status = 'GO_WITH_WARNINGS';
  }

  return result;
}
