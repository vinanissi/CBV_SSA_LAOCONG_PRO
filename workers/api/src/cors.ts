import { getEnv } from './env';

function isLocalDevOrigin(origin: string): boolean {
  if (!origin) return false;
  try {
    const u = new URL(origin);
    return (
      (u.hostname === 'localhost' || u.hostname === '127.0.0.1') &&
      (u.protocol === 'http:' || u.protocol === 'https:')
    );
  } catch {
    return false;
  }
}

const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Accept, Authorization, x-cbv-role, x-cbv-session, X-CBV-Trace-Id, x-cbv-trace-id',
  'Access-Control-Expose-Headers': 'X-CBV-Trace-Id, x-cbv-trace-id',
  'Access-Control-Max-Age': '86400',
};

export function corsHeaders(request: Request, env: { CBV_ALLOWED_ORIGINS?: string }): HeadersInit {
  const { allowedOrigins } = getEnv(env);
  const origin = request.headers.get('Origin') ?? '';
  const allowOrigin = allowedOrigins.includes(origin)
    ? origin
    : isLocalDevOrigin(origin)
      ? origin
      : (allowedOrigins[0] ?? 'http://localhost:5173');

  return {
    ...CORS_HEADERS,
    'Access-Control-Allow-Origin': allowOrigin,
  };
}

export function withCors(response: Response, request: Request, env: { CBV_ALLOWED_ORIGINS?: string }): Response {
  const headers = new Headers(response.headers);
  const cors = corsHeaders(request, env);
  Object.entries(cors).forEach(([k, v]) => headers.set(k, v));
  return new Response(response.body, { status: response.status, headers });
}

export function handleOptions(request: Request, env: { CBV_ALLOWED_ORIGINS?: string }): Response {
  return new Response(null, { status: 204, headers: corsHeaders(request, env) });
}
