import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faMagnifyingGlass,
  faFilter,
  faReceipt
} from "@fortawesome/free-solid-svg-icons";
import http from "../../../lib/http";
import { useLang } from "../../../lib/i18n";
import { mitraDict, translate } from "../../../i18n/mitra";

type Allocation = {
  id: number;
  amount: number;
  description: string;
  proof_path: string | null;
  created_at: string;
  program: {
    id: number;
    title: string;
  } | null;
};

export function MitraAllocationsPage() {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(mitraDict, locale, key, fallback);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  
  // Dummy state for filters to match design (logic can be implemented later if needed)
  const [programId, setProgramId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await http.get("/mitra/allocations");
      // res.data.data is the paginated object. res.data.data.data is the array.
      setAllocations(res.data.data.data);
    } catch (err) {
      console.error(err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const hasFilters = Boolean(q.trim() || programId || dateFrom || dateTo);

  const onResetFilters = () => {
      setQ("");
      setProgramId("");
      setDateFrom("");
      setDateTo("");
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Header Section - Solid & Professional */}
      <div className="relative overflow-hidden rounded-[28px] bg-emerald-600 p-8 shadow-lg md:p-10">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white ring-1 ring-white/20">
              <span className="h-2 w-2 rounded-full bg-emerald-200 shadow-[0_0_8px_rgba(167,243,208,0.6)]" />
              Keuangan
            </span>
            <h1 className="mt-3 font-heading text-3xl font-bold text-white sm:text-4xl text-shadow-sm">
              {t("mitra.allocation_transparency")}
            </h1>
            <p className="mt-2 max-w-2xl text-emerald-100 font-medium text-lg">
              {t("mitra.dashboard_subtitle")}
            </p>
          </div>
        </div>

        {/* Abstract Background Decoration */}
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
      </div>

       {/* Filters Section */}
       <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-heading text-lg font-bold text-slate-800">
            <FontAwesomeIcon icon={faFilter} className="mr-2 text-emerald-500" />
            Filter & Pencarian
          </h3>
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

        <div className="grid gap-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Pencarian</span>
                    <div className="relative mt-2 group">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition group-focus-within:text-emerald-500">
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </span>
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Cari alokasi..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                        />
                    </div>
                </label>

                <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Dari Tanggal</span>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                        />
                    </label>
                    <label className="block">
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Sampai</span>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                        />
                    </label>
                </div>
            </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-100">
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full table-fixed">
            <thead className="bg-slate-50">
              <tr>
                <th className="w-[15%] px-6 py-5 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">{t("mitra.date")}</th>
                <th className="w-[60%] px-6 py-5 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">{t("mitra.program_allocation")}</th>
                <th className="w-[25%] px-6 py-5 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">{t("mitra.nominal")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                 Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-6" colSpan={3}>
                        <div className="flex items-center gap-4">
                          <div className="h-4 w-full rounded bg-slate-100" />
                        </div>
                      </td>
                    </tr>
                 ))
              ) : allocations.length === 0 ? (
                <tr>
                   <td colSpan={3} className="px-6 py-20 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <FontAwesomeIcon icon={faReceipt} className="text-2xl" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-slate-900">{t("mitra.no_allocation")}</h3>
                  </td>
                </tr>
              ) : (
                allocations.map((alloc) => (
                  <tr key={alloc.id} className="cursor-pointer transition hover:bg-slate-50 border-b border-slate-100 last:border-b-0" onClick={() => navigate(`/mitra/allocations/${alloc.id}`)}>
                    <td className="px-6 py-5 text-slate-600 text-sm font-semibold tabular-nums border-r border-slate-50">
                      {new Date(alloc.created_at).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-900 mb-1">{alloc.description}</p>
                      <div className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                        {alloc.program?.title ?? t("mitra.general_program")}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right font-bold text-slate-900 tabular-nums border-l border-slate-50">
                       {formatIDR(alloc.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
