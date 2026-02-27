import http from "../lib/http";
import type { AdminDashboardPayload, SuperAdminDashboardPayload } from "../types/dashboard";



const dashboardService = {
  getAdminDashboard: async () => {
    const res = await http.get<AdminDashboardPayload>("/admin/dashboard");
    return res.data;
  },
  getSuperAdminDashboard: async () => {
    const res = await http.get<SuperAdminDashboardPayload>("/superadmin/dashboard");
    return res.data;
  },
};


export default dashboardService;
