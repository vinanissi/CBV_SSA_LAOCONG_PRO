# Search Architecture — Operational Search

**Phase:** PHASE_RF_01_MODULAR_OPERATIONAL_WORKSPACE_BASELINE  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`

---

## 1. Mục tiêu

**Operational search** — một ô tìm kiếm cho nhân sự vận hành, trả về kết quả đa module (task, hồ sơ, tài chính, file) mà không cần biết bảng Sheet nào.

Phase RF_01: **thiết kế only**. Chưa build search engine riêng. Ưu tiên **projection đơn giản qua Worker** (hoặc GAS bridge tạm) ở mốc triển khai sau.

---

## 2. Search scope

| Module | In scope | Out of scope (phase đầu) |
|--------|:--------:|:-------------------------:|
| TASK | ✓ | Full-text body dài |
| HO_SO | ✓ | Fuzzy phonetic name |
| FINANCE | ✓ | Cross-tenant |
| FILE (metadata) | ✓ | OCR content search |
| Timeline events | ✓ (as nested) | Standalone timeline index |
| ENUM / MASTER_CODE | — | Admin search (ADMIN only, separate) |
| Audit log raw | — | Mốc 3 observation |

---

## 3. Search fields

| Field | Module | Sheet column (ref) | Match type |
|-------|--------|-------------------|------------|
| Tên (display name) | HO_SO, USER | `DISPLAY_NAME`, `FULL_NAME` | contains, case-insensitive |
| Số điện thoại | HO_SO, USER | `PHONE`, contact fields | exact / contains |
| Biển số xe | HO_SO | `ID_NO` where type XE | normalize (bỏ dấu, space) |
| Mã hồ sơ | HO_SO | `ID`, `CODE` | prefix / exact |
| Task ID | TASK | `ID` | exact |
| Trạng thái | TASK, HO_SO, FINANCE | `STATUS` | enum match |
| CCCD / GPLX | HO_SO_FILE | `DOC_NO` | exact |
| Mã giao dịch | FINANCE | transaction ID | exact |

**Query normalization (Worker):**

1. Trim, collapse whitespace
2. Uppercase biển số / mã
3. Reject query < 2 ký tự (trừ exact ID)
4. Rate limit per user

---

## 4. Search flow (target)

```
User query
    │
    ▼
Workboard FE (/workspace/search?q=)
    │
    ▼
Cloudflare Worker  GET /search?q=&modules=task,hoso,finance
    │
    ├── auth + role filter
    ├── parallel GAS calls (or cached projection)
    │     ├── searchTasks(q, userCtx)
    │     ├── searchHoSo(q, userCtx)
    │     ├── searchFinance(q, userCtx)
    │     └── searchFiles(q, userCtx)
    │
    └── merge + rank + cap (max 50 results)
    │
    ▼
SearchResultDTO[]
```

**Transitional (pre-Worker):** GAS unified `searchOperational(q)` wrapper gọi module search hiện có (`searchTransactions`, HO_SO scan, TASK filter).

---

## 5. Search Result DTO

```json
{
  "query": "51A-12345",
  "tookMs": 120,
  "groups": [
    {
      "module": "HO_SO",
      "label": "Hồ sơ",
      "items": [
        {
          "id": "HS_20250101_001",
          "type": "HO_SO",
          "title": "Nguyễn Văn A — Xe 51A-12345",
          "subtitle": "ACTIVE · HTX XYZ",
          "status": "ACTIVE",
          "deepLink": "/workspace/hoso/HS_20250101_001",
          "matchedField": "ID_NO",
          "matchedValue": "51A-12345",
          "permissions": { "view": true, "edit": false }
        }
      ]
    },
    {
      "module": "TASK",
      "label": "Công việc",
      "items": [ "..." ]
    }
  ],
  "timelineHints": [],
  "files": []
}
```

### 5.1 Item fields (minimum)

| Field | Required | Notes |
|-------|:--------:|-------|
| `id` | ✓ | Stable record ID |
| `type` | ✓ | TASK \| HO_SO \| FINANCE \| FILE |
| `title` | ✓ | Human-readable VI |
| `subtitle` | | Status + context |
| `status` | | Enum value |
| `deepLink` | ✓ | Workboard route |
| `matchedField` | | Transparency for operator |
| `permissions.view` | ✓ | FE gate |
| `permissions.edit` | | FE action gate |

### 5.2 Nested results

| Nested | When |
|--------|------|
| `timelineHints` | Match in audit note / recent change |
| `files` | Match DOC_NO, file name |
| `relatedTasks` | HO_SO hit with open tasks (optional enrich) |

---

## 6. Permission filtering

Search **must not leak** private records.

| Rule | Implementation |
|------|----------------|
| TASK IS_PRIVATE | Filter via `canUserSeeTask(userId, taskRow)` |
| HO_SO scope | MANAGER_USER_ID / đơn vị |
| FINANCE | FINANCE role or related STAFF transactions only |
| VIEW_ONLY | View permission only in DTO |

Worker applies filter **before** returning DTO — never rely on FE to filter sensitive rows.

---

## 7. Ranking (simple — no ML)

| Priority | Condition |
|----------|-----------|
| 1 | Exact ID match |
| 2 | Exact phone / biển số |
| 3 | Active status over archived |
| 4 | Recent UPDATED_AT |
| 5 | Contains match title |

Cap: 20 items per module, 50 total.

---

## 8. Non-goals (phase RF_01 và mốc 1)

| Non-goal | Lý do |
|----------|-------|
| Elasticsearch / Algolia | Overkill for small team |
| Real-time index | Sheet is source; projection on read |
| OCR full-text | Mốc 4 plugin |
| Search admin ENUM tables | Separate admin UI |
| Auto-suggest ML | Manual-first |

---

## 9. Implementation roadmap tie-in

| Milestone | Search deliverable |
|-----------|-------------------|
| Mốc 1 | GAS unified search stub + FE search page + TASK/HO_SO basic |
| Mốc 2 | Finance in search + filter chips |
| Worker phase | Move `/search` to Worker; cache hot queries (optional) |
| Mốc 3 | Search health metrics in observation runtime |

---

## 10. Test criteria (CBV_TCS_V1)

- [ ] Query by task ID returns exact one (or zero)
- [ ] Private task invisible to unrelated STAFF
- [ ] Biển số normalized match
- [ ] Empty query returns validation error
- [ ] Response time logged in test envelope
