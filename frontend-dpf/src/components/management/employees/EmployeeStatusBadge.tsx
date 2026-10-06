import React from 'react';
import type { EmploymentStatus } from '@/types/employee';

interface EmployeeStatusBadgeProps {
  status: EmploymentStatus;
}

export const EmployeeStatusBadge: React.FC<EmployeeStatusBadgeProps> = ({ status }) => {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Aktif
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-300">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
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
      <span className="inline-flex items-center rounded-full bg-brandGreen-50 px-2.5 py-1 text-xs font-bold text-brandGreen-700 ring-1 ring-brandGreen-300">
        Dipublikasikan
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
      Disembunyikan
    </span>
  );
};
