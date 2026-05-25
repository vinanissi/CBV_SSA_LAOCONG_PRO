import type { Env } from '../contracts';
import { resolveUserContext, canViewModule, filterWriteActions } from '../auth/userContext';
import { getPluginsData, PROJECTION_LABEL } from '../adapters/mockData';
import { fetchGasProjection } from '../adapters/gasAdapter';
import { createEnvelope } from '../utils/envelope';
import { forbidden, notFound } from '../utils/errors';

export async function handlePlugins(request: Request, env: Env) {
  const user = resolveUserContext(request);
  if (!canViewModule(user, 'PLUGIN')) {
    return forbidden('Không có quyền xem mô-đun');
  }

  const warnings = [PROJECTION_LABEL];
  const gas = await fetchGasProjection(env, '/plugins');
  if (gas.warning) warnings.push(gas.warning);

  const { plugins, quickActions } = getPluginsData();
  const filteredPlugins = plugins.map((p) => ({
    ...p,
    capabilities: p.capabilities.map((c) => ({
      ...c,
      enabled: c.enabled && (user.permissions.includes(c.permission) || user.permissions.includes('ADMIN_ALL')),
    })),
  }));

  return createEnvelope(
    {
      plugins: filteredPlugins,
      quickActions: filterWriteActions(user, quickActions),
      demoLabel: PROJECTION_LABEL,
    },
    { warnings },
  );
}

export async function handlePluginDetail(request: Request, env: Env, pluginId: string) {
  const envelope = await handlePlugins(request, env);
  if (!envelope.ok || !envelope.data) return envelope;

  const plugin = envelope.data.plugins.find((p) => p.pluginId === pluginId);
  if (!plugin) return notFound('Không tìm thấy mô-đun');

  return createEnvelope(plugin, { warnings: envelope.warnings });
}
