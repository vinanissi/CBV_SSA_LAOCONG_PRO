---
doc: 011_T0_TASK_BINDING_GIT_COMMIT_TAG_PUSH_PREP_PROMPT
purpose: Archived operator prompt for T0 TASK binding / TASK_OBS baseline Git prep
savedAt: 2026-05-11T20:00:00+07:00
---

# Original prompt (verbatim request)

BỐI CẢNH

Repo:
D:\Workspace\projects\CBV_SSA_LAOCONG_PRO

Branch hiện tại:
phase/t0-task-binding-brain-bootstrap

Phase hiện tại:
T0_TASK_BINDING

Mục tiêu:
Chuẩn bị bộ lệnh Git để ghi nhận phần T0 TASK binding / TASK_OBS baseline khi đủ điều kiện.
Không push nếu còn rủi ro secret, runtime drift chưa phân loại, hoặc file production ngoài scope bị stage.

==================================================
YÊU CẦU BẮT BUỘC TRƯỚC KHI THỰC HIỆN
==================================================

1. Hãy lưu chính prompt này vào thư mục:

.\00_SYSTEM_BRAIN\000_PROMPTS\

Tên file bắt đầu bằng số 000–999 theo ngữ cảnh, ví dụ:

011_T0_TASK_BINDING_GIT_COMMIT_TAG_PUSH_PREP_PROMPT.md

2. Khi kết thúc, tạo report mới trong thư mục:

.\00_SYSTEM_BRAIN\000_REPORTS\

Tên file bắt đầu bằng số 000–999 theo ngữ cảnh, ví dụ:

011_T0_TASK_BINDING_GIT_COMMIT_TAG_PUSH_PREP_REPORT.md

3. Nếu hai thư mục trên chưa tồn tại thì tạo mới.

4. Không xóa file.
5. Không rewrite history.
6. Không force push.
7. Không push nếu còn nghi ngờ secret/token/PAT.
8. Không deploy Apps Script.
9. Không tạo `.clasp.json` thật trong repo.
10. Không sửa runtime nghiệp vụ ngoài phạm vi T0 TASK binding.

==================================================
PHẦN A — PRECHECK GIT
==================================================

Chạy và ghi nhận:

git status --short
git branch --show-current
git remote -v
git log --oneline --decorate -n 10
git diff --stat
git diff --name-only
git tag --list "t0-*"

Kiểm tra:
- branch hiện tại có đúng `phase/t0-task-binding-brain-bootstrap` không
- remote origin có sạch không
- có `ghp_` / `github_pat_` / token / secret trong remote không
- có `.clasp.json` thật bị staged không
- có file credential/token/key không
- commit/tag bootstrap trước đã tồn tại chưa

Nếu phát hiện secret:
- DỪNG
- không commit
- không tag
- không push
- ghi FAIL vào report

==================================================
PHẦN B — PHÂN LOẠI FILE THAY ĐỔI
==================================================

Phân loại toàn bộ working tree thành 4 nhóm:

NHÓM 1 — ĐƯỢC PHÉP COMMIT CHO T0 TASK BINDING
- docs / report / prompt liên quan T0
- `apps-script/task/.clasp.json.example`
- file TASK_OBS baseline trong `apps-script/task/src/`
- file test/precheck chỉ phục vụ TASK_OBS
- file checklist / audit / report trong `00_SYSTEM_BRAIN/**`

NHÓM 2 — CẦN REVIEW TRƯỚC KHI COMMIT
- runtime TASK service file
- router / repository / business workflow
- file main-control
- file monolith `05_GAS_RUNTIME`
- file AppSheet spec

NHÓM 3 — KHÔNG ĐƯỢC COMMIT
- `.clasp.json` thật
- secret/token/key
- credential file
- file tạm/cache
- node_modules
- build/dist

NHÓM 4 — CHƯA PHÂN LOẠI
- mọi file còn lại

Tạo report phụ:

.\00_SYSTEM_BRAIN\000_REPORTS\011_T0_TASK_BINDING_CHANGED_FILES_CLASSIFICATION.md

Nội dung gồm:
- file
- trạng thái git
- nhóm
- lý do
- recommended action: STAGE / REVIEW / SKIP / BLOCK

==================================================
PHẦN C — DRY-RUN STAGE
==================================================

Chỉ dry-run các file thuộc Nhóm 1.

Không tự stage file Nhóm 2.

Chạy dry-run dạng:

