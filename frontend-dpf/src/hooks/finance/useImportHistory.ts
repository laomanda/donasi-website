import { useCallback, useEffect, useRef, useState } from "react";
import financeService from "@/services/financeService";
import { extractFinanceErrorMessage } from "@/utils/financeUtils";
import type { ImportHistoryDetail, ImportHistoryItem } from "@/types/finance";

const historyCache = { data: null as ImportHistoryItem[] | null, fetchedAt: 0 };
const detailCache = new Map<number, { data: ImportHistoryDetail; fetchedAt: number }>();
const HISTORY_TTL = 45_000;
const DETAIL_TTL = 90_000;

export function useImportHistory() {
  const [history, setHistory] = useState<ImportHistoryItem[]>(historyCache.data ?? []);
  const [loading, setLoading] = useState(!historyCache.data);
  const [error, setError] = useState<string | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [batchDetail, setBatchDetail] = useState<ImportHistoryDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const inFlightDetail = useRef(new Map<number, Promise<ImportHistoryDetail>>());

  const refresh = useCallback(async (force = true) => {
    if (!force && historyCache.data && Date.now() - historyCache.fetchedAt < HISTORY_TTL) {
      setHistory(historyCache.data);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await financeService.getImportHistory();
      const list = Array.isArray(response) ? response : response.data;
      historyCache.data = list ?? [];
      historyCache.fetchedAt = Date.now();
      setHistory(historyCache.data);
    } catch (err) {
      setError(extractFinanceErrorMessage(err, "Gagal memuat riwayat impor data."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(false); }, [refresh]);

  const openDetail = useCallback(async (batchId: number) => {
    setSelectedBatchId(batchId);
    const cached = detailCache.get(batchId);
    if (cached && Date.now() - cached.fetchedAt < DETAIL_TTL) {
      setBatchDetail(cached.data);
      return;
    }
    setLoadingDetail(true);
    setDetailError(null);
    let request = inFlightDetail.current.get(batchId);
    if (!request) {
      request = financeService.getImportHistoryDetail(batchId);
      inFlightDetail.current.set(batchId, request);
    }
    try {
      const detail = await request;
      detailCache.set(batchId, { data: detail, fetchedAt: Date.now() });
      setBatchDetail(detail);
    } catch (err) {
      setDetailError(extractFinanceErrorMessage(err, "Gagal memuat detail batch impor."));
    } finally {
      inFlightDetail.current.delete(batchId);
      setLoadingDetail(false);
    }
  }, []);

  const closeDetail = useCallback(() => { setSelectedBatchId(null); setBatchDetail(null); setDetailError(null); }, []);
  return { history, loading, error, refresh, selectedBatchId, batchDetail, loadingDetail, detailError, openDetail, closeDetail };
}
