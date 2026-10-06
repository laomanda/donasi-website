import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faRotateRight } from '@fortawesome/free-solid-svg-icons';

interface EmployeesHeaderProps {
  canManage: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

export const EmployeesHeader: React.FC<EmployeesHeaderProps> = ({
  canManage,
  refreshing,
  onRefresh,
}) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-poppins text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Karyawan
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Kelola data, status, urutan, publikasi, dan ID Card digital karyawan.
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-60"
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
            className="inline-flex items-center gap-2 rounded-xl bg-[#ff8a00] px-4 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-[#e67c00] active:scale-[0.98]"
          >
            <FontAwesomeIcon icon={faPlus} className="text-xs" />
            <span>Tambah Karyawan</span>
          </Link>
        )}
      </div>
    </div>
  );
};
