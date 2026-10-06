import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPenToSquare, faTrashCan, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
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
            className="animate-pulse rounded-[24px] border border-slate-200 border-l-4 border-l-brandGreen-300 bg-white p-4 shadow-sm space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="h-16 w-12 rounded-xl bg-slate-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-slate-100" />
                <div className="h-3 w-20 rounded bg-slate-100" />
                <div className="h-3 w-28 rounded bg-slate-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500 md:hidden shadow-sm">
        <div className="flex flex-col items-center justify-center">
          <div className="h-12 w-12 mb-3 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-lg">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </div>
          <p>Belum ada data karyawan yang ditemukan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:hidden">
      {employees.map((emp) => (
        <div
          key={`mob-${emp.id}`}
          className="rounded-[24px] border border-slate-200 border-l-4 border-l-brandGreen-400 bg-white p-4 shadow-sm transition hover:shadow-md space-y-3"
        >
          <div className="flex items-start gap-3.5">
            {/* ID Card Thumbnail */}
            <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-xs">
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
                  className="font-heading text-sm font-bold text-slate-900 line-clamp-1 hover:text-brandGreen-700 transition"
                >
                  {emp.name}
                </Link>
                <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  #{emp.display_order ?? '—'}
                </span>
              </div>

              <p className="font-mono text-xs font-semibold text-slate-500">
                ID: {emp.employee_code}
              </p>

              <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                {emp.position}
                {emp.division ? ` • ${emp.division}` : ''}
              </p>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <EmployeeStatusBadge status={emp.employment_status} />
                <EmployeePublicationBadge isPublished={emp.is_published} />
              </div>
            </div>
          </div>

          {/* Actions Row */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-2.5">
            <Link
              to={`/employees/${emp.id}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-xs transition hover:border-sky-400 hover:text-sky-600 hover:bg-sky-50"
              title="Lihat Detail"
              aria-label="Lihat Detail"
            >
              <FontAwesomeIcon icon={faEye} className="text-xs" />
            </Link>

            {canManage && (
              <>
                <Link
                  to={`/employees/${emp.id}/edit`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-xs transition hover:border-brandGreen-500 hover:text-brandGreen-700 hover:bg-brandGreen-50"
                  title="Edit"
                  aria-label="Edit"
                >
                  <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
                </Link>

                <button
                  type="button"
                  onClick={() => onDelete(emp)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-xs transition hover:border-red-400 hover:text-red-600 hover:bg-red-50"
                  title="Hapus"
                  aria-label="Hapus"
                >
                  <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
