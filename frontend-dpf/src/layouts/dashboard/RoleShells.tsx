import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAuthToken, getAuthUser } from "../../lib/auth";
import { DashboardLayout } from "./DashboardLayout";
import type { DashboardRole } from "./DashboardLayout";

const normalizeRoleValue = (value: string) => value.toLowerCase().replace(/[^a-z]/g, "");

const resolveUserRoles = (): DashboardRole[] => {
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

  const normalized = new Set(candidates.map((value) => normalizeRoleValue(value)));

  const roles: DashboardRole[] = [];
  if (normalized.has("superadmin")) roles.push("superadmin");
  if (normalized.has("admin")) roles.push("admin");
  if (normalized.has("editor")) roles.push("editor");
  return roles;
};

function RequireDashboardRole({ role }: { role: DashboardRole }) {
  const location = useLocation();
  const token = getAuthToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const roles = resolveUserRoles();
  if (!roles.length) {
    return <Navigate to="/error/403" replace />;
  }

  if (!roles.includes(role)) {
    return <Navigate to={`/${roles[0]}/dashboard`} replace />;
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
