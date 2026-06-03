#!/usr/bin/env node
/**
 * PHASE_WORKER_ENVELOPE — static contract checks for Worker ApiEnvelope + performanceTrace.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const repoRoot = join(import.meta.dirname, '..', '..');
const checks = [];
const warnings = [];

function push(id, pass, detail) {
  checks.push({ id, pass, detail });
}

function read(rel) {
  return readFileSync(join(repoRoot, rel), 'utf8');
}

const envelope = read('workers/api/src/utils/envelope.ts');
const router = read('workers/api/src/router.ts');
const perf = read('workers/api/src/modules/workInboxPerformanceTrace.ts');

push('ENVELOPE_WIRE_TYPE', envelope.includes('export type ApiEnvelopeWire'));
push('ENVELOPE_WITH_PERF_TYPE', envelope.includes('export type ApiEnvelopeWithPerf'));
push('RESOLVE_HTTP_STATUS', envelope.includes('export function resolveHttpStatus'));
push('CORS_JSON_RESPONSE', envelope.includes('export function corsJsonResponse'));
push('ATTACH_PERFORMANCE_TRACE', envelope.includes('export function attachPerformanceTrace'));
push('JSON_ENVELOPE_ACCEPTS_WIRE', /jsonEnvelope<T>\(envelope: ApiEnvelopeWire<T>/.test(envelope));

push('ROUTER_NO_LEGACY_CAST', !router.includes("as import('./contracts').ApiEnvelope"));
push('ROUTER_USES_CORS_JSON', router.includes('corsJsonResponse(request, env, envelope'));
push('ROUTER_TYPED_ENVELOPE', router.includes('let envelope: ApiEnvelopeWire<unknown>'));

push('PERF_USES_ATTACH', /envelopeWithRoutePerf[\s\S]*attachPerformanceTrace\(envelope/.test(perf));
push('PERF_REEXPORT_TYPE', perf.includes("export type { ApiEnvelopeWithPerf }"));

const failed = checks.filter((c) => !c.pass);
const result = failed.length === 0 ? (warnings.length ? 'GO_WITH_WARNINGS' : 'GO') : 'NO_GO';

console.log(JSON.stringify({ suite: 'PHASE_WORKER_ENVELOPE_CONTRACT', result, checks, warnings }, null, 2));
process.exit(failed.length ? 1 : 0);
