# PHASE_WORK_INBOX_NETWORK_HYGIENE_AUDIT — Prompt (append-only)

**Phase:** PHASE_WORK_INBOX_NETWORK_HYGIENE_AUDIT  
**Mission:** Identify and reduce unnecessary Work Inbox V3 network chatter before pilot. **No new features.**

## Constraints (CBV-RCLA v1.1)

- WorkInboxRuntimeContextProvider / Runtime Context Registry
- No FE → GAS bypass
- No new runtime context outside registry

## Scope

Audit and fix duplicate/unnecessary requests for: task detail, operational bundle, workspace snapshot, static runtime (`/status`, `/modules`, `/write-capability`), search open, navigation, tab switch, stale abort, cache TTL.

## Targets

| Scenario | Target |
|----------|--------|
| Stable task open | ≤1 detail, ≤1 operational, no repeat until user action |
| Action | 1 record-action; 0–1 deferred operational; no full snapshot |
| Tab switch | 0 network if bundle loaded |
| Search open | ≤1 detail + ≤1 operational; no snapshot reload |

## Deliverables

- Network trace envelope (`workInboxNetworkTrace.ts`)
- Dedupe + TTL loaders (detail, operational, snapshot, static runtime)
- `runWorkInboxNetworkHygieneAuditChecks()` — 16 checks
- Report / handoff / test evidence under `00_SYSTEM_BRAIN/`

## Do NOT

- Redesign UI, change workflow/schema, bypass RCLA, fake cache showing wrong task
