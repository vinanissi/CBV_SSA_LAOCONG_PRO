# PHASE APPSHEET-REF-A — APPSHEET_REFERENCE_AND_ENUM_BINDING

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

**Repo:** `CBV_SSA_LAOCONG_PRO`  
**Standard:** CBV Operational Ecosystem Standard V1  
**Scope:** Docs-only — cập nhật AppSheet deployment docs, formula library, checklist; **không** thêm core runtime lớn, **không** ENV-A, **không** automation mới.

## Deliverables

1. `docs/appsheet/APPSHEET_HOME_ALERT_INSTALL_GUIDE.md` — section **§3A** Reference/Enum binding sau REF-A.
2. `docs/appsheet/APPSHEET_HOME_ALERT_FORMULA_REFERENCE.md` — section **§6B** formula library.
3. `docs/appsheet/APPSHEET_REFERENCE_BINDING_CHECKLIST.md` — checklist mới.
4. `docs/HOME_ALERT_DEPLOYMENT_DOCS_INDEX.md` — mục APPSHEET-REF-A + thứ tự đọc.
5. `00_SYSTEM_BRAIN/000_REPORTS/014_*` report, `001_HANDOFF/014_*` handoff (append-only filenames).

## Constraints

No triggers, no AppSheet Bot, no auto assign/resolve/escalate, no secrets in reference sheets, preserve `OPERATOR_*` contract, AppSheet expressions use `,` not `;`.
