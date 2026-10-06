import { useMemo } from 'react';
import { getAuthUser } from '@/lib/auth';
import * as Utils from '@/components/management/dashboard/DashboardUtils';

export interface EmployeePermissions {
  canView: boolean;
  canManage: boolean;
  isSuperAdmin: boolean;
}

export function useEmployeePermissions(): EmployeePermissions {
  const user = getAuthUser();

  return useMemo(() => {
    if (!user) {
      return { canView: false, canManage: false, isSuperAdmin: false };
    }

    const roles = Utils.resolveUserRoles(user as Utils.StoredUser);
    const permissions = Utils.resolveUserPermissions(user as Utils.StoredUser);

    const isSuperAdmin = roles.includes('superadmin');
    const hasManage = permissions.includes('manage employees');
    const hasView = permissions.includes('view employees');

    const canManage = isSuperAdmin || hasManage;
    const canView = isSuperAdmin || hasManage || hasView;

    return {
      canView,
      canManage,
      isSuperAdmin,
    };
  }, [user]);
}
