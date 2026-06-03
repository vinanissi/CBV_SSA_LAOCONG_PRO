/**
 * PHASE_LINK_02 — deferred checklist step resolution for slow/retry runtime.
 */

import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { checklistItemDomId } from '@/modules/task/inbox/dossier/dossierCrossFocusNavigation';
import {
  clearChecklistStepFromSearchParams,
  parseChecklistStepIdFromSearchParams,
} from './stepDeepLink';
import { consumeChecklistStepDeepLink } from './stepDeepLinkNavigation';

type DeepLinkResolutionState =
  | 'IDLE'
  | 'PENDING_TASK'
  | 'PENDING_CHECKLIST_DATA'
  | 'PENDING_DOM'
  | 'RESOLVING'
  | 'RESOLVED'
  | 'FAILED_TARGET_VERIFY'
  | 'FAILED_TIMEOUT'
  | 'FAILED_MISSING_STEP';

export interface UseChecklistStepDeepLinkConsumerOptions {
  taskId: string;
  checklistItemIds: string[];
  taskReady: boolean;
  checklistLoading: boolean;
  checklistReady: boolean;
  onResolutionMessage?: (message: string | null) => void;
}

const RESOLVE_ATTEMPT_DELAYS_MS = [120, 260, 420, 700, 1000];
const RESOLUTION_TIMEOUT_MS = 5200;
const HIGHLIGHT_CLASS = 'work-inbox-smart-checklist__row--cross-focus';

type LinkTracePayload = {
  traceId: string;
  timestamp: string;
  route: string;
  taskId: string;
  urlStepId: string | null;
  pendingStepId: string | null;
  resolutionState: DeepLinkResolutionState;
  checklistLoaded: boolean;
  checklistRowCount: number;
  domAnchorCount: number;
  targetSelector: string;
  targetFound: boolean;
  targetDataChecklistStepId: string | null;
  targetIdMatchesUrlStepId: boolean;
  targetBoundingClientRect: { top: number; bottom: number; height: number } | null;
  viewportHeight: number;
  isTargetInViewport: boolean;
  highlightApplied: boolean;
  highlightTargetStepId: string | null;
  urlCleanupAttempted: boolean;
  urlCleanupAllowed: boolean;
  urlCleanupCompleted: boolean;
  failureReason: string | null;
  retryAttempt: number;
};

type TraceHostWindow = Window & {
  __CBV_LINK_TRACE_ENABLED__?: boolean;
  __CBV_LINK_TRACE_EVENTS__?: LinkTracePayload[];
};

function isLinkTraceEnabled(): boolean {
  const byEnv = String(import.meta.env.VITE_LINK_DEEP_LINK_TRACE_ENABLED ?? '').toLowerCase() === 'true';
  if (byEnv) return true;
  if (typeof window === 'undefined') return false;
  return Boolean((window as TraceHostWindow).__CBV_LINK_TRACE_ENABLED__);
}

function emitLinkTrace(event: LinkTracePayload): void {
  if (!isLinkTraceEnabled()) return;
  if (typeof window === 'undefined') return;
  const host = window as TraceHostWindow;
  if (!host.__CBV_LINK_TRACE_EVENTS__) host.__CBV_LINK_TRACE_EVENTS__ = [];
  host.__CBV_LINK_TRACE_EVENTS__.push(event);
  if (host.__CBV_LINK_TRACE_EVENTS__.length > 120) host.__CBV_LINK_TRACE_EVENTS__.shift();
  console.info('[CBV_LINK_TRACE]', event);
}

