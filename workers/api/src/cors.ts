import { getEnv } from './env';

const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, x-cbv-role',
  'Access-Control-Max-Age': '86400',
};

export function corsHeaders(request: Request, env: { CBV_ALLOWED_ORIGINS?: string }): HeadersInit {
  const { allowedOrigins } = getEnv(env);
  const origin = request.headers.get('Origin') ?? '';
  const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0] ?? 'http://localhost:5173';

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
