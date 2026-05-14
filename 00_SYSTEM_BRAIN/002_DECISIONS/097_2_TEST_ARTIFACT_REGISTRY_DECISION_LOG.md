# Decision log — Phase 97.2 — Test artifact registry & Markdown mirror

**Date:** 2026-05-14  
**Branch:** `phase/from-v2.4.1-TASK-FIN`  
**Phase:** `PHASE_97_2_TEST_ARTIFACT_REGISTRY_MARKDOWN_MIRROR`  
**Status:** ACCEPTED (pilot / audit tier).

## Decision

1. **Minimum export bundle** for Test Console reports to Drive: **`.json` + `.md`** always; optional **`.txt`** when `txtFallback === true`.
2. **Registry sheet** `CBV_TEST_ARTIFACT_REGISTRY` records **one append-only row per file** written by `CbvTcsDriveReport_export`, linked by `TRACE_ID` / `PHASE`.
3. **Markdown mirror** is generated via `CbvTcsArtifactRegistry_buildMarkdownMirror` when `998M` is loaded; includes **Raw JSON** fence and **Artifact Registry** footer.
4. **Registry write failures** must **not** fail the Drive export; they add **`ARTIFACT_REGISTRY_WRITE_FAILED`** warnings only.
5. **No destructive Drive APIs** (`setTrashed`, `delete`, folder clear) in Phase 97.2 deliverables.

## Consequences

- AI / connectors can read `.md` / `.txt` without JSON MIME dependency.
- Audit queries can start from `TRACE_ID` in the registry sheet, then open Drive URLs.

## Not in scope

- Mutating or deleting historical registry rows.
- Production certification or business-table writes.
