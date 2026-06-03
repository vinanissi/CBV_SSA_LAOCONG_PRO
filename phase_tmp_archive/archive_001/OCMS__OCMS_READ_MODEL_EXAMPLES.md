# OCMS Read Model Examples — P0

**Version:** 0.1  
**Phase:** `PHASE_OCMS_02_READ_MODEL_CONTRACT`  
**Note:** Examples are **spec illustrations** — `diagnostics.runtimeState: NOT_WIRED` unless live read verified.

---

## Example 1 — OPERATIONS (TASK_ANCHORED)

**Description:** Công việc vận hành nội bộ — một task Work Inbox, không hồ sơ.

**Anchor:** Task `T-2026-0042` on `/inbox/T-2026-0042`

```json
{
  "caseKey": "OPERATIONS:TASK:T-2026-0042",
  "caseType": "OPERATIONS",
  "title": "Kiểm kê kho cuối tuần",
  "lifecycle": {
    "code": "ACTIVE",
    "label": "Đang xử lý",
    "since": "2026-05-30T09:00:00+07:00",
    "source": "INFERRED",
    "confidence": "MEDIUM"
  },
  "result": null,
  "responsibility": {
    "responsible": {
      "actorId": "USR_001",
      "displayName": "Nguyễn Văn A",
      "roleSource": "TASK_MAIN",
      "confidence": "HIGH"
    },
    "support": [
      {
        "actorId": "USR_002",
        "displayName": "Trần Thị B",
        "roleSource": "TASK_MAIN",
        "confidence": "HIGH"
      }
    ],
    "reviewer": [],
    "escalation": [],
    "watcher": [
      {
        "actorId": "USR_003",
        "displayName": "Lê Văn C",
        "roleSource": "TASK_MAIN",
        "confidence": "MEDIUM"
      }
    ]
  },
  "relations": [
    {
      "targetType": "TASK",
      "targetId": "T-2026-0042",
      "role": "PRIMARY",
      "label": "Kiểm kê kho cuối tuần",
      "source": "TASK_MAIN",
      "confidence": "HIGH",
      "projectionKey": "task"
    }
  ],
  "workItems": [
    {
      "workItemType": "TASK",
      "workItemId": "T-2026-0042",
      "title": "Kiểm kê kho cuối tuần",
      "status": "IN_PROGRESS",
      "owner": { "actorId": "USR_001", "displayName": "Nguyễn Văn A", "roleSource": "TASK_MAIN", "confidence": "HIGH" },
      "assignee": { "actorId": "USR_002", "displayName": "Trần Thị B", "roleSource": "TASK_MAIN", "confidence": "HIGH" },
      "dueAt": "2026-05-31T17:00:00+07:00",
      "sourceRuntime": "TASK_GS_01",
      "deepLink": "/inbox/T-2026-0042"
    }
  ],
  "memorySummary": {
    "lastActivityAt": "2026-05-30T14:22:00+07:00",
    "lastActivityText": "Cập nhật trạng thái: Đang xử lý",
    "counts": {
      "timeline": 3,
      "checklist": 5,
      "attachments": 1,
      "comments": 1,
      "decisions": 0,
      "handoffs": 0,
      "evidence": 0
    },
    "recent": [
      {
        "memoryType": "Checklist Activity",
        "label": "Đã hoàn thành: Kiểm đủ số lượng",
        "at": "2026-05-30T14:22:00+07:00",
        "actor": { "actorId": "USR_002", "displayName": "Trần Thị B", "roleSource": "TASK_CHECKLIST", "confidence": "HIGH" },
        "sourceRuntime": "TASK_GS_01",
        "deepLink": "/inbox/T-2026-0042"
      }
    ]
  },
  "projections": {
    "task": {
      "sourceRuntime": "TASK_GS_01",
      "stale": false,
      "lastReadAt": null,
      "data": { "taskId": "T-2026-0042", "priority": "NORMAL" },
      "summary": "Task IN_PROGRESS — due 31/05"
    }
  },
  "permissions": {
    "canView": true,
    "canOpenSource": true,
    "canOpenRelated": true,
    "canSeePrivateFields": true,
    "canMutateTask": true
  },
  "source": "TASK_ANCHORED",
  "diagnostics": {
    "confidence": "MEDIUM",
    "missingRelations": [],
    "missingProjections": [],
    "staleSources": [],
    "warnings": ["lifecycle INFERRED from task — not persisted case lifecycle"],
    "runtimeState": "NOT_WIRED"
  }
}
```

---

## Example 2 — HO_SO (HO_SO_ANCHORED / MIXED)

**Description:** Duyệt hồ sơ gia nhập xã viên — anchor hồ sơ `HS-2026-001`, task hỗ trợ trên inbox.

**Anchor:** Task `T-2026-0100` linked to `HS-2026-001`

