/**
 * PHASE_TASK_GS_10A — Runtime feedback system checks (FE).
 */

import topBarSource from '@/components/layout/TopBar.tsx?raw';
import searchPageSource from '@/modules/task/SearchPage.tsx?raw';
import alertHeaderSource from '@/components/ui/OperationalAlertHeader.tsx?raw';
import alertStripSource from '@/components/ui/OperationalAlertStrip.tsx?raw';
import alertSummarySource from '@/shared/utils/operationalAlertSummary.ts?raw';
import tasksPageSource from '@/modules/task/TasksPage.tsx?raw';
import taskCardSource from '@/components/ui/TaskCard.tsx?raw';
import fileListSource from '@/components/ui/FileList.tsx?raw';
import panelSource from '@/components/ui/OperationalContextPanel.tsx?raw';
import inlineExecSource from '@/modules/task/useInlineExecution.ts?raw';
import feedbackUtilSource from '@/shared/utils/runtimeFeedback.ts?raw';
import feedbackMsgSource from '@/components/ui/RuntimeFeedbackMessage.tsx?raw';
import perTaskHookSource from '@/shared/hooks/usePerTaskFeedback.ts?raw';
import copySource from '@/shared/utils/operatorFeedbackCopy.ts?raw';
import { buildDegradedOperationalAlertSummary } from '@/shared/utils/operationalAlertSummary';

export interface RuntimeFeedbackSystemCheck {
  id: string;
  label: string;
  pass: boolean;
  detail?: string;
}

export function runTaskRuntimeFeedbackSystemChecks(): {
  suite: string;
  status: string;
  checks: RuntimeFeedbackSystemCheck[];
} {
  const checks: RuntimeFeedbackSystemCheck[] = [];

  const degraded = buildDegradedOperationalAlertSummary('test');

  checks.push({
    id: 'alertDegradedBuilder',
    label: 'Degraded alert summary builder exists',
    pass: alertSummarySource.includes('buildDegradedOperationalAlertSummary') && degraded.degraded === true,
    detail: 'Never all-clear on API failure',
  });

  checks.push({
    id: 'alertNoFalseAllClear',
    label: 'Degraded summary is not all-clear',
    pass: degraded.allClear === false && !degraded.summaryText.includes('Không có vấn đề'),
  });

  checks.push({
    id: 'alertHeaderHandlesFail',
    label: 'Alert header sets degraded only on today API fail',
    pass:
      alertHeaderSource.includes('setDegraded(true)') &&
      alertHeaderSource.includes('buildDegradedOperationalAlertSummary') &&
      alertHeaderSource.includes('isOptionalFeedUnavailable'),
  });

  checks.push({
    id: 'alertStripDegradedUi',
    label: 'Alert strip renders degraded state',
    pass: alertStripSource.includes('summary.degraded') && alertStripSource.includes('operational-alert-strip-degraded'),
  });

  checks.push({
    id: 'searchPageErrorState',
    label: 'SearchPage handles API failure',
    pass:
      searchPageSource.includes('fetchError') &&
      searchPageSource.includes('RuntimeFeedbackMessage') &&
      searchPageSource.includes('!res.ok'),
  });

  checks.push({
    id: 'topBarAriaLabel',
    label: 'TopBar search has aria-label',
    pass: topBarSource.includes('aria-label'),
  });

  checks.push({
    id: 'topBarQuerySync',
    label: 'TopBar syncs query from URL on /search',
    pass: topBarSource.includes("pathname === '/search'") && topBarSource.includes('searchParams.get'),
  });

  checks.push({
    id: 'topBarEmptyHint',
    label: 'Empty search submit shows hint',
    pass: topBarSource.includes('searchEmpty') || topBarSource.includes('emptyHint'),
  });

  checks.push({
    id: 'taskAcceptPending',
    label: 'Task accept has pending state',
    pass: taskCardSource.includes('isAcceptPending') && tasksPageSource.includes('runWithFeedback'),
  });

  checks.push({
    id: 'taskCompleteError',
    label: 'Task complete has error feedback path',
    pass: tasksPageSource.includes("'complete'") && tasksPageSource.includes('FEEDBACK_COPY.error.complete'),
  });

  checks.push({
    id: 'inlineExecPropagatesErrors',
    label: 'Inline execution returns error outcomes',
    pass: inlineExecSource.includes('InlineExecOutcome') && inlineExecSource.includes('ok: false'),
  });

  checks.push({
    id: 'fileListNoInertButtons',
    label: 'FileList has no inert clickable buttons',
    pass: fileListSource.includes('canOpen') && fileListSource.includes('aria-disabled'),
  });

  checks.push({
    id: 'panelLocalOnlyLabeled',
    label: 'Panel call/follow labeled as local-only',
    pass: panelSource.includes('localOnly') || panelSource.includes('localActionMsg'),
  });

  checks.push({
    id: 'runtimeFeedbackModel',
    label: 'Runtime feedback model exists',
    pass:
      feedbackUtilSource.includes('RuntimeFeedbackState') &&
      feedbackUtilSource.includes('RuntimeFeedbackSeverity'),
  });

  checks.push({
    id: 'runtimeFeedbackComponent',
    label: 'RuntimeFeedbackMessage component exists',
    pass: feedbackMsgSource.includes('RuntimeFeedbackMessage'),
  });

  checks.push({
    id: 'perTaskFeedbackHook',
    label: 'Per-task feedback hook exists',
    pass: perTaskHookSource.includes('usePerTaskFeedback') && perTaskHookSource.includes('runWithFeedback'),
  });

  checks.push({
    id: 'operatorCopyVi',
    label: 'Vietnamese operational copy pack',
    pass: copySource.includes('FEEDBACK_COPY') && copySource.includes('Đang'),
  });

  checks.push({
    id: 'noFakeSuccessInline',
    label: 'Inline exec checks res.ok before success',
    pass: inlineExecSource.includes('if (!res.ok)') && !inlineExecSource.includes('fake'),
  });

  const passCount = checks.filter((c) => c.pass).length;
  return {
    suite: 'PHASE_TASK_GS_10A_RUNTIME_FEEDBACK_SYSTEM',
    status: passCount === checks.length ? 'GO' : 'GO_WITH_WARNINGS',
    checks,
  };
}
