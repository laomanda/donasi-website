import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLayerGroup,
  faChevronDown,
  faChevronUp,
  faArrowLeft,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import type { ProgramBreakdown } from "@/types/cashflow";

type CashFlowProgramBreakdownProps = {
  programs: ProgramBreakdown[];
  loading: boolean;
  formatCurrency: (val: number) => string;
};

export function CashFlowProgramBreakdown({
  programs,
  loading,
  formatCurrency,
}: CashFlowProgramBreakdownProps) {
  const [expanded, setExpanded] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 5;

  const totalPages = Math.max(1, Math.ceil(programs.length / perPage));

  const pagedPrograms = useMemo(() => {
    const start = (page - 1) * perPage;
    return programs.slice(start, start + perPage);
  }, [programs, page, perPage]);

  if (!loading && programs.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between bg-slate-50/70 px-5 py-3.5 text-left transition hover:bg-slate-100/60"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white text-xs">
            <FontAwesomeIcon icon={faLayerGroup} />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-800">
              Rekapitulasi Saldo Kantong Program (Ring-Fenced Funds)
            </h2>
            <p className="text-[11px] text-slate-400">
              Monitoring amanah dana terkumpul vs realisasi penyaluran tiap program.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            {programs.length} Program
          </span>
          <FontAwesomeIcon
            icon={expanded ? faChevronUp : faChevronDown}
            className="text-xs text-slate-400"
          />
        </div>
      </button>

      {expanded && (
        <>
          <div className="overflow-x-auto border-t border-slate-100">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-2.5">Nama Program</th>
                  <th className="px-5 py-2.5 text-right">Donasi Masuk</th>
                  <th className="px-5 py-2.5 text-right">Penyaluran Keluar</th>
                  <th className="px-5 py-2.5 text-right">Sisa Saldo Kas</th>
                  <th className="px-5 py-2.5 text-center">Tingkat Serapan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-3">
                        <div className="h-4 w-40 rounded bg-slate-100" />
                      </td>
                      <td className="px-5 py-3">
                        <div className="h-4 w-24 rounded bg-slate-100 ml-auto" />
                      </td>
                      <td className="px-5 py-3">
                        <div className="h-4 w-24 rounded bg-slate-100 ml-auto" />
                      </td>
                      <td className="px-5 py-3">
                        <div className="h-4 w-24 rounded bg-slate-100 ml-auto" />
                      </td>
                      <td className="px-5 py-3">
                        <div className="h-4 w-16 rounded bg-slate-100 mx-auto" />
                      </td>
                    </tr>
                  ))
                ) : (
                  pagedPrograms.map((p) => {
                    const isSurplus = p.remaining_balance > 0;
                    const isDeficit = p.remaining_balance < 0;

                    return (
                      <tr key={p.program_id} className="transition hover:bg-slate-50/60">
                        <td className="px-5 py-3">
                          <p className="font-semibold text-slate-800 truncate max-w-xs sm:max-w-md">
                            {p.program_title}
                          </p>
                          {p.category && (
                            <span className="text-[10px] text-slate-400 capitalize">
                              Kategori: {p.category}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right font-semibold text-brandGreen-700">
                          {formatCurrency(p.inflow_amount)}
                        </td>
                        <td className="px-5 py-3 text-right font-semibold text-rose-600">
                          {formatCurrency(p.outflow_amount)}
                        </td>
                        <td className={`px-5 py-3 text-right font-bold ${
                          isDeficit ? "text-rose-600" : isSurplus ? "text-slate-900" : "text-slate-400"
                        }`}>
                          {formatCurrency(p.remaining_balance)}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  p.disbursement_ratio >= 100
                                    ? "bg-rose-500"
                                    : p.disbursement_ratio >= 50
                                    ? "bg-amber-500"
                                    : "bg-brandGreen-500"
                                }`}
                                style={{ width: `${Math.min(100, p.disbursement_ratio)}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-semibold text-slate-600">
                              {p.disbursement_ratio.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {programs.length > perPage && (
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-2.5 text-xs">
              <span className="text-slate-500">
                Menampilkan halaman <span className="font-semibold text-slate-700">{page}</span> dari{" "}
                <span className="font-semibold text-slate-700">{totalPages}</span> ({programs.length} Program)
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:bg-slate-50 disabled:opacity-40"
                  title="Halaman Sebelumnya"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:bg-slate-50 disabled:opacity-40"
                  title="Halaman Selanjutnya"
                >
                  <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
