import type { Env } from '../contracts';
import { resolveUserContext, hasPermission } from '../auth/userContext';
import { searchMock, PROJECTION_LABEL } from '../adapters/mockData';
import { fetchGasProjection } from '../adapters/gasAdapter';
import { createEnvelope } from '../utils/envelope';
import { forbidden, badRequest } from '../utils/errors';

export async function handleSearch(request: Request, env: Env, query: string) {
  const user = resolveUserContext(request);
  if (!hasPermission(user, 'SEARCH')) {
    return forbidden('Không có quyền tìm kiếm');
  }

  if (!query.trim()) {
    return badRequest('Thiếu tham số q');
  }

  const warnings = [PROJECTION_LABEL];
  const gas = await fetchGasProjection(env, `/search?q=${encodeURIComponent(query)}`);
  if (gas.warning) warnings.push(gas.warning);

  return createEnvelope(
    {
      query,
      results: searchMock(query, user),
      demoLabel: PROJECTION_LABEL,
    },
    { warnings },
  );
}
