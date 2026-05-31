/**
 * PHASE_UI_CBV_WORK_INBOX_V3_OPERATIONAL_RUNTIME — static checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const readLocal = (rel: string) => readFileSync(join(__dir, rel), 'utf8');
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');
const readRepo = (rel: string) => readFileSync(join(repoRoot, rel), 'utf8');

const gasService = readRepo('gas-runtime-api/46_WorkInboxOperationalService.js');
const gasConfig = readRepo('gas-runtime-api/04_WorkInboxOperationalConfig.js');
const executor = readLocal('../actionRuntime/workInboxActionExecutor.ts');
const registry = readLocal('../../../../runtime/rcla/workInboxRuntimeContextRegistry.tsx');
const host = readLocal('../actionRuntime/WorkInboxFocusActionHost.tsx');
const tabs = readLocal('../focusRuntime/RightContextTabs.tsx');
const preview = readLocal('../focusRuntime/FocusPreviewCards.tsx');
const header = readLocal('../focusRuntime/FocusHeader.tsx');
const perms = readLocal('workInboxOperationalPermissions.ts');
const router = readRepo('workers/api/src/router.ts');
const wiOpModule = readRepo('workers/api/src/modules/workInboxOperational.ts');

export function runWorkInboxOperationalRuntimeChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; label: string; pass: boolean }[];
} {
  const checks = [
    {
      id: 'SERVER_AUDIT_APPEND',
      label: 'Server audit append (GAS)',
      pass: gasService.includes('wiOpAppendActionAudit_') && gasService.includes('ACTION_AUDIT_LOG'),
    },
    {
      id: 'TIMELINE_ENTITY_APPEND',
      label: 'Timeline entity append',
      pass: gasService.includes('wiOpAppendTimeline_') && gasService.includes('TASK_TIMELINE'),
    },
    {
      id: 'TIMELINE_TAB_RUNTIME_SOURCE',
      label: 'Timeline tab reads runtime bundle',
      pass: tabs.includes('operationalBundle?.timeline') && !tabs.includes('Chưa có nhật ký TASK_UPDATE_LOG'),
    },
    {
      id: 'APPOINTMENT_CREATE',
      label: 'Appointment create entity',
      pass: gasService.includes('wiOpCreateAppointment_') && wiOpModule.includes('handleWorkInboxOperationalWrite'),
    },
    {
      id: 'APPOINTMENT_PREVIEW',
      label: 'Appointment preview card',
      pass: preview.includes('AppointmentPreviewCard'),
    },
    {
      id: 'SOP_REGISTRY_LOOKUP',
      label: 'SOP registry lookup',
      pass: gasConfig.includes('SOP_REGISTRY') && gasService.includes('wiOpLookupSop_'),
    },
    {
      id: 'FORM_TEMPLATE_LOOKUP',
      label: 'Form template registry',
      pass: gasConfig.includes('FORM_TEMPLATE_REGISTRY') && gasService.includes('wiOpListFormTemplates_'),
    },
    {
      id: 'DOCUMENT_RUNTIME',
      label: 'Document runtime',
      pass: gasService.includes('wiOpAddDocument_') && gasService.includes('TASK_DOCUMENTS'),
    },
    {
      id: 'DOCUMENT_PREVIEW',
      label: 'Document preview from bundle',
      pass: preview.includes('operationalBundle?.documents'),
    },
    {
      id: 'NOTE_RUNTIME',
      label: 'Note runtime save',
      pass: gasService.includes('wiOpSaveNote_') && tabs.includes('Lưu ghi chú'),
    },
    {
      id: 'NOTE_APPEND',
      label: 'Note append via API',
      pass: router.includes('|note|') && wiOpModule.includes('gsWiOpSaveNote'),
    },
    {
      id: 'PERMISSION_MATRIX',
      label: 'Permission matrix defined',
      pass: perms.includes('ADMIN') && perms.includes('VIEWER'),
    },
    {
      id: 'ACTION_PERMISSION_ENFORCED',
      label: 'Executor permission enforced',
      pass: executor.includes('assertPermission') && executor.includes('appendServerActionAudit'),
    },
    {
      id: 'FOCUS_PROGRESS_RUNTIME',
      label: 'Focus progress runtime',
      pass: header.includes('progressSubLabel') && header.includes('progressPercent'),
    },
    {
      id: 'OPERATIONAL_PREVIEW_CARDS',
      label: 'Operational preview cards (5 timeline)',
      pass: preview.includes('TIMELINE_PREVIEW_LIMIT = 5'),
    },
    {
      id: 'RCLA_CONTEXT_PROVIDER',
      label: 'RCLA context provider',
      pass: registry.includes('operationalBundle') && host.includes('useWorkInboxOperationalBundle'),
    },
    {
      id: 'RCLA_RUNTIME_REGISTRY',
      label: 'RCLA runtime registry',
      pass: registry.includes('buildWorkInboxOpPermissions'),
    },
    {
      id: 'NO_LAYOUT_REGRESSION',
      label: 'No layout shell regression',
      pass: host.includes('WorkInboxFocusRuntime') && !host.includes('work-inbox-layout-redesign'),
    },
    {
      id: 'NO_DEAD_ACTION',
      label: 'Operational actions wired',
      pass: executor.includes('appendOperationalTimeline') && tabs.includes('onQuickGuide'),
    },
  ];

  const fail = checks.filter((c) => !c.pass).length;
  return {
    suite: 'PHASE_UI_CBV_WORK_INBOX_V3_OPERATIONAL_RUNTIME',
    status: fail > 0 ? 'FAIL' : 'GO',
    checks,
  };
}
