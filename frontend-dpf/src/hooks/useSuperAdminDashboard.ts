import { useEffect, useRef, useState } from "react";
import type { SuperAdminDashboardPayload } from "../types/dashboard";
import dashboardService from "../services/dashboardService";

export function useSuperAdminDashboard() {
  const [data, setData] = useState<SuperAdminDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await dashboardService.getSuperAdminDashboard();
      setData(payload ?? null);
    } catch (err: any) {
      console.error("Super Admin Dashboard Error:", err);
      setError(err?.response?.data?.message || "Gagal memuat dashboard super admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      void fetchDashboard();
    }
  }, []);

  return {
    data,
    loading,
    error,
    reload: fetchDashboard,
  };
}
