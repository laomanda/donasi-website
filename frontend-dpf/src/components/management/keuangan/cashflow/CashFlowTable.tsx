import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExternalLinkAlt,
  faMagnifyingGlass,
  faArrowDown,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import type { CashFlowMutation } from "@/types/cashflow";
import { resolveStorageUrl } from "@/lib/urls";

type CashFlowTableProps = {
  mutations: CashFlowMutation[];
  loading: boolean;
  formatDate: (val: string) => string;
  formatCurrency: (val: number) => string;
};

export function CashFlowTable({
  mutations,
  loading,
  formatDate,
  formatCurrency,
}: CashFlowTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <th className="px-5 py-3.5">Waktu Transaksi</th>
            <th className="px-5 py-3.5 text-center">Tipe Mutasi</th>
            <th className="px-5 py-3.5">Kode Referensi</th>
            <th className="px-5 py-3.5">Keterangan / Pihak Terkait</th>
            <th className="px-5 py-3.5">Program</th>
            <th className="px-5 py-3.5 text-right">Kas Masuk (Inflow)</th>
            <th className="px-5 py-3.5 text-right">Kas Keluar (Outflow)</th>
            <th className="px-5 py-3.5 text-center">Bukti</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-5 py-3.5">
                  <div className="h-3.5 w-24 rounded bg-slate-100" />
                </td>
                <td className="px-5 py-3.5 text-center">
                  <div className="h-5 w-16 rounded bg-slate-100 mx-auto" />
                </td>
                <td className="px-5 py-3.5">
                  <div className="h-3.5 w-20 rounded bg-slate-100" />
                </td>
                <td className="px-5 py-3.5">
                  <div className="h-4 w-36 rounded bg-slate-100" />
                </td>
                <td className="px-5 py-3.5">
                  <div className="h-4 w-28 rounded bg-slate-100" />
                </td>
                <td className="px-5 py-3.5">
                  <div className="h-4 w-20 rounded bg-slate-100 ml-auto" />
                </td>
                <td className="px-5 py-3.5">
                  <div className="h-4 w-20 rounded bg-slate-100 ml-auto" />
                </td>
                <td className="px-5 py-3.5">
                  <div className="h-6 w-6 rounded bg-slate-100 mx-auto" />
                </td>
              </tr>
            ))
          ) : mutations.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-5 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-300 mb-3">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="text-lg" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Tidak ada data mutasi kas
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Coba sesuaikan filter atau rentang tanggal pencarian Anda.
                </p>
              </td>
            </tr>
          ) : (
            mutations.map((item) => {
              const isInflow = item.type === "inflow";

              return (
                <tr key={item.id} className="transition hover:bg-slate-50/70">
                  {/* Date */}
                  <td className="px-5 py-3.5 align-top">
                    <p className="font-semibold text-slate-800">
                      {formatDate(item.date).split(",")[0]}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {formatDate(item.date).split(",")[1]}
                    </p>
                  </td>

                  {/* Type Badge */}
                  <td className="px-5 py-3.5 text-center align-top whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-xs ${
                        isInflow ? "bg-brandGreen-600" : "bg-rose-600"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={isInflow ? faArrowDown : faArrowUp}
                        className="text-[8px]"
                      />
                      {isInflow ? "Kas Masuk" : "Penyaluran"}
                    </span>
                  </td>

                  {/* Code */}
                  <td className="px-5 py-3.5 align-top font-mono text-[11px] font-bold text-slate-600">
                    {item.code}
                  </td>

                  {/* Title & Subtitle */}
                  <td className="px-5 py-3.5 align-top">
                    <p className="font-bold text-slate-800 truncate max-w-xs sm:max-w-sm">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {item.subtitle}
                    </p>
                  </td>

                  {/* Program */}
                  <td className="px-5 py-3.5 align-top">
                    <span className="inline-flex items-center rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-xs">
                      {item.program_title}
                    </span>
                  </td>

                  {/* Inflow Amount */}
                  <td className="px-5 py-3.5 text-right align-top">
                    {isInflow ? (
                      <p className="font-heading font-bold text-brandGreen-700">
                        +{formatCurrency(item.amount)}
                      </p>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>

                  {/* Outflow Amount */}
                  <td className="px-5 py-3.5 text-right align-top">
                    {!isInflow ? (
                      <p className="font-heading font-bold text-rose-600">
                        -{formatCurrency(item.amount)}
                      </p>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>

                  {/* Proof */}
                  <td className="px-5 py-3.5 text-center align-top whitespace-nowrap">
                    {item.proof_path ? (
                      <a
                        href={resolveStorageUrl(item.proof_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                        title="Buka Bukti Transaksi"
                      >
                        <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-300 italic">-</span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
