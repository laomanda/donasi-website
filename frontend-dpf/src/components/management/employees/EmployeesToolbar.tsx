import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faXmark, faFilter } from '@fortawesome/free-solid-svg-icons';
import type { EmployeeFilterOptions, EmployeeListParams } from '@/types/employee';

interface EmployeesToolbarProps {
  params: EmployeeListParams;
  filterOptions: EmployeeFilterOptions;
  onChange: (updated: Partial<EmployeeListParams>) => void;
  onReset: () => void;
}

export const EmployeesToolbar: React.FC<EmployeesToolbarProps> = ({
  params,
  filterOptions,
  onChange,
  onReset,
}) => {
  const [searchValue, setSearchValue] = useState<string>(params.q ?? '');

  // Keep local search input synchronized if params.q changes externally (e.g. on reset)
  useEffect(() => {
    setSearchValue(params.q ?? '');
  }, [params.q]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchValue.trim();
      if (trimmed !== (params.q ?? '').trim()) {
        onChange({ q: trimmed || undefined, page: 1 });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchValue, params.q, onChange]);

  const hasActiveFilters = Boolean(
    (params.q && params.q.trim() !== '') ||
    params.position ||
    params.division ||
    params.employment_status ||
    (params.is_published !== undefined && params.is_published !== '')
  );

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
        {/* Search Input */}
        <div className="relative sm:col-span-2 lg:col-span-4">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <FontAwesomeIcon icon={faSearch} className="text-sm" />
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Cari nama atau ID pegawai..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-9 text-sm text-slate-800 placeholder-slate-400 transition focus:border-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-200"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => {
                setSearchValue('');
                onChange({ q: undefined, page: 1 });
              }}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
              aria-label="Hapus pencarian"
            >
              <FontAwesomeIcon icon={faXmark} className="text-sm" />
            </button>
          )}
        </div>

        {/* Position Filter */}
        <div className="lg:col-span-2">
          <select
            value={params.position ?? ''}
            onChange={(e) => onChange({ position: e.target.value || undefined, page: 1 })}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-800 transition focus:border-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Semua Jabatan</option>
            {filterOptions.positions.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </div>

        {/* Division Filter */}
        <div className="lg:col-span-2">
          <select
            value={params.division ?? ''}
            onChange={(e) => onChange({ division: e.target.value || undefined, page: 1 })}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-800 transition focus:border-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Semua Divisi</option>
            {filterOptions.divisions.map((div) => (
              <option key={div} value={div}>
                {div}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="lg:col-span-2">
          <select
            value={params.employment_status ?? ''}
            onChange={(e) => onChange({ employment_status: e.target.value || undefined, page: 1 })}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-800 transition focus:border-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Tidak Aktif</option>
          </select>
        </div>

        {/* Publication Filter */}
        <div className="lg:col-span-2">
          <select
            value={params.is_published !== undefined ? String(params.is_published) : ''}
            onChange={(e) => {
              const val = e.target.value;
              onChange({ is_published: val === '' ? undefined : val === 'true', page: 1 });
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-800 transition focus:border-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Semua Publikasi</option>
            <option value="true">Dipublikasikan</option>
            <option value="false">Disembunyikan</option>
          </select>
        </div>
      </div>

      {/* Active Filter Indicators & Reset Action */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <FontAwesomeIcon icon={faFilter} className="text-[10px]" />
            <span>Filter diterapkan</span>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            <FontAwesomeIcon icon={faXmark} className="text-[11px]" />
            <span>Reset Filter</span>
          </button>
        </div>
      )}
    </div>
  );
};
