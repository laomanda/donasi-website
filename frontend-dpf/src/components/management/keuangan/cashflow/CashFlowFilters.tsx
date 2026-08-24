import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

type CashFlowFiltersProps = {
  q: string;
  setQ: (val: string) => void;
  dateFrom: string;
  setDateFrom: (val: string) => void;
  dateTo: string;
  setDateTo: (val: string) => void;
  typeFilter: "all" | "inflow" | "outflow";
  setTypeFilter: (val: "all" | "inflow" | "outflow") => void;
  onReset: () => void;
  hasFilters: boolean;
};

export function CashFlowFilters({
  q,
  setQ,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  typeFilter,
  setTypeFilter,
  onReset,
  hasFilters,
}: CashFlowFiltersProps) {
  const isToday = useMemo(() => {
    const now = new Date();
    const formatted = now.toISOString().split("T")[0];
    return dateFrom === formatted && dateTo === formatted;
  }, [dateFrom, dateTo]);

  const isThisMonth = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    return dateFrom === `${year}-${month}-01` && dateTo === `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
  }, [dateFrom, dateTo]);

  const isThisYear = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    return dateFrom === `${year}-01-01` && dateTo === `${year}-12-31`;
  }, [dateFrom, dateTo]);

  const isAllPeriod = !dateFrom && !dateTo;

  const setQuickRange = (preset: "today" | "this_month" | "this_year" | "all") => {
    const now = new Date();
    if (preset === "all") {
      setDateFrom("");
      setDateTo("");
      return;
    }

    if (preset === "today") {
      const formatted = now.toISOString().split("T")[0];
      setDateFrom(formatted);
      setDateTo(formatted);
      return;
    }

    if (preset === "this_month") {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
      setDateFrom(`${year}-${month}-01`);
      setDateTo(`${year}-${month}-${String(lastDay).padStart(2, "0")}`);
      return;
    }

    if (preset === "this_year") {
      const year = now.getFullYear();
      setDateFrom(`${year}-01-01`);
      setDateTo(`${year}-12-31`);
      return;
    }
  };

  return (
    <div className="space-y-3 p-4 sm:p-5 bg-white">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-xs" />
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari donatur, keterangan, kode ref..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-900 shadow-xs outline-none transition placeholder:text-slate-400 focus:border-brandGreen-500 focus:ring-2 focus:ring-brandGreen-500/10"
          />
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 hidden sm:inline">
            Periode:
          </span>
          <button
            type="button"
            onClick={() => setQuickRange("all")}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
              isAllPeriod
                ? "bg-slate-900 text-white shadow-xs font-bold"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setQuickRange("today")}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
              isToday
                ? "bg-slate-900 text-white shadow-xs font-bold"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Hari Ini
          </button>
          <button
            type="button"
            onClick={() => setQuickRange("this_month")}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
              isThisMonth
                ? "bg-slate-900 text-white shadow-xs font-bold"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Bulan Ini
          </button>
          <button
            type="button"
            onClick={() => setQuickRange("this_year")}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
              isThisYear
                ? "bg-slate-900 text-white shadow-xs font-bold"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Tahun Ini
          </button>
        </div>
      </div>

      {/* Date Pickers & Type Filters */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500">Dari:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 shadow-xs outline-none focus:border-brandGreen-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500">Sampai:</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 shadow-xs outline-none focus:border-brandGreen-500"
          />
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Tipe:</span>
          <button
            type="button"
            onClick={() => setTypeFilter("all")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              typeFilter === "all"
                ? "bg-slate-900 text-white shadow-xs font-bold"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter("inflow")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              typeFilter === "inflow"
                ? "bg-brandGreen-600 text-white shadow-xs font-bold"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Kas Masuk
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter("outflow")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              typeFilter === "outflow"
                ? "bg-rose-600 text-white shadow-xs font-bold"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Penyaluran
          </button>

          {hasFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 ml-2"
              title="Reset Filter"
            >
              <FontAwesomeIcon icon={faXmark} className="text-xs" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
