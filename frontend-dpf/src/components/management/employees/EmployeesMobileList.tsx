import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import type { Employee } from '@/types/employee';
import { EmployeePublicationBadge, EmployeeStatusBadge } from './EmployeeStatusBadge';

interface EmployeesMobileListProps {
  employees: Employee[];
  loading: boolean;
  canManage: boolean;
  onDelete: (employee: Employee) => void;
}

export const EmployeesMobileList: React.FC<EmployeesMobileListProps> = ({
  employees,
  loading,
  canManage,
  onDelete,
}) => {
  if (loading && employees.length === 0) {
    return (
      <div className="space-y-3 md:hidden">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={`skel-mob-${idx}`}
            className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="h-16 w-12 rounded-md bg-slate-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-slate-200" />
                <div className="h-3 w-20 rounded bg-slate-200" />
                <div className="h-3 w-28 rounded bg-slate-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 md:hidden">
        Tidak ada data karyawan yang ditemukan.
      </div>
    );
  }

  return (
    <div className="space-y-3 md:hidden">
      {employees.map((emp) => (
        <div
          key={`mob-${emp.id}`}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-slate-300"
        >
          <div className="flex items-start gap-3.5">
            {/* ID Card Thumbnail */}
            <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100 shadow-2xs">
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

            {/* Info */}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <Link
                  to={`/employees/${emp.id}`}
                  className="font-poppins font-semibold text-slate-900 line-clamp-1 hover:text-brandGreen-700"
                >
                  {emp.name}
                </Link>
                <span className="font-mono text-xs font-bold text-slate-500">
                  #{emp.display_order ?? '—'}
                </span>
              </div>

              <p className="font-mono text-xs text-slate-500">
                ID: {emp.employee_code}
              </p>

              <p className="text-xs font-medium text-slate-800 line-clamp-1">
                {emp.position}
                {emp.division ? ` • ${emp.division}` : ''}
              </p>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <EmployeeStatusBadge status={emp.employment_status} />
                <EmployeePublicationBadge isPublished={emp.is_published} />
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-3 flex items-center justify-end gap-1.5 border-t border-slate-100 pt-2.5">
            <Link
              to={`/employees/${emp.id}`}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <FontAwesomeIcon icon={faEye} className="text-[11px]" />
              <span>Lihat</span>
            </Link>

            {canManage && (
              <>
                <Link
                  to={`/employees/${emp.id}/edit`}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <FontAwesomeIcon icon={faPenToSquare} className="text-[11px]" />
                  <span>Edit</span>
                </Link>

                <button
                  type="button"
                  onClick={() => onDelete(emp)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                >
                  <FontAwesomeIcon icon={faTrashCan} className="text-[11px]" />
                  <span>Hapus</span>
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
