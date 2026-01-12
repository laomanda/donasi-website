import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAuthToken, getAuthUser } from "../../lib/auth";
import { DashboardLayout } from "./DashboardLayout";
import type { DashboardRole } from "./DashboardLayout";

const resolveUserRole = (): DashboardRole | null => {
  const user = getAuthUser();
  const candidates: string[] = [];

  if (user?.roles && Array.isArray(user.roles)) {
    user.roles.forEach((r) => {
      if (r && typeof r === "object" && typeof (r as any).name === "string") {
        candidates.push(String((r as any).name));
      }
    });
  }

  if (typeof user?.role_label === "string") {
    candidates.push(user.role_label);
  }

  const normalized = new Set(
    candidates.map((value) => value.toLowerCase().replace(/[^a-z]/g, ""))
  );

  if (normalized.has("superadmin")) return "superadmin";
  if (normalized.has("admin")) return "admin";
  if (normalized.has("editor")) return "editor";
  return null;
};

function RequireDashboardRole({ role }: { role: DashboardRole }) {
  const location = useLocation();
  const token = getAuthToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const currentRole = resolveUserRole();
  if (!currentRole) {
    return <Navigate to="/error/403" replace />;
  }

  if (currentRole !== role) {
    return <Navigate to={`/${currentRole}/dashboard`} replace />;
  }

  return (
    <DashboardLayout role={role}>
      <Outlet />
    </DashboardLayout>
  );
}

export function EditorShell() {
  return <RequireDashboardRole role="editor" />;
}

export function AdminShell() {
  return <RequireDashboardRole role="admin" />;
}

export function SuperAdminShell() {
  return <RequireDashboardRole role="superadmin" />;
}
