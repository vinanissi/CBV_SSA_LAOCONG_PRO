# 110 — Phase 510 — Fix Milestone 05 stepper markers — Report (append-only)

**Date:** 2026-05-14  
**Branch:** `phase/from-v2.4.1-TASK-FIN`

## Audit source

- Failed Drive bundle: `109_MILESTONE_05_GUIDED_SOP_RUNTIME_*` (folder `1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG`)
- Failing checks: `UI_MARKERS_STEPPER`, `REPORT_ENVELOPE` (envelope gated by run FAIL)

## Root cause (exact)

`998X` chỉ quét chuỗi HTML trả về từ **`CbvGuidedSop_buildStepperHtml_(flowModel)`**.

Trong bản M05 trước đó:

- Các class **`cbv-sop-current-step`** và **`cbv-sop-next-step`** chỉ xuất hiện trong **`CbvGuidedSop_buildCurrentStepBannerHtml_`** (dùng ở cognition và trang SOP riêng), **không** được gộp vào output của `buildStepperHtml_`.
- `buildStepperHtml_` chỉ gồm wrapper `cbv-sop-stepper`, dòng `cbv-sop-template-id`, và các thẻ `cbv-sop-step-card` — thiếu hai marker mà contract test yêu cầu trong cùng một chuỗi stepper.

Đây là lệch contract giữa **marker banner** và **marker stepper**, không phải lỗi logic registry/engine.

## Files updated

- `05_GAS_RUNTIME/998W_WEBAPP_GUIDED_SOP_RUNTIME.js` — `CbvGuidedSop_buildStepperHtml_` render thêm khối `cbv-sop-current-step` và `cbv-sop-next-step` (có empty state an toàn); fallback `renderGuidedSopPage_` bổ sung marker tối thiểu
- `05_GAS_RUNTIME/998X_MILESTONE_05_GUIDED_SOP_TEST_CONSOLE.js` — `UI_MARKERS_STEPPER` detail: `htmlLen`, `templateId`, `currentStepId`, `nextStepId`, `markerSource: CbvGuidedSop_buildStepperHtml_` (điều kiện pass/fail không đổi)

## Markers added (inside stepper HTML)

- `cbv-sop-current-step` — luôn có; nếu không có title/instruction từ model → copy “Chưa xác định bước hiện tại”
- `cbv-sop-next-step` — luôn có; nếu không có `nextStep` → “Chưa có bước tiếp theo”

Các marker khác (`cbv-sop-stepper`, `cbv-sop-step-card`, …) giữ nguyên cách sinh hiện có.

## Test strictness

- `UI_MARKERS_STEPPER` vẫn **ERROR** nếu thiếu bất kỳ marker nào trong danh sách chuẩn.
- `REPORT_ENVELOPE` không được nới rule — vẫn phụ thuộc run status / envelope validator như M05.

## Regression

Không đổi route, registry, engine heuristic, CTA safety, VI/frozen routes, hay tích hợp cockpit — chỉ mở rộng HTML stepper.

## Expected next Drive prefix

Sau khi chạy lại menu test trên GAS: **`110_MILESTONE_05_GUIDED_SOP_RUNTIME_*`** (seq do thư mục Drive quyết định).

## Tag readiness

**Chưa tag** `milestone-05-guided-sop-runtime` cho đến khi bundle `110_*` được audit **GO** hoặc **GO_WITH_WARNINGS** với `envelopeOk=true`.
