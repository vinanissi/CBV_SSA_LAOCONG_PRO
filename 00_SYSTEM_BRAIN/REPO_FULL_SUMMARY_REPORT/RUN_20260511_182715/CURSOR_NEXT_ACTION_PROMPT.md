# CURSOR_NEXT_ACTION_PROMPT — Phase kế tiếp (không nhảy phase)

Sao chép toàn bộ khối dưới đây vào Cursor làm **user prompt** cho phiên triển khai kế tiếp.

---

## Prompt (bắt đầu copy)

```
BỐI CẢNH
Repo: D:\Workspace\projects\CBV_SSA_LAOCONG_PRO
Đã có báo cáo tổng hợp: 00_SYSTEM_BRAIN/REPO_FULL_SUMMARY_REPORT/RUN_20260511_182715/

MỤC TIÊU PHIÊN NÀY (Phase T0 — KHÔNG nhảy phase)
Chỉ triển khai bước “Deployment Binding + TASK_OBS baseline xanh” đúng như docs/TASK_MODULE_CURRENT_STATE_AND_ROADMAP.md (Option A). Không redesign toàn hệ. Không sửa logic nghiệp vụ TASK (create/update workflow) trừ khi phát hiện lỗi compile/runtime tối thiểu để chạy được.

RÀNG BUỘC BẮT BUỘC
1) Add-only: không xóa file; không overwrite file cũ; không di chuyển file hiện hữu.
2) Không phá production: không đổi schema TASK_MAIN đã chốt; không gỡ SHARED_WITH/IS_PRIVATE; không destructive migration.
3) Mọi file mới / báo cáo chạy tay của phase này chỉ ghi vào thư mục output riêng:
   D:\Workspace\projects\CBV_SSA_LAOCONG_PRO\00_SYSTEM_BRAIN\REPO_FULL_SUMMARY_REPORT\RUN_<timestamp>_T0_TASK\
4) Test Console: không trộn menu nghiệp vụ — nếu cần menu mới, tạo top-level "🧪 CBV Test Console" chỉ delegate sang các hàm test đã có (TaskObs_* / MC_Obs_* tùy project đích) hoặc chỉ cập nhật tài liệu hướng dẫn chạy test trong output folder nếu chưa được phép sửa GAS.
5) Report: mỗi lần chạy self-test TASK_OBS (hoặc runner tương đương), ghi thêm file markdown append-style trong thư mục RUN output (hoặc JSON nhỏ) có: checkedAt, runBy, traceId (UUID), status GO|GO_WITH_WARNINGS|FAIL, testSuite, summary, checks[], warnings[], errors[], nextStep, contractVersion="0.1", envelopeOk true|false.
6) AI handoff: trong output RUN, tạo AI_HANDOFF_T0_TASK.md ngắn (đã chạy gì, kết quả, file nào đụng, rủi ro).

VIỆC CẦN LÀM CỤ THỂ
A) Đọc docs/TASK_T0_DEPLOYMENT_BINDING_AUDIT.md (nếu có), docs/TASK_MODULE_CURRENT_STATE_AND_ROADMAP.md, apps-script/task/.clasp.json.example và filePushOrder.
B) Tạo hướng dẫn bind .clasp.json thật (KHÔNG commit secret): checklist spreadsheetId/scriptId/staging vs prod.
C) Liệt kê dependency TASK → core (cbvResponse, _sheet, …) và xác nhận file nào phải cùng project khi push (chỉ phân tích + bảng trong output).
D) Nếu được phép sửa code trong apps-script/task: chỉ sửa tối thiểu để TASK_OBS bootstrap chạy trên spreadsheet test; mọi diff phải có lý do 1 dòng trong REPORT.
E) Sinh CURSOR_T0_CHECKLIST.md trong RUN output: nghiệm thu P0 (push xanh), P1 (OBS sheet tồn tại), P2 (smoke menu chạy không exception).

NGỪNG KHI
- Đủ checklist nghiệm thu trong output, hoặc
- Bị chặn vì thiếu scriptId/spreadsheet từ operator — ghi FAIL rõ lý do trong report JSON.
```

---

## Ghi chú cho người điều phối

- Prompt này **cố ý** không yêu cầu FINANCE/INVOICE/WebApp redesign.
- Nếu policy nội bộ **cấm** sửa bất kỳ file `apps-script/**` trong phiên tiếp theo, giới hạn prompt ở bước (A)(B)(C) + report trong RUN folder chỉ đọc.
