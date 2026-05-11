---
doc: 012_T0_TASK_BINDING_PUSH_BRANCH_TAG_PROMPT
purpose: Archived operator prompt for pushing T0 branch + tag after clean precheck
savedAt: 2026-05-11T20:45:00+07:00
---

# Original prompt (verbatim request)

BỐI CẢNH

Repo:
D:\Workspace\projects\CBV_SSA_LAOCONG_PRO

Branch hiện tại:
phase/t0-task-binding-brain-bootstrap

Phase đã hoàn thành local:
T0 TASK binding + TASK_OBS baseline prep

Commit local dự kiến:
chore(task): prepare T0 binding and TASK_OBS baseline

Tag local dự kiến:
t0-task-binding-v0.1

Mục tiêu:
Chuẩn bị và thực hiện push branch + tag sau khi precheck sạch.
Không deploy Apps Script.
Không sửa runtime.
Không tạo thêm code production.

==================================================
YÊU CẦU BẮT BUỘC TRƯỚC KHI THỰC HIỆN
==================================================

1. Hãy lưu chính prompt này vào thư mục:

.\00_SYSTEM_BRAIN\000_PROMPTS\

Tên file bắt đầu bằng số 000–999 theo ngữ cảnh, ví dụ:

012_T0_TASK_BINDING_PUSH_BRANCH_TAG_PROMPT.md

2. Khi kết thúc, tạo report mới trong thư mục:

.\00_SYSTEM_BRAIN\000_REPORTS\

Tên file bắt đầu bằng số 000–999 theo ngữ cảnh, ví dụ:

012_T0_TASK_BINDING_PUSH_BRANCH_TAG_REPORT.md

3. Nếu hai thư mục trên chưa tồn tại thì tạo mới.

4. Không xóa file.
5. Không rewrite history.
6. Không force push.
7. Không push nếu còn nghi ngờ secret/token/PAT.
8. Không deploy Apps Script.
9. Không tạo `.clasp.json` thật trong repo.
10. Không sửa runtime nghiệp vụ.
11. Chỉ push branch/tag đã xác định.

==================================================
PHẦN A — PRECHECK TRƯỚC PUSH
==================================================

Chạy và ghi nhận:

git status --short
git branch --show-current
git remote -v
git log --oneline --decorate -n 8
git tag --list "t0-*"
git rev-parse HEAD
git show --name-only --stat --oneline HEAD
git diff --cached --name-only

Kiểm tra:

1. Branch hiện tại phải là:
phase/t0-task-binding-brain-bootstrap

2. Remote phải sạch:
https://github.com/vinanissi/CBV_SSA_LAOCONG_PRO.git

Không được có:
- ghp_
- github_pat_
- user:token@
- password
- secret

3. HEAD phải là commit đúng ngữ cảnh:
chore(task): prepare T0 binding and TASK_OBS baseline

4. Tag local phải tồn tại:
t0-task-binding-v0.1

5. Tag phải point tới HEAD:

git rev-list -n 1 t0-task-binding-v0.1
git rev-parse HEAD

Hai giá trị phải trùng nhau.

6. Không có staged file pending:
git diff --cached --name-only
phải rỗng.

7. Nếu working tree còn untracked/modified:
- chỉ ghi warning,
- không được tự stage,
- không được sửa.

8. Nếu phát hiện `.clasp.json` thật, token, credential file:
- DỪNG,
- không push,
- ghi FAIL.

==================================================
PHẦN B — TẠO FILE COMMAND BUNDLE
==================================================

Tạo file:

.\00_SYSTEM_BRAIN\000_REPORTS\012_T0_TASK_BINDING_PUSH_BRANCH_TAG_COMMANDS.md

Nội dung gồm:

# 1. Kiểm tra remote sạch
git remote -v

# 2. Kiểm tra branch
git branch --show-current

# 3. Kiểm tra HEAD
git log --oneline --decorate -n 3

# 4. Kiểm tra tag point tới HEAD
git rev-list -n 1 t0-task-binding-v0.1
git rev-parse HEAD

# 5. Push branch
git push origin phase/t0-task-binding-brain-bootstrap

# 6. Push tag
git push origin t0-task-binding-v0.1