git add --dry-run <file-or-folder>

Ghi kết quả vào report.

Nếu dry-run kéo theo file ngoài Nhóm 1:
- DỪNG
- ghi warning/blocker

==================================================
PHẦN D — TẠO BỘ LỆNH GIT ĐỀ XUẤT
==================================================

Tạo file:

.\00_SYSTEM_BRAIN\000_REPORTS\011_T0_TASK_BINDING_GIT_COMMANDS.md

Nội dung gồm bộ lệnh đề xuất:

# 1. Kiểm tra trước commit
git status --short
git remote -v
git branch --show-current

# 2. Stage đúng phạm vi T0 TASK binding
# Chỉ stage file đã phân loại Nhóm 1
git add <explicit-file-1>
git add <explicit-file-2>
git add <explicit-file-3>

# 3. Kiểm tra staged files
git diff --cached --name-only
git diff --cached --stat

# 4. Commit theo ngữ cảnh
git commit -m "chore(task): prepare T0 binding and TASK_OBS baseline"

# 5. Tạo tag local theo ngữ cảnh
git tag -a t0-task-binding-v0.1 -m "T0 TASK binding prep and TASK_OBS baseline"

# 6. Push branch sau khi operator xác nhận
git push origin phase/t0-task-binding-brain-bootstrap

# 7. Push tag sau khi operator xác nhận
git push origin t0-task-binding-v0.1

Lưu ý:
- Không tự chạy push nếu chưa được operator xác nhận.
- Không tự chạy tag nếu commit chưa thành công.
- Không push tag nếu branch chưa push ổn.
- Nếu tag `t0-task-binding-v0.1` đã tồn tại, đề xuất `t0-task-binding-v0.2`.

==================================================
PHẦN E — NẾU ĐƯỢC PHÉP COMMIT LOCAL
==================================================

Chỉ commit local nếu đủ điều kiện:

1. Remote sạch.
2. Branch đúng.
3. Không secret.
4. Không `.clasp.json` thật.
5. Staged files chỉ thuộc Nhóm 1.
6. Không có runtime business file chưa review bị stage.

Nếu đủ điều kiện:

Commit message:

chore(task): prepare T0 binding and TASK_OBS baseline

Tạo tag local:

t0-task-binding-v0.1

Tag message:

T0 TASK binding prep and TASK_OBS baseline

KHÔNG push tự động.

Nếu chưa đủ điều kiện:
- Không commit.
- Không tag.
- Ghi rõ blocker.

==================================================
PHẦN F — REPORT CUỐI
==================================================

Tạo report:

.\00_SYSTEM_BRAIN\000_REPORTS\011_T0_TASK_BINDING_GIT_COMMIT_TAG_PUSH_PREP_REPORT.md

Report phải có:

1. checkedAt
2. branch
3. remote status
4. PAT/secret check
5. changed files classification summary
6. files proposed staged
7. files actually staged
8. commit hash nếu đã commit
9. tag nếu đã tạo
10. push status: NOT_PUSHED
11. warnings
12. errors
13. blockers
14. next recommended command

Kết luận report dùng một trong ba trạng thái:

GO
GO_WITH_WARNINGS
FAIL

==================================================
PHẦN G — CẬP NHẬT BRAIN
==================================================

Cập nhật append-only:

.\00_SYSTEM_BRAIN\CBV_AI_WORK_BRAIN\DECISION_LOG.md

Thêm decision:
- T0 TASK binding chỉ được commit file đã phân loại
- Không commit `.clasp.json` thật
- Không push khi chưa operator confirm

Cập nhật:

.\00_SYSTEM_BRAIN\CBV_AI_WORK_BRAIN\RUNTIME_OBSERVATION_LOG.md

Thêm observation:
- TASK_OBS / TASK clasp đang là vùng T0
- mirror drift với 05_GAS_RUNTIME cần theo dõi
- test/schema drift cần xử lý ở phase riêng nếu không thuộc T0

==================================================
ĐIỀU KIỆN DỪNG
==================================================

Dừng ngay nếu:
- phát hiện PAT/token/secret
- branch sai
- `.clasp.json` thật bị staged
- file runtime nghiệp vụ bị stage ngoài yêu cầu
- Nhóm 2 bị tự stage
- git working tree có thay đổi nguy hiểm chưa phân loại

Không deploy.
Không push production.
Không force push.
Không sửa runtime ngoài scope.
