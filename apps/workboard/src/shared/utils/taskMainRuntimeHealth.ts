import type { TaskWorkspaceRuntime } from '@/api/contracts';
import { isRuntimeSlow } from './runtimeTelemetry';

export type TaskMainHealthState = 'connected' | 'slow_live' | 'stale_cache' | 'disconnected' | 'degraded';

export interface TaskMainRuntimeHealth {
  state: TaskMainHealthState;
  /** True only when operator should see stale/degraded UX (not mere slow live fetch). */
  degraded: boolean;
  operatorLabel: string;
  operatorHint: string | null;
  staleMessage: string | null;
  /** Dev-oriented short label for console drawer */
  debugLabel: string;
}

function isStaleCacheWarning(warnings: string[]): boolean {
  return warnings.some(
    (w) =>
      w.includes('gần nhất') ||
      w.includes('quá tải') ||
      w.includes('Không kết nối — đang hiển thị') ||
      w.includes('Không kết nối được dữ liệu'),
  );
}

function isSlowSyncWarning(warnings: string[]): boolean {
  return warnings.some((w) => w.includes('phản hồi chậm') || w.includes('đồng bộ TASK_MAIN'));
}

export function evaluateTaskMainRuntimeHealth(input: {
  connected: boolean;
  error: string | null;
  hasSnapshot: boolean;
  warnings: string[];
  runtime?: TaskWorkspaceRuntime | null;
}): TaskMainRuntimeHealth {
  const { connected, error, hasSnapshot, warnings, runtime } = input;
  const staleWarnings = isStaleCacheWarning(warnings);
  const slow = isRuntimeSlow(runtime);
  const slowWarning = isSlowSyncWarning(warnings);
  if (!connected && !hasSnapshot) {
    return {
      state: 'disconnected',
      degraded: true,
      operatorLabel: 'Chưa kết nối TASK_MAIN',
      operatorHint: 'Kiểm tra Worker và GAS',
      staleMessage: 'Không kết nối được dữ liệu — thử làm mới sau vài giây.',
      debugLabel: 'TASK_MAIN Disconnected',
    };
  }

  if (staleWarnings || (error && hasSnapshot && staleWarnings)) {
    return {
      state: 'stale_cache',
      degraded: true,
      operatorLabel: 'Dữ liệu đang dùng bản lưu tạm',
      operatorHint: error?.trim() || warnings.find((w) => w.includes('gần nhất') || w.includes('quá tải')) || null,
      staleMessage: 'Google Sheet phản hồi chậm — đang hiển thị bản lưu tạm. Bấm làm mới khi mạng ổn định.',
      debugLabel: 'TASK_MAIN Degraded (stale cache)',
    };
  }

  if (slow || slowWarning) {
    const latency = runtime?.workerLatencyMs ?? runtime?.gasDurationMs;
    return {
      state: 'slow_live',
      degraded: false,
      operatorLabel: 'TASK_MAIN Connected',
      operatorHint:
        typeof latency === 'number'
          ? `Phản hồi chậm (${latency}ms) — dữ liệu vừa đồng bộ`
          : 'Phản hồi chậm — dữ liệu vừa đồng bộ',
      staleMessage: null,
      debugLabel: 'TASK_MAIN Connected (slow)',
    };
  }

  if (error && hasSnapshot) {
    return {
      state: 'degraded',
      degraded: true,
      operatorLabel: 'Dữ liệu đang dùng bản lưu tạm',
      operatorHint: error,
      staleMessage: 'Không đồng bộ được bản mới — đang giữ dữ liệu hiện có.',
      debugLabel: 'TASK_MAIN Degraded (partial error)',
    };
  }

  const isReal = runtime?.mode === 'google_sheet_existing_db';
  if (connected && isReal) {
    return {
      state: 'connected',
      degraded: false,
      operatorLabel: 'TASK_MAIN Connected',
      operatorHint: null,
      staleMessage: null,
      debugLabel: 'TASK_MAIN Connected',
    };
  }

  if (connected) {
    return {
      state: 'connected',
      degraded: false,
      operatorLabel: 'Worker OK',
      operatorHint: null,
      staleMessage: null,
      debugLabel: 'Worker OK',
    };
  }

  return {
    state: 'degraded',
    degraded: true,
    operatorLabel: 'TASK_MAIN Degraded',
    operatorHint: null,
    staleMessage: 'Runtime chưa sẵn sàng — thử làm mới.',
    debugLabel: 'TASK_MAIN Degraded',
  };
}
