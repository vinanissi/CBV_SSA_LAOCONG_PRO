import type { Env } from './contracts';
import { route } from './router';
import { handleOptions } from './cors';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return handleOptions(request, env);
    }
    return route(request, env);
  },
};
