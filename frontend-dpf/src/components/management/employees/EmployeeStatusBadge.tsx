import React from 'react';
import type { EmploymentStatus } from '@/types/employee';

interface EmployeeStatusBadgeProps {
  status: EmploymentStatus;
}

export const EmployeeStatusBadge: React.FC<EmployeeStatusBadgeProps> = ({ status }) => {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-brandBlueTeal-500 px-3 py-1 text-xs font-bold text-white">
        Aktif
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white">
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
      <span className="inline-flex items-center rounded-full bg-brandPurple-500 px-2.5 py-1 text-xs font-bold text-white">
        Dipublikasikan
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-rose-600 px-2.5 py-1 text-xs font-bold text-white">
      Disembunyikan
    </span>
  );
};
