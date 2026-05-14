# 108 — Phase 408 — Decision log (append-only)

## D-108-01 — Substring contract for `Hoàn tất`

**Decision:** Treat scanner match as authoritative: any contiguous **`hoàn tất`** (case-insensitive) in M04-scanned HTML is a failure. Fix **runtime copy** in execution/focus/daily footers, not the test.

**Rationale:** Avoids weakening TCS; aligns UX copy with “no complete-from-WebApp” semantics without using the ambiguous substring.

## D-108-02 — Zoned detail in `998V`

**Decision:** Extend `ACTION_STACK_SAFETY` to scan **focus body** in addition to stack + cockpit, and return structured **`scannedZones`** + **`snippetSafe`** for faster Drive audits.

**Rationale:** Matches Phase 408 TASK C; keeps severity rules identical.
