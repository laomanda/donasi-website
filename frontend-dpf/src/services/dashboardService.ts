import http from "../lib/http";
import type { AdminDashboardPayload, PelihatDashboardPayload, SuperAdminDashboardPayload } from "../types/dashboard";



const dashboardService = {
  getAdminDashboard: async () => {
    const res = await http.get<AdminDashboardPayload>("/admin/dashboard");
    return res.data;
  },
  getSuperAdminDashboard: async () => {
    const res = await http.get<SuperAdminDashboardPayload>("/superadmin/dashboard");
    return res.data;
  },
  getPelihatDashboard: async (chartRange: string = '1W') => {
    const res = await http.get<PelihatDashboardPayload>("/pelihat/dashboard", {
      params: { chart_range: chartRange },
    });
    return res.data;
  },
};


export default dashboardService;
