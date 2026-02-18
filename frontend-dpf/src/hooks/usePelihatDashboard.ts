import { useCallback, useEffect, useRef, useState } from "react";
import type { PelihatDashboardPayload } from "../types/dashboard";
import dashboardService from "../services/dashboardService";

export function usePelihatDashboard() {
  const isMounted = useRef(true);
  const [data, setData] = useState<PelihatDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartRange, setChartRange] = useState<string>("1W");

  const load = useCallback(async (silent = false, range?: string) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const payload = await dashboardService.getPelihatDashboard(range ?? chartRange);
      if (!isMounted.current) return;
      setData(payload);
      if (silent) setError(null);
    } catch (err: any) {
      if (!isMounted.current) return;
      if (!silent) {
        setError(err.message || "Gagal memuat data dashboard pelihat.");
      }
    } finally {
      if (!isMounted.current) return;
      if (!silent) setLoading(false);
    }
  }, [chartRange]);

  const changeRange = useCallback((range: string) => {
    setChartRange(range);
  }, []);

  useEffect(() => {
    isMounted.current = true;
    void load(false, chartRange);

    const intervalId = setInterval(() => {
      void load(true, chartRange);
    }, 15000);

    return () => {
      isMounted.current = false;
      clearInterval(intervalId);
    };
  }, [chartRange]);

  return { data, loading, error, reload: () => load(), chartRange, changeRange };
}
