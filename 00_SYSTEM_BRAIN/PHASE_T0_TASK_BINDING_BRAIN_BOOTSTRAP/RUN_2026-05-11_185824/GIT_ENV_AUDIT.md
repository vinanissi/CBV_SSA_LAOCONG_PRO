---
doc: GIT_ENV_AUDIT
phase: T0_TASK_BINDING_BRAIN_BOOTSTRAP
purpose: Git hygiene snapshot for phase bootstrap (no push/merge/rebase performed)
doctrine: Append-only; do not paste secrets or live tokens into this repo
generatedAt: 2026-05-11T18:58:24+07:00
---

# GIT_ENV_AUDIT

## Current branch

- **Active branch:** `phase/t0-task-binding-brain-bootstrap` (created locally from previous `HEAD` on `feature/main-control-v2.1`).

## Remote

- **origin (fetch/push):** `https://<REDACTED_CREDENTIALS>@github.com/vinanissi/CBV_SSA_LAOCONG_PRO.git`
- **Sanitized canonical URL (recommended):** `https://github.com/vinanissi/CBV_SSA_LAOCONG_PRO.git`

## Ahead / behind

- **Tracking:** Local `phase/t0-task-binding-brain-bootstrap` was branched at the same commit as `feature/main-control-v2.1`; no upstream set for this new branch yet.
- **vs `origin/feature/main-control-v2.1` at audit time:** `0` ahead / `0` behind (identical tip before branch creation).

## Dirty / untracked (working tree)

- **Modified:** `apps-script/task/.clasp.json.example`
- **Untracked (high level):** `00_SYSTEM_BRAIN/` (partial), new `apps-script/task/src/*OBS*`, `docs/TASK_*.md`, `tools/`, and this RUN output path once written.

## Ignored files (representative)

Git reported ignored paths including (non-exhaustive):

- `.clasprc.json`
- `.idp-environments.json.backup`
- `.project.json`
- `WEBHOOK_URL.txt`
- `apps-script/main-control/.clasp.json`
- `_handoff/CLAUDE_FINANCE_PACK/**` (tier trees)
- `tools/repo-audit/out/`

**Note:** presence of ignored clasp/credential-adjacent files is expected locally; ensure none are committed.

## PAT / credential risk

| Risk | Severity | Notes |
|------|----------|--------|
| **GitHub PAT embedded in `origin` URL** | **CRITICAL** | A `ghp_` style token was visible in `git remote -v` output during audit. This is credential leakage in shell history, tooling logs, and any copy/paste of remotes. |
| **Token in remote URL** | **CRITICAL** | Anyone with read access to machine transcripts or shared terminals can reuse the token until revoked. |

### Recommendations (PAT)

1. **Revoke/rotate** the exposed GitHub token immediately in GitHub Settings → Developer settings → Personal access tokens.
2. Re-add remote without credentials:  
   `git remote set-url origin https://github.com/vinanissi/CBV_SSA_LAOCONG_PRO.git`
3. Use **Git Credential Manager**, **SSH deploy keys**, or **fine-grained PAT** stored outside the URL.
4. Run `git remote -v` after fix and confirm **no** `ghp_`, `github_pat_`, or password substrings appear.

## General risks

- **Large untracked tree:** Uncommitted TASK_OBS and docs increase risk of accidental partial commits; use intentional staging.
- **No upstream on phase branch:** First push must set upstream explicitly when team policy allows (out of scope for this bootstrap).

## Recommendations (hygiene)

- Keep **examples only** (`.clasp.json.example`) in Git; never commit `.clasp.json` with live IDs if policy forbids (this repo already ignores `apps-script/main-control/.clasp.json`).
- Prefer **small commits** per concern (TASK binding vs docs vs tools).

## Actions explicitly not taken (per charter)

- No `git push`, `merge`, `rebase`, or `force-push`.
