# PHASE 81 — OPERATIONAL_ASSIGNMENT_RUNTIME (prompt archive)

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

**Branch:** `phase/from-v2.4.1-TASK-FIN`  
**Repo:** `CBV_SSA_LAOCONG_PRO`  
**Chuẩn:** CBV Operational Ecosystem Standard V1  

## Mục tiêu

Nâng `HOME_ALERT` từ Operational Attention Queue sang **Operational Coordination Runtime**: ai xử lý, queue, kẹt, escalate, workload — **GAS/Sheet runtime**; AppSheet chỉ UI + action; không VC/Bot/trigger production; không formula workload trên AppSheet.

## Deliverables (Phase 81)

1. Chuẩn kiến trúc: `04_APPSHEET/HOME_ALERT_ASSIGNMENT_RUNTIME_STANDARD.md`  
2. Schema append: `ASSIGNMENT_*`, `QUEUE_*`, `OPERATOR_DASHBOARD_*`, `WORKLOAD_KEY`, `HOME_ALERT_WORKLOAD` manifest + audit.  
3. GAS: `80_HOME_ALERT_RUNTIME.js` — enrich assignment, actions, workload refresh + test console.  
4. AppSheet docs cập nhật (setup, desktop, display standard).  
5. Report / handoff append-only dưới `00_SYSTEM_BRAIN/`.

## Ràng buộc

Không phá 80B state machine; không overwrite prompt/report/handoff cũ; không commit `.clasp.json` nếu chỉ binding local.
