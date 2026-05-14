# CBV Test Console — Markdown mirror standard — V1

**Phase:** 97.2  
**Authoritative builder:** `CbvTcsArtifactRegistry_buildMarkdownMirror(report, artifactCtx)` in `998M_TEST_ARTIFACT_REGISTRY_RUNTIME.js`  
**Drive MIME:** Markdown files are stored as **`text/plain`** with a `.md` extension (Apps Script compatibility).

## Goals

1. **Human + AI readable** without relying on Drive’s JSON preview.  
2. **Stable section order** so diffs and connectors stay predictable.  
3. **Raw JSON embedded** so the file is self-contained for audit replay.  
4. **Artifact footer** linking back to Drive folder / file ids when `artifactCtx` is supplied.

## Required sections

```markdown
# CBV Test Console Report

## Metadata
- Phase:
- Status:
- Severity:
- CheckedAt:
- RunBy:
- TraceId:
- TestSuite:
- ContractVersion:
- EnvelopeOk:

## Summary

## Checks
- **CODE** — SEVERITY — MESSAGE

## Warnings

## Errors

## Next Step

## Raw JSON

A fenced JSON block containing the full `JSON.stringify(report, null, 2)` payload (same as the `.json` artifact).

## Artifact Registry (optional block)

- FolderId: `...`
- FileId / FileUrl / FileName / ExporterVersion (when known)
- `### Files (this export)` — bullet list of companion artifacts

## Plain text mirror

`CbvTcsArtifactRegistry_buildPlainTextMirror(report)` provides a **`.txt`**-friendly dump (key lines + full JSON) when `txtFallback: true` is passed to `CbvTcsDriveReport_export`.

## Pairing with JSON

Every Test Console Drive export **must** include at least:

- `.json` — `application/json` — canonical machine copy  
- `.md` — `text/plain` — this standard  

Optional:

- `.txt` — `text/plain` — connector / LLM fallback  

## Production readiness

**Not production-ready.** Test documentation / audit helper only.
