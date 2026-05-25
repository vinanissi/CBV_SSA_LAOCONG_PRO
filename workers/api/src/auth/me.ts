import { resolveUserContext, parseRoleHeader } from '../auth/userContext';
import { createEnvelope } from '../utils/envelope';
import { badRequest } from '../utils/errors';

export function handleMe(request: Request) {
  const headerRole = request.headers.get('x-cbv-role')?.trim();
  if (headerRole && !parseRoleHeader(request)) {
    return badRequest('Role không hợp lệ — dùng ADMIN, MANAGER, STAFF, FINANCE, HO_SO, VIEW_ONLY');
  }

  const user = resolveUserContext(request);
  return createEnvelope(user, {
    warnings: ['Auth stub — LOCAL_STUB', 'Write actions locked'],
  });
}
