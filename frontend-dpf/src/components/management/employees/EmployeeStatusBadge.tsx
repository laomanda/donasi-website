import React from 'react';
import type { EmploymentStatus } from '@/types/employee';

interface EmployeeStatusBadgeProps {
  status: EmploymentStatus;
}

export const EmployeeStatusBadge: React.FC<EmployeeStatusBadgeProps> = ({ status }) => {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3f8f3f] px-2.5 py-0.5 text-xs font-semibold text-white shadow-xs">
        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
        Aktif
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow-xs">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
      Tidak Aktif
    </span>
  );
};

interface PublicationBadgeProps {
  isPublished: boolean;
}

export const EmployeePublicationBadge: React.FC<PublicationBadgeProps> = ({ isPublished }) => {
  if (isPublished) {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-100">
        Dipublikasikan
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700">
      Disembunyikan
    </span>
  );
};
