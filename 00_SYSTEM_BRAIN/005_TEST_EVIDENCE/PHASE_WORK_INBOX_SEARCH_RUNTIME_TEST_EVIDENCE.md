# TEST EVIDENCE — PHASE_WORK_INBOX_SEARCH_RUNTIME

```powershell
cd apps/workboard
npx tsx -e "import { runWorkInboxSearchRuntimeChecks } from './src/modules/task/inbox/search/workInboxSearchRuntimeChecks.ts'; const r = runWorkInboxSearchRuntimeChecks(); console.log(r.status, r.checks.filter(c=>!c.pass));"
npm run build
```

| Result | Detail |
|--------|--------|
| Static | GO 22/22 |
| Build | PASS |

Manual scenarios: report § manual in PHASE_WORK_INBOX_SEARCH_RUNTIME_REPORT.md.
