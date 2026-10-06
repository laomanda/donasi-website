import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faRotateRight } from '@fortawesome/free-solid-svg-icons';

interface EmployeesHeaderProps {
  total?: number;
  canManage: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

export const EmployeesHeader: React.FC<EmployeesHeaderProps> = ({
  total,
  canManage,
  refreshing,
  onRefresh,
}) => {
  return (
    <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandPurple-500 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">
            Karyawan
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Kelola data, status, urutan, publikasi, dan ID Card digital karyawan.
          </p>
          {total !== undefined && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="inline-flex items-center rounded-full bg-primary-500 px-3 py-1 text-white ring-1 ring-primary-500/20">
                Total: <span className="ml-1 font-bold text-white">{total}</span>
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <FontAwesomeIcon
              icon={faRotateRight}
              className={`text-xs text-slate-500 ${refreshing ? 'animate-spin text-slate-700' : ''}`}
            />
            <span>Segarkan</span>
          </button>

          {canManage && (
            <Link
              to="/employees/create"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-600 active:scale-[0.99]"
            >
              <FontAwesomeIcon icon={faPlus} className="text-xs" />
              <span>Tambah Karyawan</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
