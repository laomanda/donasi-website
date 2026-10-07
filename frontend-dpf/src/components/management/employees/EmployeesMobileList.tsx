import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faMagnifyingGlass,
  faPenToSquare,
  faEnvelope,
  faPhone,
} from '@fortawesome/free-solid-svg-icons';
import type { Employee } from '@/types/employee';
import { EmployeePublicationBadge, EmployeeStatusBadge } from './EmployeeStatusBadge';

interface EmployeesMobileListProps {
  employees: Employee[];
  loading: boolean;
  canManage: boolean;
  selectedIds: Set<number>;
  onToggle: (id: number) => void;
}

export const EmployeesMobileList: React.FC<EmployeesMobileListProps> = ({
  employees,
  loading,
  canManage,
  selectedIds,
  onToggle,
}) => {
  if (loading && employees.length === 0) {
    return (
      <div className="space-y-3 md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="h-16 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500 md:hidden shadow-sm">
        <FontAwesomeIcon icon={faMagnifyingGlass} className="mb-3 text-lg text-slate-400" />
        <p>Belum ada data karyawan yang ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:hidden">
      {employees.map((emp) => (
        <div key={emp.id} className="space-y-3 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="pt-1">
              {canManage && (
                <input
                  type="checkbox"
                  checked={selectedIds.has(emp.id)}
                  onChange={() => onToggle(emp.id)}
                  aria-label={`Pilih ${emp.name}`}
                  className="h-4 w-4 rounded border-slate-300 text-primary-500 focus:ring-primary-400"
                />
              )}
            </div>

            <div className="h-20 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              {emp.id_card_image_url ? (
                <img
                  src={emp.id_card_image_url}
                  alt={`ID Card digital ${emp.name}`}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                  N/A
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <Link
                  to={`/employees/${emp.id}`}
                  title={emp.name}
                  className="truncate text-sm font-bold text-slate-900 hover:text-brandBlueTeal-500"
                >
                  {emp.name.trim().split(/\s+/)[0] || emp.name}
                </Link>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-500">
                  #{emp.display_order ?? '—'}
                </span>
              </div>

              <p className="font-mono text-xs font-semibold text-slate-500">
                ID: {emp.employee_code}
              </p>

              <p className="truncate text-xs font-semibold text-slate-800">
                {emp.position}
              </p>

              <div className="flex flex-col gap-0.5 text-xs text-slate-600 pt-0.5">
                {emp.email && (
                  <span className="flex items-center gap-1.5 truncate">
                    <FontAwesomeIcon icon={faEnvelope} className="text-[10px] text-slate-400 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </span>
                )}
                {emp.phone && (
                  <span className="flex items-center gap-1.5 font-mono text-[11px]">
                    <FontAwesomeIcon icon={faPhone} className="text-[10px] text-slate-400 shrink-0" />
                    <span>{emp.phone}</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <EmployeeStatusBadge status={emp.employment_status} />
                <EmployeePublicationBadge isPublished={emp.is_published} />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-2.5">
            <Link
              to={`/employees/${emp.id}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brandBlueTeal-500 text-white shadow-xs hover:brightness-95"
              title="Lihat Detail"
            >
              <FontAwesomeIcon icon={faEye} className="text-xs" />
            </Link>
            {canManage && (
              <Link
                to={`/employees/${emp.id}/edit`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brandGreen-600 text-white shadow-xs hover:bg-brandGreen-700"
                title="Edit"
              >
                <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