```json
{
  "caseKey": "HO_SO:HS-2026-001",
  "caseType": "HO_SO",
  "title": "Hồ sơ gia nhập — Nguyễn X",
  "lifecycle": {
    "code": "REVIEW",
    "label": "Chờ duyệt",
    "since": "2026-05-29T16:00:00+07:00",
    "source": "INFERRED",
    "confidence": "MEDIUM"
  },
  "result": null,
  "responsibility": {
    "responsible": {
      "actorId": "USR_010",
      "displayName": "Cán bộ hồ sơ",
      "roleSource": "TASK_MAIN",
      "confidence": "HIGH"
    },
    "support": [],
    "reviewer": [
      {
        "actorId": "USR_020",
        "displayName": "Trưởng phòng",
        "roleSource": "INFERRED",
        "confidence": "LOW"
      }
    ],
    "escalation": [],
    "watcher": []
  },
  "relations": [
    {
      "targetType": "HO_SO",
      "targetId": "HS-2026-001",
      "role": "PRIMARY",
      "label": "Hồ sơ gia nhập — Nguyễn X",
      "source": "HO_SO_MASTER",
      "confidence": "HIGH",
      "projectionKey": "hoSo"
    },
    {
      "targetType": "XA_VIEN",
      "targetId": "XV-0001",
      "role": "TARGET",
      "label": "Nguyễn X",
      "source": "HO_SO_MASTER",
      "confidence": "HIGH"
    },
    {
      "targetType": "TASK",
      "targetId": "T-2026-0100",
      "role": "SECONDARY",
      "label": "Task duyệt hồ sơ",
      "source": "TASK_MAIN",
      "confidence": "HIGH",
      "projectionKey": "task"
    },
    {
      "targetType": "DOCUMENT",
      "targetId": "DOC-001",
      "role": "EVIDENCE_REF",
      "label": "CMND + Hợp đồng",
      "source": "HO_SO_FILE",
      "confidence": "MEDIUM"
    }
  ],
  "workItems": [
    {
      "workItemType": "TASK",
      "workItemId": "T-2026-0100",
      "title": "Duyệt hồ sơ HS-2026-001",
      "status": "IN_PROGRESS",
      "owner": { "actorId": "USR_010", "displayName": "Cán bộ hồ sơ", "roleSource": "TASK_MAIN", "confidence": "HIGH" },
      "assignee": null,
      "dueAt": "2026-06-02T17:00:00+07:00",
      "sourceRuntime": "TASK_GS_01",
      "deepLink": "/inbox/T-2026-0100"
    }
  ],
  "memorySummary": {
    "lastActivityAt": "2026-05-29T15:30:00+07:00",
    "lastActivityText": "Bổ sung giấy tờ CMND",
    "counts": {
      "timeline": 8,
      "checklist": 6,
      "attachments": 4,
      "comments": 2,
      "decisions": 0,
      "handoffs": 0,
      "evidence": 3
    },
    "recent": [
      {
        "memoryType": "Attachment",
        "label": "CMND mặt trước.pdf",
        "at": "2026-05-29T15:30:00+07:00",
        "actor": { "actorId": "USR_010", "displayName": "Cán bộ hồ sơ", "roleSource": "TASK_ATTACHMENT", "confidence": "HIGH" },
        "sourceRuntime": "TASK_GS_01",
        "deepLink": "/inbox/T-2026-0100"
      }
    ]
  },
  "projections": {
    "task": {
      "sourceRuntime": "TASK_GS_01",
      "stale": false,
      "lastReadAt": null,
      "data": null,
      "summary": "Task IN_PROGRESS"
    },
    "hoSo": {
      "sourceRuntime": "HO_SO_RF06",
      "stale": false,
      "lastReadAt": null,
      "data": { "hoSoId": "HS-2026-001", "xaVienId": "XV-0001", "statusHint": "VALIDATING" },
      "summary": "Hồ sơ đang kiểm tra — thiếu GPLX"
    }
  },
  "permissions": {
    "canView": true,
    "canOpenSource": true,
    "canOpenRelated": true,
    "canSeePrivateFields": true,
    "canMutateTask": true
  },
  "source": "MIXED",
  "diagnostics": {
    "confidence": "MEDIUM",
    "missingRelations": [],
    "missingProjections": [],
    "staleSources": [],
    "warnings": ["reviewer INFERRED — no persisted responsibility roles", "result null until approval"],
    "runtimeState": "NOT_WIRED"
  }
}
```

---

## Example 3 — FINANCE (FINANCE_ANCHORED)

**Description:** Quyết toán tạm ứng tháng 5 — anchor giao dịch `TX-2026-088`.

