import type { Env, ModuleOpenLogBody, ModuleRegistryEntry, ModuleRuntimeStatus, UserContext } from '../contracts';
import { resolveUserContext, hasPermission } from '../auth/userContext';
import { MODULE_REGISTRY } from './moduleRegistryData';
import { createEnvelope } from '../utils/envelope';
import { forbidden, notFound } from '../utils/errors';
import { isTaskDbRuntimeMode } from './taskGsDb';
import { PROJECTION_LABEL } from '../adapters/mockData';

function canAccessModule(user: UserContext, mod: ModuleRegistryEntry): boolean {
  if (!mod.isEnabled) return false;
  if (user.permissions.includes('ADMIN_ALL')) return true;
  if (mod.permissionRequired && !hasPermission(user, mod.permissionRequired)) return false;
  if (mod.roleRequired.length > 0 && !mod.roleRequired.includes(user.role)) return false;
  return true;
}

function filterModulesForUser(user: UserContext): ModuleRegistryEntry[] {
  return MODULE_REGISTRY.filter((mod) => canAccessModule(user, mod)).sort((a, b) => a.sortOrder - b.sortOrder);
}

function resolveModuleUrls(mod: ModuleRegistryEntry, env: Env): ModuleRegistryEntry {
  const appsheetTask = env.CBV_APPSHEET_TASK_URL?.trim() ?? '';
  const appsheetHoso = env.CBV_APPSHEET_HOSO_URL?.trim() ?? '';
  const appsheetFinance = env.CBV_APPSHEET_FINANCE_URL?.trim() ?? '';
  const nocodbUrl = env.CBV_NOCODB_URL?.trim() ?? '';
  const taskSheetUrl = env.CBV_TASK_SHEET_ID
    ? `https://docs.google.com/spreadsheets/d/${env.CBV_TASK_SHEET_ID}`
    : '';

  const copy = { ...mod };
  if (mod.moduleId === 'TASK_APPSHEET' && appsheetTask) {
    copy.primaryUrl = appsheetTask;
    copy.isEnabled = true;
    copy.status = 'ACTIVE';
  }
  if (mod.moduleId === 'TASK' && appsheetTask) copy.mobileUrl = appsheetTask;
  if (mod.moduleId === 'HO_SO_APPSHEET' && appsheetHoso) copy.primaryUrl = appsheetHoso;
  if (mod.moduleId === 'FINANCE' && appsheetFinance) copy.mobileUrl = appsheetFinance;
  if (mod.moduleId === 'OBSERVATION' && nocodbUrl) copy.mobileUrl = nocodbUrl;
  if (mod.moduleId === 'TASK' && taskSheetUrl) copy.adminUrl = taskSheetUrl;
  return copy;
}

export async function handleModulesList(request: Request, env: Env) {
  const user = resolveUserContext(request);
  const modules = filterModulesForUser(user).map((m) => resolveModuleUrls(m, env));
  return createEnvelope({ modules, demoLabel: PROJECTION_LABEL });
}

export async function handleModuleDetail(request: Request, env: Env, moduleId: string) {
  const user = resolveUserContext(request);
  const raw = MODULE_REGISTRY.find((m) => m.moduleId === moduleId);
  if (!raw) return notFound('Không tìm thấy mô-đun');
  if (!canAccessModule(user, raw)) return forbidden('Không có quyền mở mô-đun này');
  return createEnvelope(resolveModuleUrls(raw, env));
}

export async function handleModulesStatus(_request: Request, env: Env) {
  const taskConnected = isTaskDbRuntimeMode(env) && Boolean(env.GAS_TASK_API_URL?.trim());
  const statuses: ModuleRuntimeStatus[] = [
    {
      moduleId: 'TASK',
      connected: taskConnected,
      statusLabel: taskConnected ? 'Connected' : 'Degraded',
      degraded: !taskConnected,
      message: taskConnected ? 'TASK_MAIN runtime' : 'Chưa cấu hình GAS runtime',
    },
    {
      moduleId: 'TASK_APPSHEET',
      connected: Boolean(env.CBV_APPSHEET_TASK_URL?.trim()),
      statusLabel: env.CBV_APPSHEET_TASK_URL?.trim() ? 'AppSheet Online' : 'Chưa cấu hình URL',
      degraded: !env.CBV_APPSHEET_TASK_URL?.trim(),
    },
    {
      moduleId: 'HO_SO',
      connected: true,
      statusLabel: 'React OK',
      degraded: false,
    },
    {
      moduleId: 'FINANCE',
      connected: true,
      statusLabel: env.CBV_APPSHEET_FINANCE_URL ? 'AppSheet Online' : 'React OK',
      degraded: false,
    },
    {
      moduleId: 'OBSERVATION',
      connected: true,
      statusLabel: env.CBV_NOCODB_URL ? 'NocoDB OK' : 'Internal OK',
      degraded: false,
    },
    {
      moduleId: 'DOCUMENT',
      connected: true,
      statusLabel: 'Drive Connected',
      degraded: false,
    },
  ];

  return createEnvelope({
    statuses,
    degraded: statuses.some((s) => s.degraded),
    checkedAt: new Date().toISOString(),
  });
}

export async function handleModuleOpenLog(request: Request, _env: Env) {
  const user = resolveUserContext(request);
  let body: ModuleOpenLogBody;
  try {
    body = (await request.json()) as ModuleOpenLogBody;
  } catch {
    return createEnvelope(null, { errors: ['Body JSON không hợp lệ'], ok: false, status: 'FAIL' });
  }
  if (!body.moduleId?.trim()) {
    return createEnvelope(null, { errors: ['Thiếu moduleId'], ok: false, status: 'FAIL' });
  }
  return createEnvelope({
    logged: true,
    moduleId: body.moduleId,
    userId: user.userId,
    at: new Date().toISOString(),
  });
}
