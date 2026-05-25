import { createEnvelope } from './envelope';

export function notFound(message: string, traceId?: string) {
  return createEnvelope(null, { errors: [message], ok: false, status: 'FAIL', traceId });
}

export function forbidden(message: string, traceId?: string) {
  return createEnvelope(null, { errors: [message], ok: false, status: 'FAIL', traceId });
}

export function badRequest(message: string, traceId?: string) {
  return createEnvelope(null, { errors: [message], ok: false, status: 'FAIL', traceId });
}
