/** Safe decode for route path segments (preserves original when already decoded). */

export function decodeRouteTaskId(raw: string): { taskId: string; encodedTaskId: string } {
  const encodedTaskId = raw;
  let taskId = raw;
  try {
    taskId = decodeURIComponent(raw.replace(/\+/g, '%20'));
  } catch {
    taskId = raw;
  }
  return { taskId: taskId.trim(), encodedTaskId };
}

/** CBV Google Sheet task ids: TK_20260408_82436267, TASK-xxx, etc. */
export function validateTaskId(taskId: string): string | null {
  const id = String(taskId ?? '').trim();
  if (!id) return 'taskId là bắt buộc';
  if (id.length > 128) return 'taskId quá dài';
  if (!/^[A-Za-z0-9_\-]+$/.test(id)) return `taskId chứa ký tự không hợp lệ: ${id}`;
  return null;
}

export interface RouteValidationLog {
  traceId: string;
  route: string;
  taskId: string;
  encodedTaskId: string;
  actor?: string;
  validationError?: string;
}

export function logRouteValidationError(ctx: RouteValidationLog): void {
  console.warn('[CBV RouteValidation]', JSON.stringify(ctx));
}
