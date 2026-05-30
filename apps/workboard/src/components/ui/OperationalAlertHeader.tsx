import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/api/client';
import { isOptionalFeedUnavailable } from '@/shared/utils/apiFeedAvailability';
import {
  buildDegradedOperationalAlertSummary,
  buildOperationalAlertSummary,
} from '@/shared/utils/operationalAlertSummary';
import { OperationalAlertStrip } from '@/components/ui/OperationalAlertStrip';

interface OperationalAlertHeaderProps {
  onCreate: () => void;
  createEnabled?: boolean;
  /** Overdue count from task workspace snapshot — avoids waiting on /api/today for this signal. */
  snapshotOverdueCount?: number;
  /** When false, defer today/coordination feeds so snapshot load gets GAS priority (GS_10B). */
  enableSecondaryFeeds?: boolean;
}

export function OperationalAlertHeader({
  onCreate,
  createEnabled = true,
  snapshotOverdueCount,
  enableSecondaryFeeds = true,
}: OperationalAlertHeaderProps) {
  const [loading, setLoading] = useState(true);
  const [degraded, setDegraded] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | undefined>();
  const [includeUnassigned, setIncludeUnassigned] = useState(true);
  const [input, setInput] = useState({
    overdueCount: snapshotOverdueCount ?? 0,
    missingGplxCount: 0,
    pendingConfirmCount: 0,
    unassignedCount: 0,
  });
  const [reloadKey, setReloadKey] = useState(0);
  const [secondaryLoaded, setSecondaryLoaded] = useState(false);

  useEffect(() => {
    if (snapshotOverdueCount != null && !secondaryLoaded) {
      setInput((prev) => ({ ...prev, overdueCount: snapshotOverdueCount }));
      if (snapshotOverdueCount > 0) setLoading(false);
    }
  }, [snapshotOverdueCount, secondaryLoaded]);

  const loadAlerts = useCallback(() => {
    setLoading(true);
    setDegraded(false);
    setErrorDetail(undefined);
    setIncludeUnassigned(true);

    Promise.all([api.getTodaySummary(), api.getCoordination()])
      .then(([todayRes, coordRes]) => {
        if (!todayRes.ok || !todayRes.data) {
          if (snapshotOverdueCount != null) {
            setInput((prev) => ({
              ...prev,
              overdueCount: snapshotOverdueCount,
            }));
            setSecondaryLoaded(true);
            return;
          }
          const msg = todayRes.errors[0] ?? 'Không tải được dữ liệu hôm nay';
          setDegraded(true);
          setErrorDetail(msg);
          return;
        }

        const today = todayRes.data;
        const missingGplx = today.missingHoSo.filter(
          (h) => h.missingDocuments.includes('GPLX') || h.missingDocuments.includes('Đăng kiểm'),
        ).length;
        const pendingConfirm = today.pendingFinance.filter((f) =>
          f.warnings.some((w) => w.includes('xác nhận') || w.includes('Chờ')),
        ).length;

        const coordAvailable = Boolean(coordRes.ok && coordRes.data);
        const coordDenied = !coordRes.ok && isOptionalFeedUnavailable(coordRes.errors);
        const unassigned = coordAvailable ? coordRes.data!.unassigned.length : 0;

        setIncludeUnassigned(coordAvailable);
        setInput({
          overdueCount: today.overdueTasks.length,
          missingGplxCount: missingGplx,
          pendingConfirmCount: pendingConfirm || today.pendingFinance.length,
          unassignedCount: unassigned,
        });
        setSecondaryLoaded(true);

        if (!coordAvailable && !coordDenied) {
          setIncludeUnassigned(false);
        }
      })
      .catch(() => {
        if (snapshotOverdueCount != null) {
          setInput((prev) => ({ ...prev, overdueCount: snapshotOverdueCount }));
          setSecondaryLoaded(true);
          return;
        }
        setDegraded(true);
        setErrorDetail('Không kết nối được dữ liệu');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [snapshotOverdueCount]);

  useEffect(() => {
    if (!enableSecondaryFeeds) {
      if (snapshotOverdueCount != null) {
        setLoading(false);
      }
      return;
    }
    loadAlerts();
  }, [loadAlerts, reloadKey, enableSecondaryFeeds]);

  const summary = useMemo(() => {
    if (degraded) return buildDegradedOperationalAlertSummary(errorDetail);
    return buildOperationalAlertSummary(input, { includeUnassigned });
  }, [degraded, errorDetail, input, includeUnassigned]);

  return (
    <div className="operational-alert-header">
      <OperationalAlertStrip
        summary={summary}
        loading={loading && snapshotOverdueCount == null}
        onRetry={degraded ? () => setReloadKey((k) => k + 1) : undefined}
      />
      <button
        type="button"
        onClick={onCreate}
        disabled={!createEnabled}
        className="operational-header-primary-action"
      >
        + Tạo việc
      </button>
    </div>
  );
}
