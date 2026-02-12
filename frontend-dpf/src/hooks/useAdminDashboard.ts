import { useEffect, useRef, useState } from "react";
import type { AdminDashboardPayload } from "../types/dashboard";

import dashboardService from "../services/dashboardService";

export function useAdminDashboard() {
  const isMounted = useRef(true);
  const [data, setData] = useState<AdminDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const payload = await dashboardService.getAdminDashboard();
      if (!isMounted.current) return;
      setData(payload);
      if (silent) setError(null);
    } catch (err: any) {
      if (!isMounted.current) return;
      if (!silent) {
         setError(err.message || "Gagal memuat data dashboard admin.");
      }
    } finally {
      if (!isMounted.current) return;
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    void load();

    const intervalId = setInterval(() => {
      void load(true);
    }, 2000);

    return () => {
      isMounted.current = false;
      clearInterval(intervalId);
    };
  }, []);

  return { data, loading, error, reload: () => load() };
}
