# HANDOFF — PHASE_WORK_INBOX_SEARCH_RUNTIME

## Verify

1. `/inbox` → Ctrl+K → search panel.
2. Type `TK_202604` → results from current queue.
3. Enter → task opens in focus (no full workspace reload).
4. Focus header: Jump `80` + Go.
5. Recent searches after open.

```powershell
cd apps/workboard
npx tsx -e "import { runWorkInboxSearchRuntimeChecks } from './src/modules/task/inbox/search/workInboxSearchRuntimeChecks.ts'; console.log(runWorkInboxSearchRuntimeChecks());"
npm run build
```

Report: `00_SYSTEM_BRAIN/000_REPORTS/PHASE_WORK_INBOX_SEARCH_RUNTIME_REPORT.md`
