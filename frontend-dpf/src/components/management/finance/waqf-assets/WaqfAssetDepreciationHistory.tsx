import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import type { WaqfAssetDepreciationItem } from "@/types/finance";

interface WaqfAssetDepreciationHistoryProps {
  history?: WaqfAssetDepreciationItem[];
}

const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
};

export const WaqfAssetDepreciationHistory: React.FC<WaqfAssetDepreciationHistoryProps> = ({
  history,
}) => {
  if (!history || history.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
            <FontAwesomeIcon icon={faClockRotateLeft} className="text-xs" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-poppins">
              Riwayat Penyusutan
            </h2>
            <p className="text-[11px] text-slate-500">
              Catatan depresiasi berkala dan perkembangan nilai buku aset.
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-400 py-3 text-center">
          Belum ada riwayat penyusutan tercatat untuk aset ini.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
            <FontAwesomeIcon icon={faClockRotateLeft} className="text-xs" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-poppins">
              Riwayat Penyusutan
            </h2>
            <p className="text-[11px] text-slate-500">
              Catatan depresiasi berkala dan perkembangan nilai buku aset.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-slate-500">
          {history.length} Periode
        </span>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900 text-white font-semibold">
              <th className="px-4 py-3">Periode Akuntansi</th>
              <th className="px-4 py-3">Tanggal Akhir</th>
              <th className="px-4 py-3 text-right">Beban Penyusutan</th>
              <th className="px-4 py-3 text-right">Akumulasi Penyusutan</th>
              <th className="px-4 py-3 text-right">Nilai Buku</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {history.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3 font-semibold text-slate-900">
                  {item.period_name || `Periode #${item.period_id}`}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {item.period_end_date || "-"}
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-700 tabular-nums">
                  {formatCurrency(item.depreciation_expense)}
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-700 tabular-nums">
                  {formatCurrency(item.accumulated_depreciation)}
                </td>
                <td className="px-4 py-3 text-right font-bold text-slate-900 tabular-nums font-poppins">
                  {formatCurrency(item.book_value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-2.5">
        {history.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs space-y-2"
          >
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
              <span className="font-bold text-slate-900">
                {item.period_name || `Periode #${item.period_id}`}
              </span>
              <span className="text-[10px] text-slate-400">
                {item.period_end_date || "-"}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Beban:</span>
                <span className="font-medium text-slate-700 tabular-nums">
                  {formatCurrency(item.depreciation_expense)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Akumulasi:</span>
                <span className="font-medium text-slate-700 tabular-nums">
                  {formatCurrency(item.accumulated_depreciation)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200/60 pt-1 font-bold text-slate-900">
                <span>Nilai Buku:</span>
                <span className="tabular-nums font-poppins">
                  {formatCurrency(item.book_value)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
