# PHASE: CBV Operational Engineering Runtime — Test Console Runtime V2

Archived operator prompt (saved non-destructively). See implementation under `apps-script/production-core/src/` and bound copies under `apps-script/main-control/src/` (318_* prefix).

---

Bạn là CBV System Architect.

PHASE: CBV Operational Engineering Runtime — Test Console Runtime V2

Nhiệm vụ:
Refactor toàn bộ luồng TEST trong repo thành Test Console Runtime V2 chuẩn production-safe.

Repo:
D:\Workspace\projects\CBV_SSA_LAOCONG_PRO

Yêu cầu bắt buộc trước khi làm:
1. Đọc repo hiện tại, đặc biệt các file TEST_CONSOLE, TEST_REPORT, AI_HANDOFF, runtime verification.
2. Lưu prompt này vào:
   00_SYSTEM_BRAIN/000_PROMPTS
   Tên file có prefix tăng dần 000-999, theo ngữ cảnh:
   xxx_PHASE_TEST_CONSOLE_RUNTIME_V2_PROMPT_yyyyMMdd_HHmmss.md
3. Không overwrite, không xoá file cũ, không destructive.

Mục tiêu:
Chuẩn hóa toàn bộ test flow thành:

TEST
→ VERIFY
→ BUILD REPORT
→ SAVE REPORT SHEET
→ EXPORT REPORT FILE
→ BUILD AI HANDOFF
→ REVIEW
→ NEXT DECISION

Tất cả chạy dưới menu riêng:

🧪 CBV Test Console

Tuyệt đối không trộn test menu với business menu.

==================================================
I. TEST CONTRACT BẮT BUỘC
==================================================

Mọi report phải theo envelope:

{
  ok,
  phase,
  status,
  checkedAt,
  runBy,
  traceId,
  testSuite,
  summary,
  checks,
  warnings,
  errors,
  nextStep,
  severity,
  reportText,
  reportJson,
  contractVersion,
  envelopeOk
}

Check item:

{
  code,
  ok,
  severity,
  message,
  detail
}

severity:
OK, WARNING, ERROR, CRITICAL

status:
GO, GO_WITH_WARNINGS, FAIL

==================================================
II. DRIVE REPORT EXPORT
==================================================

Folder report cố định:

Folder ID:
1dSQIAwbg-m20oHXh8RCVYS6NvTuQ05Bc

Nếu Script Properties chưa có:
CBV_TEST_CONSOLE_REPORT_FOLDER_ID

thì tự set bằng ID trên.

Không tạo folder mới nếu folder này dùng được.

==================================================
III. FILE PREFIX SYSTEM
==================================================

Report export ra Drive phải là file .md, prefix tăng dần:

000
001
002
...
999

Format:

000_CONTEXT_REPORT_yyyyMMdd_HHmmss.md

Yêu cầu:
- Không overwrite
- Scan folder để tìm prefix lớn nhất
- Prefix tiếp theo = max + 1
- Nếu vượt 999 thì throw:
  CBV_TEST_REPORT_PREFIX_EXHAUSTED

==================================================
IV. FILES CẦN TẠO / REFACTOR
==================================================

Trong:

apps-script/production-core/src/

Tạo hoặc refactor:

1. CBV_TEST_CONSOLE_RUNTIME.js
2. CBV_TEST_CONSOLE_REPORT_CONTRACT.js
3. CBV_TEST_CONSOLE_DRIVE_EXPORTER.js
4. CBV_TEST_CONSOLE_AI_HANDOFF.js
5. CBV_TEST_CONSOLE_REPORT_DIALOG.html
6. CBV_TEST_CONSOLE_AI_HANDOFF_DIALOG.html
7. CBV_TEST_CONSOLE_MENU.js
8. CBV_TEST_CONSOLE_RUNTIME_SELFTEST.js
9. CBV_TEST_CONSOLE_REPORT_SHEET.js
10. CBV_TEST_CONSOLE_TRACE_UTILS.js

==================================================
V. HÀM BẮT BUỘC
==================================================

Phải có tối thiểu các hàm:

CBV_TestConsole_runTestSuite_(suiteCode)
CBV_TestConsole_buildReportEnvelope_(ctx)
CBV_TestConsole_appendReportSheet_(report)
CBV_TestConsole_exportReportToDrive_(report)
CBV_TestConsole_buildAiHandoffPrompt_(report)
CBV_TestConsole_showReportDialog_(report)
CBV_TestConsole_showAiHandoffDialog_(prompt)
CBV_TestConsole_getNextReportPrefix_(folder)
CBV_TestConsole_buildReportFileName_(context)
CBV_TestConsole_DriveExporter_selfTest()
CBV_TestConsole_Runtime_selfTest()

==================================================
VI. REPORT FILE TEMPLATE
==================================================

Export file .md theo mẫu:

# CBV TEST CONSOLE REPORT

## Metadata

- Phase:
- Status:
- Severity:
- CheckedAt:
- RunBy:
- TraceId:
- TestSuite:

## Summary

...

## Checks

- [OK] CODE — message
- [WARNING] CODE — message
- [ERROR] CODE — message

## Warnings

...

## Errors

...

## Next Step

...

## Raw JSON

```json
...
```