```json
{
  "caseKey": "FINANCE:TX:TX-2026-088",
  "caseType": "FINANCE",
  "title": "Quyết toán tạm ứng — Nguyễn A — T5/2026",
  "lifecycle": {
    "code": "REVIEW",
    "label": "Chờ duyệt",
    "since": "2026-05-28T10:00:00+07:00",
    "source": "INFERRED",
    "confidence": "MEDIUM"
  },
  "result": {
    "code": "Verified",
    "group": "OPEN",
    "label": "Đã đối chiếu sơ bộ",
    "source": "FINANCE_TRANSACTION",
    "confidence": "MEDIUM"
  },
  "responsibility": {
    "responsible": {
      "actorId": "USR_030",
      "displayName": "Kế toán viên",
      "roleSource": "TASK_MAIN",
      "confidence": "HIGH"
    },
    "support": [
      {
        "actorId": "USR_001",
        "displayName": "Nguyễn Văn A",
        "roleSource": "INFERRED",
        "confidence": "MEDIUM"
      }
    ],
    "reviewer": [
      {
        "actorId": "USR_040",
        "displayName": "Kế toán trưởng",
        "roleSource": "INFERRED",
        "confidence": "LOW"
      }
    ],
    "escalation": [],
    "watcher": []
  },
  "relations": [
    {
      "targetType": "FINANCE_TRANSACTION",
      "targetId": "TX-2026-088",
      "role": "PRIMARY",
      "label": "Quyết toán tạm ứng T5",
      "source": "FINANCE_TRANSACTION",
      "confidence": "HIGH",
      "projectionKey": "finance"
    },
    {
      "targetType": "PERSON",
      "targetId": "USR_001",
      "role": "TARGET",
      "label": "Nguyễn Văn A",
      "source": "FINANCE_TRANSACTION",
      "confidence": "MEDIUM"
    },
    {
      "targetType": "TASK",
      "targetId": "T-2026-0200",
      "role": "SECONDARY",
      "label": "Task quyết toán",
      "source": "TASK_MAIN",
      "confidence": "HIGH",
      "projectionKey": "task"
    },
    {
      "targetType": "DOCUMENT",
      "targetId": "DOC-RCPT-501",
      "role": "EVIDENCE_REF",
      "label": "Biên lai tạm ứng",
      "source": "TASK_ATTACHMENT",
      "confidence": "HIGH"
    }
  ],
  "workItems": [
    {
      "workItemType": "TASK",
      "workItemId": "T-2026-0200",
      "title": "Quyết toán TX-2026-088",
      "status": "IN_PROGRESS",
      "owner": { "actorId": "USR_030", "displayName": "Kế toán viên", "roleSource": "TASK_MAIN", "confidence": "HIGH" },
      "assignee": null,
      "dueAt": "2026-06-05T17:00:00+07:00",
      "sourceRuntime": "TASK_GS_01",
      "deepLink": "/inbox/T-2026-0200"
    }
  ],
  "memorySummary": {
    "lastActivityAt": "2026-05-28T11:15:00+07:00",
    "lastActivityText": "Đính kèm biên lai",
    "counts": {
      "timeline": 5,
      "checklist": 4,
      "attachments": 3,
      "comments": 1,
      "decisions": 0,
      "handoffs": 0,
      "evidence": 2
    },
    "recent": [
      {
        "memoryType": "Update",
        "label": "Số tiền quyết toán: 2.500.000đ",
        "at": "2026-05-28T11:15:00+07:00",
        "actor": { "actorId": "USR_030", "displayName": "Kế toán viên", "roleSource": "TASK_UPDATE_LOG", "confidence": "HIGH" },
        "sourceRuntime": "TASK_GS_01",
        "deepLink": "/inbox/T-2026-0200"
      }
    ]
  },
  "projections": {
    "task": {
      "sourceRuntime": "TASK_GS_01",
      "stale": false,
      "lastReadAt": null,
      "data": null,
      "summary": "Task IN_PROGRESS"
    },
    "finance": {
      "sourceRuntime": "FINANCE_RF06",
      "stale": false,
      "lastReadAt": null,
      "data": { "txId": "TX-2026-088", "amount": 2500000, "stateHint": "VERIFIED" },
      "summary": "Tạm ứng T5 — chờ duyệt chi"
    }
  },
  "permissions": {
    "canView": true,
    "canOpenSource": true,
    "canOpenRelated": true,
    "canSeePrivateFields": false,
    "canMutateTask": true
  },
  "source": "FINANCE_ANCHORED",
  "diagnostics": {
    "confidence": "MEDIUM",
    "missingRelations": [],
    "missingProjections": [],
    "staleSources": [],
    "warnings": ["finance projection from RF06 — verify live binding in OCMS_03"],
    "runtimeState": "NOT_WIRED"
  }
}
```

---

*Spec examples — not live API responses.*
