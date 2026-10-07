import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faXmark, faFilter, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import type { EmployeeFilterOptions, EmployeeListParams } from '@/types/employee';
import { SearchableSelect } from '@/components/management/finance/shared';

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
    <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandGreen-300 bg-white p-5 shadow-sm sm:p-6 space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
        {/* Search Input */}
        <div className="sm:col-span-2 lg:col-span-3">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Cari Karyawan
            </span>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm" />
              </span>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Cari nama atau ID pegawai..."
                className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-10 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchValue('');
                    onChange({ q: undefined, page: 1 });
                  }}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition"
                  aria-label="Hapus pencarian"
                >
                  <FontAwesomeIcon icon={faXmark} className="text-sm" />
                </button>
              )}
            </div>
          </label>
        </div>

        {/* Position Filter */}
        <div className="lg:col-span-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Jabatan
          </span>
          <div className="mt-2">
            <SearchableSelect<string>
              value={params.position ?? ''}
              onChange={(value) => onChange({ position: value || undefined, page: 1 })}
              options={filterOptions.positions.map((pos) => ({ value: pos, label: pos }))}
              placeholder="Semua Jabatan"
              searchPlaceholder="Cari jabatan..."
              emptyMessage="Jabatan tidak ditemukan"
              clearable
              onClear={() => onChange({ position: undefined, page: 1 })}
              className="w-full"
              buttonClassName="!w-full !rounded-2xl !border-slate-300 !px-4 !py-3 !text-sm !font-semibold !text-slate-700 !shadow-sm"
            />
          </div>
        </div>

        {/* Division Filter */}
        <div className="lg:col-span-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Divisi
          </span>
          <div className="mt-2">
            <SearchableSelect<string>
              value={params.division ?? ''}
              onChange={(value) => onChange({ division: value || undefined, page: 1 })}
              options={(filterOptions.divisions || []).map((div) => ({ value: div, label: div }))}
              placeholder="Semua Divisi"
              searchPlaceholder="Cari divisi..."
              emptyMessage="Divisi tidak ditemukan"
              clearable
              onClear={() => onChange({ division: undefined, page: 1 })}
              className="w-full"
              buttonClassName="!w-full !rounded-2xl !border-slate-300 !px-4 !py-3 !text-sm !font-semibold !text-slate-700 !shadow-sm"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="lg:col-span-2">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Status
            </span>
            <select
              value={params.employment_status ?? ''}
              onChange={(e) => onChange({ employment_status: e.target.value || undefined, page: 1 })}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
          </label>
        </div>

        {/* Publication Filter */}
        <div className="lg:col-span-2">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Publikasi
            </span>
            <select
              value={params.is_published !== undefined ? String(params.is_published) : ''}
              onChange={(e) => {
                const val = e.target.value;
                onChange({ is_published: val === '' ? undefined : val === 'true', page: 1 });
              }}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
            >
              <option value="">Semua Publikasi</option>
              <option value="true">Dipublikasikan</option>
              <option value="false">Disembunyikan</option>
            </select>
          </label>
        </div>
      </div>

      {/* Reset Filter Button */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-2">
            <FontAwesomeIcon icon={faFilter} className="text-slate-400 text-xs" />
            Filter aktif
          </span>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <FontAwesomeIcon icon={faRotateLeft} className="text-xs text-slate-400" />
            <span>Reset Filter</span>
          </button>
        </div>
      )}
    </div>
  );
};
