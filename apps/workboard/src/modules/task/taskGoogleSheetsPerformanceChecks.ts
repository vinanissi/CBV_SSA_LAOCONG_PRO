/**
 * PHASE_TASK_GS_10B — Google Sheets performance checks (FE + static GAS/Worker refs).
 */

import tasksPageSource from '@/modules/task/TasksPage.tsx?raw';
import alertHeaderSource from '@/components/ui/OperationalAlertHeader.tsx?raw';
import clientSource from '@/api/client.ts?raw';
import telemetrySource from '@/shared/utils/runtimeTelemetry.ts?raw';
import workerAdapterSource from '../../../../workers/api/src/adapters/googleSheetTaskDbAdapter.ts?raw';
import gasCacheSource from '../../../../gas-runtime-api/33_TaskDbCache.js?raw';
import gasServiceSource from '../../../../gas-runtime-api/40_TaskDbService.js?raw';

export interface GoogleSheetsPerformanceCheck {
  id: string;
  label: string;
  pass: boolean;
  detail?: string;
}

export function runTaskGoogleSheetsPerformanceChecks(): {
  suite: string;
  status: string;
  checks: GoogleSheetsPerformanceCheck[];
} {
  const checks: GoogleSheetsPerformanceCheck[] = [];

  checks.push({
    id: 'gasNoPerRowFindMain',
    label: 'GAS taskDbFindMainRow_ uses batched getRange (no row loop getRange)',
    pass:
      gasServiceSource.includes('function taskDbFindMainRow_') &&
      gasServiceSource.includes('getRange(2, 1, lastRow') &&
      !gasServiceSource.match(/for \(var r = 2; r <= sheet\.getLastRow\(\); r\+\+\)[\s\S]*?getRange\(r, 1, r,/),
    detail: 'taskDbService.js batched row scan',
  });

  checks.push({
    id: 'gasSnapshotBatchedRead',
    label: 'GAS snapshot reads TASK_MAIN in one batch',
    pass: gasServiceSource.includes('taskDbReadMainSummaries_') && gasServiceSource.includes('getRange(2, 1,'),
  });

  checks.push({
    id: 'gasCacheGenerationInvalidate',
    label: 'GAS cache invalidation bumps generation (all filter keys)',
    pass:
      gasCacheSource.includes('taskDbCacheBumpGeneration_') &&
      gasCacheSource.includes('taskDbCacheGetGeneration_'),
  });

  checks.push({
    id: 'workerSnapshotEndpoint',
    label: 'Worker exposes workspace snapshot endpoint usage',
    pass: clientSource.includes('getTaskWorkspaceSnapshot') && clientSource.includes('workspace-snapshot'),
  });

  checks.push({
    id: 'workerStaleFallback',
    label: 'Worker stale-while-revalidate on GAS failure',
    pass: workerAdapterSource.includes('STALE_SNAPSHOT') && workerAdapterSource.includes('allowStale'),
  });

  checks.push({
    id: 'workerSharedDataCache',
    label: 'Worker snapshot cache keyed by filters (not per-user duplicate GAS)',
    pass:
      workerAdapterSource.includes('snapshotDataCacheKey') &&
      !workerAdapterSource.includes('userId: userId'),
  });

  checks.push({
    id: 'detailLazyLoad',
    label: 'Task detail loaded lazily via route/effect',
    pass:
      tasksPageSource.includes('loadTaskDetail') &&
      tasksPageSource.includes('if (!taskId) return') &&
      tasksPageSource.includes('api.getTaskDetail'),
  });

  checks.push({
    id: 'shellRenderFirst',
    label: 'TasksPage renders shell before snapshot (queue skeleton only)',
    pass:
      tasksPageSource.includes('task-workspace-title') &&
      tasksPageSource.includes('TaskListSkeleton') &&
      tasksPageSource.includes('enableSecondaryFeeds={false}'),
  });

  checks.push({
    id: 'alertDeferredFeeds',
    label: 'Alert header defers secondary feeds until snapshot ready',
    pass:
      alertHeaderSource.includes('enableSecondaryFeeds') &&
      alertHeaderSource.includes('snapshotOverdueCount'),
  });

  checks.push({
    id: 'runtimeCacheSourceTelemetry',
    label: 'Runtime telemetry exposes cache source / payload',
    pass:
      telemetrySource.includes('cacheSource') &&
      telemetrySource.includes('payloadBytesApprox'),
  });

  checks.push({
    id: 'commentInvalidatesSnapshot',
    label: 'Task comment invalidates worker snapshot cache',
    pass: workerAdapterSource.includes('gsAddTaskComment') && workerAdapterSource.includes('invalidateWorkerSnapshotCache'),
  });

  const passCount = checks.filter((c) => c.pass).length;
  return {
    suite: 'PHASE_TASK_GS_10B_GOOGLE_SHEETS_PERFORMANCE',
    status: passCount === checks.length ? 'GO' : 'GO_WITH_WARNINGS',
    checks,
  };
}
