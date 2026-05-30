/**
 * Frontend render performance instrumentation (PHASE_TASK_GS_10C).
 * Gated by VITE_CBV_RENDER_PERF_DEBUG=true — zero console/log overhead when off.
 */

import { useEffect, useRef, type DependencyList } from 'react';
import type { RuntimeDiagnosticRow } from '@/shared/utils/runtimeTelemetry';

export interface RenderPerfEntry {
  traceId: string;
  label: string;
  startedAt: number;
  endedAt?: number;
  durationMs?: number;
  renderCount?: number;
  rows?: number;
  taskCount?: number;
  selectedTaskId?: string | null;
  source?: string;
}

export interface RenderPerfSummary {
  traceId: string;
  shellMountMs?: number;
  tasksPageFirstRenderMs?: number;
  snapshotToQueueMs?: number;
  taskGroupingMs?: number;
  taskCardRenders: number;
  operationalContextPanelRenders: number;
  tasksPageRenders: number;
  lastUpdatedAt: number;
}

const ENABLED = import.meta.env.VITE_CBV_RENDER_PERF_DEBUG === 'true';

const entries: RenderPerfEntry[] = [];
const renderCounts = new Map<string, number>();
const pendingStarts = new Map<string, RenderPerfEntry>();
let latestTraceId = '';
let summary: RenderPerfSummary = {
  traceId: '',
  taskCardRenders: 0,
  operationalContextPanelRenders: 0,
  tasksPageRenders: 0,
  lastUpdatedAt: 0,
};

const MAX_ENTRIES = 200;

export function isRenderPerfEnabled(): boolean {
  return ENABLED;
}

function pushEntry(entry: RenderPerfEntry): void {
  entries.push(entry);
  if (entries.length > MAX_ENTRIES) entries.shift();
  latestTraceId = entry.traceId;
  summary = { ...summary, traceId: entry.traceId, lastUpdatedAt: Date.now() };
}

function logEntry(entry: RenderPerfEntry): void {
  if (!ENABLED) return;
  // eslint-disable-next-line no-console
  console.debug('[CBV renderPerf]', entry);
}

export function markRenderStart(label: string, meta: Partial<RenderPerfEntry> = {}): string {
  if (!ENABLED) return '';
  const traceId = `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const entry: RenderPerfEntry = { traceId, label, startedAt: performance.now(), ...meta };
  pendingStarts.set(label, entry);
  return traceId;
}

export function markRenderEnd(label: string, traceId?: string, meta: Partial<RenderPerfEntry> = {}): RenderPerfEntry | null {
  if (!ENABLED) return null;
  const pending = pendingStarts.get(label);
  const endedAt = performance.now();
  const entry: RenderPerfEntry = {
    traceId: traceId || pending?.traceId || `${label}-${Date.now()}`,
    label,
    startedAt: pending?.startedAt ?? endedAt,
    endedAt,
    durationMs: pending ? endedAt - pending.startedAt : 0,
    ...pending,
    ...meta,
  };
  pendingStarts.delete(label);
  pushEntry(entry);
  logEntry(entry);

  if (label === 'app-shell-mount') summary = { ...summary, shellMountMs: entry.durationMs, traceId: entry.traceId };
  if (label === 'tasks-page-first-render') summary = { ...summary, tasksPageFirstRenderMs: entry.durationMs, traceId: entry.traceId };
  if (label === 'snapshot-to-queue') summary = { ...summary, snapshotToQueueMs: entry.durationMs, traceId: entry.traceId };
  if (label === 'taskGrouping') summary = { ...summary, taskGroupingMs: entry.durationMs, traceId: entry.traceId };

  return entry;
}

export function measureRender<T>(label: string, fn: () => T, meta: Partial<RenderPerfEntry> = {}): T {
  if (!ENABLED) return fn();
  markRenderStart(label, meta);
  try {
    return fn();
  } finally {
    markRenderEnd(label, undefined, meta);
  }
}

export function incrementRenderCount(label: string): number {
  const next = (renderCounts.get(label) ?? 0) + 1;
  renderCounts.set(label, next);
  if (label === 'TaskCard') summary = { ...summary, taskCardRenders: next };
  if (label === 'OperationalContextPanel') summary = { ...summary, operationalContextPanelRenders: next };
  if (label === 'TasksPage') summary = { ...summary, tasksPageRenders: next };
  return next;
}

export function getRenderCount(label: string): number {
  return renderCounts.get(label) ?? 0;
}

/** Hook: count renders for a component label (no-op when perf debug off). */
export function useRenderCount(label: string, enabled = ENABLED): void {
  if (enabled) incrementRenderCount(label);
}

/** Hook: mark when dependency list changes (no-op when perf debug off). */
export function usePerfMark(label: string, deps: DependencyList): void {
  const firstRef = useRef(true);
  useEffect(() => {
    if (!ENABLED) return;
    if (firstRef.current) {
      firstRef.current = false;
      return;
    }
    markRenderStart(`${label}:deps-changed`);
    markRenderEnd(`${label}:deps-changed`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function getLatestTraceId(): string {
  return latestTraceId;
}

export function getRenderPerfEntries(): readonly RenderPerfEntry[] {
  return entries;
}

export function getRenderPerfSummary(): RenderPerfSummary {
  return { ...summary, traceId: summary.traceId || latestTraceId };
}

export function getFrontendPerfDiagnostics(): RuntimeDiagnosticRow[] {
  const s = getRenderPerfSummary();
  const rows: RuntimeDiagnosticRow[] = [];

  if (s.shellMountMs != null) rows.push({ label: 'FE shell mount', value: `${Math.round(s.shellMountMs)}ms` });
  if (s.tasksPageFirstRenderMs != null) rows.push({ label: 'TasksPage 1st render', value: `${Math.round(s.tasksPageFirstRenderMs)}ms` });
  if (s.snapshotToQueueMs != null) rows.push({ label: 'Snapshot → queue', value: `${Math.round(s.snapshotToQueueMs)}ms` });
  if (s.taskGroupingMs != null) rows.push({ label: 'Task grouping', value: `${Math.round(s.taskGroupingMs)}ms` });
  if (s.taskCardRenders > 0) rows.push({ label: 'TaskCard renders', value: String(s.taskCardRenders) });
  if (s.tasksPageRenders > 0) rows.push({ label: 'TasksPage renders', value: String(s.tasksPageRenders) });
  if (s.operationalContextPanelRenders > 0) {
    rows.push({ label: 'Context panel renders', value: String(s.operationalContextPanelRenders) });
  }
  if (s.traceId) rows.push({ label: 'Last traceId', value: s.traceId.slice(0, 24) });

  return rows;
}