# 7. Verify remote refs
git ls-remote --heads origin phase/t0-task-binding-brain-bootstrap
git ls-remote --tags origin t0-task-binding-v0.1

==================================================
PHẦN C — THỰC HIỆN PUSH NẾU PRECHECK GO
==================================================

Chỉ thực hiện nếu tất cả điều kiện Phần A đạt.

Lệnh:

git push origin phase/t0-task-binding-brain-bootstrap

Sau khi branch push thành công, tiếp tục:

git push origin t0-task-binding-v0.1

Sau đó verify:

git ls-remote --heads origin phase/t0-task-binding-brain-bootstrap
git ls-remote --tags origin t0-task-binding-v0.1

Nếu push branch fail:
- không push tag,
- ghi FAIL.

Nếu push tag fail:
- ghi GO_WITH_WARNINGS nếu branch đã push thành công,
- ghi rõ lỗi.

==================================================
PHẦN D — REPORT CUỐI
==================================================

Tạo report:

.\00_SYSTEM_BRAIN\000_REPORTS\012_T0_TASK_BINDING_PUSH_BRANCH_TAG_REPORT.md

Report phải có:

1. checkedAt
2. branch
3. remote status
4. PAT/secret check
5. HEAD commit
6. local tag
7. tag points to HEAD: true/false
8. push branch status
9. push tag status
10. remote verify result
11. working tree warning nếu còn file local chưa commit
12. errors
13. next recommended phase

Kết luận report dùng một trong ba trạng thái:

GO
GO_WITH_WARNINGS
FAIL

==================================================
PHẦN E — CẬP NHẬT BRAIN APPEND-ONLY
==================================================

Nếu push thành công, cập nhật append-only:

.\00_SYSTEM_BRAIN\CBV_AI_WORK_BRAIN\DECISION_LOG.md

Thêm decision:
- Branch phase/t0-task-binding-brain-bootstrap và tag t0-task-binding-v0.1 đã được push remote sau precheck sạch.
- Không force push.
- Không deploy Apps Script trong bước này.

Cập nhật:

.\00_SYSTEM_BRAIN\CBV_AI_WORK_BRAIN\RUNTIME_OBSERVATION_LOG.md

Thêm observation:
- T0 TASK binding prep đã có remote checkpoint.
- Bước tiếp theo là TASK_OBS xanh trên staging, không nhảy runtime redesign.

Lưu ý:
- Nếu cập nhật Brain sau push, tạo thêm commit riêng là phase log follow-up, KHÔNG tự push commit này trừ khi operator yêu cầu.

==================================================
PHẦN F — NEXT COMMANDS NẾU CẦN COMMIT REPORT SAU PUSH
==================================================

Nếu có file report/prompt/brain mới sau khi push, chỉ tạo bộ lệnh đề xuất, không tự chạy:

git add 00_SYSTEM_BRAIN/000_PROMPTS/012_T0_TASK_BINDING_PUSH_BRANCH_TAG_PROMPT.md
git add 00_SYSTEM_BRAIN/000_REPORTS/012_T0_TASK_BINDING_PUSH_BRANCH_TAG_COMMANDS.md
git add 00_SYSTEM_BRAIN/000_REPORTS/012_T0_TASK_BINDING_PUSH_BRANCH_TAG_REPORT.md
git add 00_SYSTEM_BRAIN/CBV_AI_WORK_BRAIN/DECISION_LOG.md
git add 00_SYSTEM_BRAIN/CBV_AI_WORK_BRAIN/RUNTIME_OBSERVATION_LOG.md

git commit -m "docs(git): record T0 binding branch and tag push"
git tag -a t0-task-binding-push-record-v0.1 -m "Record T0 TASK binding branch/tag push"

Sau đó chờ operator xác nhận push follow-up commit.

==================================================
ĐIỀU KIỆN DỪNG
==================================================

Dừng ngay nếu:
- branch sai
- remote có token
- HEAD không đúng commit T0
- tag không point tới HEAD
- có staged files pending
- phát hiện `.clasp.json` thật hoặc credential
- push branch fail

Không deploy.
Không force push.
Không sửa runtime.
Không tự stage file ngoài report/prompt/brain.
