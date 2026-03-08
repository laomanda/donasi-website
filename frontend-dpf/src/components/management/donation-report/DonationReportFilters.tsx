import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faMagnifyingGlass, faTableColumns, faCheck } from "@fortawesome/free-solid-svg-icons";
import * as Utils from "./DonationReportUtils";

type DonationReportFiltersProps = {
  q: string;
  setQ: (val: string) => void;
  dateFrom: string;
  setDateFrom: (val: string) => void;
  dateTo: string;
  setDateTo: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  qualification: string;
  setQualification: (val: string) => void;
  paymentSource: string;
  setPaymentSource: (val: string) => void;
  perPage: number;
  setPerPage: (val: number) => void;
  onResetFilters: () => void;
  hasFilters: boolean;
  visibleColumns: Utils.ReportColumn[];
  setVisibleColumns: (cols: Utils.ReportColumn[]) => void;
};

export function DonationReportFilters({
  q,
  setQ,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  status,
  setStatus,
  qualification,
  setQualification,
  paymentSource,
  setPaymentSource,
  perPage,
  setPerPage,
  onResetFilters,
  hasFilters,
  visibleColumns,
  setVisibleColumns,
}: DonationReportFiltersProps) {
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowColumnSettings(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleColumn = (colId: Utils.ReportColumn) => {
    if (visibleColumns.includes(colId)) {
      setVisibleColumns(visibleColumns.filter((c) => c !== colId));
    } else {
      setVisibleColumns([...visibleColumns, colId]);
    }
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="font-heading text-lg font-bold text-slate-800 flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <FontAwesomeIcon icon={faFilter} />
          </div>
          Filter & Pencarian
        </h3>
        <div className="flex items-center gap-4">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowColumnSettings(!showColumnSettings)}
              className={[
                "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ring-1 ring-slate-200",
                showColumnSettings ? "bg-slate-100 text-slate-900" : "bg-white text-slate-600 hover:bg-slate-50",
              ].join(" ")}
            >
              <FontAwesomeIcon icon={faTableColumns} className="text-slate-400" />
              Kolom Tabel
            </button>

            {showColumnSettings && (
              <div className="absolute right-0 mt-2 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Pilih Kolom Tampil</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-bold text-slate-400 bg-slate-50 cursor-not-allowed border border-slate-100 italic">
                    <span>Kode (Wajib)</span>
                    <FontAwesomeIcon icon={faCheck} className="text-emerald-500" />
                  </div>
                  {Utils.ALL_COLUMNS.map((col) => {
                    const isActive = visibleColumns.includes(col.id);
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => toggleColumn(col.id)}
                        className={[
                          "flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-bold transition",
                          isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        {col.label}
                        {isActive && <FontAwesomeIcon icon={faCheck} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <label className="lg:col-span-2 block">
              <span className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Cari Nama Donatur</span>
              <div className="relative mt-2 group">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition group-focus-within:text-emerald-500">
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari berdasarkan Nama Donatur..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Dari Tgl</span>
                <div className="relative mt-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>
              </label>
              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Sampai</span>
                <div className="relative mt-2">
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Status</span>
              <div className="relative mt-2">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value="">Semua Status</option>
                  <option value="pending">Menunggu</option>
                  <option value="paid">Lunas</option>
                  <option value="failed">Gagal</option>
                  <option value="expired">Kedaluwarsa</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <FontAwesomeIcon icon={faFilter} className="text-xs" />
                </div>
              </div>
            </label>

            <label className="block">
              <span className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Kualifikasi</span>
              <div className="relative mt-2">
                <select
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value="">Semua Kualifikasi</option>
                  <option value="baru">Donatur Baru</option>
                  <option value="tetap">Donatur Tetap</option>
                  <option value="lama">Donatur Lama</option>
                  <option value="anonim">Anonim</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <FontAwesomeIcon icon={faFilter} className="text-xs" />
                </div>
              </div>
            </label>

            <label className="block">
              <span className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Sumber</span>
              <div className="relative mt-2">
                <select
                  value={paymentSource}
                  onChange={(e) => setPaymentSource(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value="">Semua Sumber</option>
                  <option value="midtrans">Midtrans</option>
                  <option value="manual">Manual</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <FontAwesomeIcon icon={faFilter} className="text-xs" />
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-50 pt-6 mt-2">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Tampilkan</span>
            <div className="relative">
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className="rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-8 py-2 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 appearance-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <FontAwesomeIcon icon={faFilter} className="text-[10px]" />
              </div>
            </div>
            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Data</span>
          </div>
        </div>
      </div>
    </div>
  );
}
