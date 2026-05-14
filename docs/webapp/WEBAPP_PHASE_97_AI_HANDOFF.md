# Phase 97 — AI handoff prompt (sau Staff Trial)

Sao chép khối dưới vào ChatGPT / Cursor sau khi đã có **status trial**, **tóm tắt feedback**, và (tuỳ chọn) JSON **Staff Trial Health Check** từ Test Console.  
Hoặc chạy `CbvWebAppStaffTrial_buildHandoffPrompt({ ... })` trong Apps Script và điền các field tùy chọn.

---

## Prompt (English — recommended for AI tools)

```
You are assisting with a pilot WebApp staff trial for repo CBV_SSA_LAOCONG_PRO.

Repo: https://github.com/vinanissi/CBV_SSA_LAOCONG_PRO
Branch: phase/from-v2.4.1-TASK-FIN
Phase: PHASE_97_STAFF_TRIAL_FEEDBACK_CAPTURE

Context:
- WebApp is READ-FIRST only. No business writeback from WebApp.
- Routes are frozen (Phase 94): /workspace, /home-alert/my-queue, /home-alert/sla, /home-alert/timeline, /home-alert/kanban, /runtime/health, /reports, /admin/reference.
- Phase 96.1: in-app links must use canonical https://script.google.com/macros/s/.../exec?route=... (no googleusercontent navigation for operational routes).
- Phase 97: feedback rows live in Google Sheet tab CBV_WEBAPP_UAT_FEEDBACK (append-only). Do not suggest deleting rows.

Fill in the bracketed sections from the human:

Trial status (GO | GO_WITH_WARNINGS | NO_GO): [ ]
Staff Trial Test Console status (GO | GO_WITH_WARNINGS | FAIL): [ ]
Summary of feedback (counts by SEVERITY / FEEDBACK_TYPE): [ ]
CRITICAL / HIGH issue titles + FEEDBACK_ID: [ ]

Rules you MUST follow:
- Do NOT claim production readiness or production certification.
- Do NOT propose auto assign, auto resolve, auto escalate, AppSheet Bot, or WebApp mutation.
- If the last Staff Trial Health Check was FAIL: do NOT recommend a phase jump or large redesign — list concrete fixes in Phase 97 scope first.
- Do NOT rename or add WebApp routes without an explicit new freeze decision.

Output:
1) Short verdict aligned with trial status.
2) Top 5 follow-ups (bullet list).
3) One paragraph "proposed next step" for engineering (no scope creep).
```

---

## Quy tắc (tiếng Việt — tóm tắt)

- Không redesign toàn bộ nếu **FAIL**; xử lý đúng hạng mục Phase 97 trước.
- Không nhảy phase khi CBV_TCS_V1 còn **FAIL** (theo chuẩn test console).
- Luôn ghi nhớ: pilot tier, không chứng nhận production.
