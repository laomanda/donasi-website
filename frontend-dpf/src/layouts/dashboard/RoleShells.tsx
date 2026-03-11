import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAuthToken, getAuthUser } from "../../lib/auth";
import { DashboardLayout } from "./DashboardLayout";
import * as Utils from "../../components/management/dashboard/DashboardUtils";

const resolveUserRoles = (): Utils.DashboardRole[] => {
  const user = getAuthUser();
  return Utils.resolveUserRoles(user as Utils.StoredUser);
};

const resolveUserPermissions = (): string[] => {
  const user = getAuthUser();
  return Utils.resolveUserPermissions(user as Utils.StoredUser);
};

function RequireDashboardRole({ role }: { role: Utils.DashboardRole }) {
  const location = useLocation();
  const token = getAuthToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const roles = resolveUserRoles();
  const permissions = resolveUserPermissions();
  const permissionSet = new Set(permissions);

  if (!roles.length) {
    return <Navigate to="/error/403" replace />;
  }

  if (!roles.includes(role)) {
    const home = roles[0];
    const redirectPath = `/${home}/dashboard`;
    return <Navigate to={redirectPath} replace />;
  }

  // Final check: Granular access control for current path
  const sections = Utils.NAV_SECTIONS_BY_ROLE[role];
  const allItems = sections.flatMap((s) => s.items);
  const currentItem = allItems.find((item) => {
    // Exact match or sub-path match (e.g. /admin/users matches /admin/users/create)
    return location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
  });

  const isSuperAdmin = roles.includes("superadmin");
  if (!isSuperAdmin && currentItem?.permission && !permissionSet.has(currentItem.permission)) {
    // If user doesn't have specific permission for this page, boot to unauthorized
    // Superadmin bypasses this check
    return <Navigate to="/error/403" replace />;
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

export function MitraShell() {
  return <RequireDashboardRole role="mitra" />;
}