function getChecklistStepElement(stepId: string): HTMLElement | null {
  const safeStepId =
    typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
      ? CSS.escape(stepId)
      : stepId.replace(/["\\]/g, '\\$&');
  const byDataStep = document.querySelector<HTMLElement>(`[data-checklist-step-id="${safeStepId}"]`);
  if (byDataStep) return byDataStep;
  return document.getElementById(checklistItemDomId(stepId));
}

function isElementNearViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight || 0;
  return rect.bottom >= -120 && rect.top <= vh + 120;
}

function verifyStepAnchorResolved(stepId: string): boolean {
  const el = getChecklistStepElement(stepId);
  if (!el) return false;
  if (el.getAttribute('data-checklist-step-id') !== stepId) return false;
  const hasHighlight =
    el.classList.contains(HIGHLIGHT_CLASS) || el.getAttribute('data-deep-link-target') === 'true';
  if (!hasHighlight) return false;
  return isElementNearViewport(el);
}

function clearStepQuery(
  searchParams: URLSearchParams,
  locationPathname: string,
  navigate: ReturnType<typeof useNavigate>,
): void {
  const nextSearch = clearChecklistStepFromSearchParams(searchParams);
  const next = nextSearch.toString();
  if (next !== searchParams.toString()) {
    navigate({ pathname: locationPathname, search: next ? `?${next}` : '' }, { replace: true });
  }
}

export function useChecklistStepDeepLinkConsumer(
  options: UseChecklistStepDeepLinkConsumerOptions,
): void {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const consumedRef = useRef<string | null>(null);
  const stateRef = useRef<DeepLinkResolutionState>('IDLE');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef<number>(0);
  const attemptRef = useRef<number>(0);
  const currentKeyRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  useEffect(() => {
    const stepId = parseChecklistStepIdFromSearchParams(searchParams);
    if (!stepId) {
      stateRef.current = 'IDLE';
      currentKeyRef.current = null;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      return;
    }

    const consumeKey = `${options.taskId.trim()}:${stepId}`;
    if (consumedRef.current === consumeKey) return;

    if (currentKeyRef.current !== consumeKey) {
      currentKeyRef.current = consumeKey;
      startedAtRef.current = Date.now();
      attemptRef.current = 0;
      stateRef.current = 'IDLE';
      options.onResolutionMessage?.('Đang chờ mở đúng bước từ deep link...');
    }

    const runAttempt = () => {
      const elapsed = Date.now() - startedAtRef.current;
      const known = new Set(options.checklistItemIds.map((id) => id.trim()));
      const hasStepInData = known.has(stepId);
      const targetSelector = `[data-checklist-step-id="${stepId}"]`;
      const domAnchors = document.querySelectorAll('[data-checklist-step-id]');
      const targetEl = getChecklistStepElement(stepId);
      const hasDomTarget = Boolean(targetEl);
      const targetRect = targetEl?.getBoundingClientRect();
      const targetDataStepId = targetEl?.getAttribute('data-checklist-step-id') ?? null;
      const targetMatches = targetDataStepId === stepId;
      const targetInViewport = targetEl ? isElementNearViewport(targetEl) : false;
      const highlightApplied =
        Boolean(targetEl?.classList.contains(HIGHLIGHT_CLASS)) ||
        targetEl?.getAttribute('data-deep-link-target') === 'true';

      let urlCleanupAttempted = false;
      let urlCleanupAllowed = false;
      let urlCleanupCompleted = false;
      let failureReason: string | null = null;

      if (!options.taskReady) {
        stateRef.current = 'PENDING_TASK';
        failureReason = 'task_not_ready';
      } else if (options.checklistLoading || !options.checklistReady) {
        stateRef.current = 'PENDING_CHECKLIST_DATA';
        failureReason = 'checklist_not_ready';
      } else if (!hasStepInData) {
        if (elapsed < RESOLUTION_TIMEOUT_MS) {
          stateRef.current = 'PENDING_CHECKLIST_DATA';
          failureReason = 'step_not_in_data_yet';
        } else {
          stateRef.current = 'FAILED_MISSING_STEP';
          options.onResolutionMessage?.('Không tìm thấy bước từ deep link.');
          urlCleanupAttempted = true;
          urlCleanupAllowed = true;
          clearStepQuery(searchParams, location.pathname, navigate);
          urlCleanupCompleted = true;
          consumedRef.current = consumeKey;
          emitLinkTrace({
            traceId: consumeKey,
            timestamp: new Date().toISOString(),
            route: location.pathname,
            taskId: options.taskId,
            urlStepId: stepId,
            pendingStepId: stepId,
            resolutionState: stateRef.current,
            checklistLoaded: options.checklistReady,
            checklistRowCount: options.checklistItemIds.length,
            domAnchorCount: domAnchors.length,
            targetSelector,
            targetFound: hasDomTarget,
            targetDataChecklistStepId: targetDataStepId,
            targetIdMatchesUrlStepId: targetMatches,
            targetBoundingClientRect: targetRect
              ? { top: targetRect.top, bottom: targetRect.bottom, height: targetRect.height }
              : null,
            viewportHeight: window.innerHeight || 0,
            isTargetInViewport: targetInViewport,
            highlightApplied,
            highlightTargetStepId: highlightApplied ? targetDataStepId : null,
            urlCleanupAttempted,
            urlCleanupAllowed,
            urlCleanupCompleted,
            failureReason: 'missing_step',
            retryAttempt: attemptRef.current,
          });
          return;
        }
      } else if (!hasDomTarget) {
        stateRef.current = 'PENDING_DOM';
        failureReason = 'dom_anchor_not_ready';
      } else {
        stateRef.current = 'RESOLVING';
        const resolution = consumeChecklistStepDeepLink(options.taskId, stepId, options.checklistItemIds);
        if (resolution.focused && verifyStepAnchorResolved(stepId)) {
          stateRef.current = 'RESOLVED';
          urlCleanupAttempted = true;
          urlCleanupAllowed = true;
          clearStepQuery(searchParams, location.pathname, navigate);
          urlCleanupCompleted = true;
          consumedRef.current = consumeKey;
          options.onResolutionMessage?.('Đã chuyển tới bước từ deep link.');
          emitLinkTrace({
            traceId: consumeKey,
            timestamp: new Date().toISOString(),
            route: location.pathname,
            taskId: options.taskId,
            urlStepId: stepId,
            pendingStepId: stepId,
            resolutionState: stateRef.current,
            checklistLoaded: options.checklistReady,
            checklistRowCount: options.checklistItemIds.length,
            domAnchorCount: domAnchors.length,
            targetSelector,
            targetFound: hasDomTarget,
            targetDataChecklistStepId: targetDataStepId,
            targetIdMatchesUrlStepId: targetMatches,
            targetBoundingClientRect: targetRect
              ? { top: targetRect.top, bottom: targetRect.bottom, height: targetRect.height }
              : null,
            viewportHeight: window.innerHeight || 0,
            isTargetInViewport: targetInViewport,
            highlightApplied,
            highlightTargetStepId: highlightApplied ? targetDataStepId : null,
            urlCleanupAttempted,
            urlCleanupAllowed,
            urlCleanupCompleted,
            failureReason: null,
            retryAttempt: attemptRef.current,
          });
          return;
        }
        if (resolution.focused) {
          stateRef.current = 'FAILED_TARGET_VERIFY';
          options.onResolutionMessage?.('Đang kiểm tra vị trí bước deep link...');
          failureReason = 'target_verify_failed';
        }
      }

      if (Date.now() - startedAtRef.current >= RESOLUTION_TIMEOUT_MS) {
        stateRef.current = 'FAILED_TIMEOUT';
        options.onResolutionMessage?.('Deep link quá hạn chờ dữ liệu, vui lòng thử lại.');
        urlCleanupAttempted = true;
        urlCleanupAllowed = true;
        clearStepQuery(searchParams, location.pathname, navigate);
        urlCleanupCompleted = true;
        consumedRef.current = consumeKey;
        emitLinkTrace({
          traceId: consumeKey,
          timestamp: new Date().toISOString(),
          route: location.pathname,
          taskId: options.taskId,
          urlStepId: stepId,
          pendingStepId: stepId,
          resolutionState: stateRef.current,
          checklistLoaded: options.checklistReady,
          checklistRowCount: options.checklistItemIds.length,
          domAnchorCount: domAnchors.length,
          targetSelector,
          targetFound: hasDomTarget,
          targetDataChecklistStepId: targetDataStepId,
          targetIdMatchesUrlStepId: targetMatches,
          targetBoundingClientRect: targetRect
            ? { top: targetRect.top, bottom: targetRect.bottom, height: targetRect.height }
            : null,
          viewportHeight: window.innerHeight || 0,
          isTargetInViewport: targetInViewport,
          highlightApplied,
          highlightTargetStepId: highlightApplied ? targetDataStepId : null,
          urlCleanupAttempted,
          urlCleanupAllowed,
          urlCleanupCompleted,
          failureReason: 'timeout',
          retryAttempt: attemptRef.current,
        });
        return;
      }

      emitLinkTrace({
        traceId: consumeKey,
        timestamp: new Date().toISOString(),
        route: location.pathname,
        taskId: options.taskId,
        urlStepId: stepId,
        pendingStepId: stepId,
        resolutionState: stateRef.current,
        checklistLoaded: options.checklistReady,
        checklistRowCount: options.checklistItemIds.length,
        domAnchorCount: domAnchors.length,
        targetSelector,
        targetFound: hasDomTarget,
        targetDataChecklistStepId: targetDataStepId,
        targetIdMatchesUrlStepId: targetMatches,
        targetBoundingClientRect: targetRect
          ? { top: targetRect.top, bottom: targetRect.bottom, height: targetRect.height }
          : null,
        viewportHeight: window.innerHeight || 0,
        isTargetInViewport: targetInViewport,
        highlightApplied,
        highlightTargetStepId: highlightApplied ? targetDataStepId : null,
        urlCleanupAttempted,
        urlCleanupAllowed,
        urlCleanupCompleted,
        failureReason,
        retryAttempt: attemptRef.current,
      });

      const delay =
        RESOLVE_ATTEMPT_DELAYS_MS[Math.min(attemptRef.current, RESOLVE_ATTEMPT_DELAYS_MS.length - 1)];
      attemptRef.current += 1;
      timerRef.current = setTimeout(runAttempt, delay);
    };

    if (timerRef.current) clearTimeout(timerRef.current);
    runAttempt();
  }, [
    options.taskId,
    options.checklistItemIds,
    options.taskReady,
    options.checklistLoading,
    options.checklistReady,
    options.onResolutionMessage,
    searchParams,
    navigate,
    location.pathname,
  ]);
}
