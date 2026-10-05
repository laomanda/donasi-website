import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandHoldingHeart } from "@fortawesome/free-solid-svg-icons";
import type { WaqfAssetSourceItem } from "@/types/finance";
import { formatSourceType } from "@/utils/finance/waqfAssetDisplay";

interface WaqfAssetSourcesProps {
  sources?: WaqfAssetSourceItem[];
}

const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
};

export const WaqfAssetSources: React.FC<WaqfAssetSourcesProps> = ({ sources }) => {
  if (!sources || sources.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
            <FontAwesomeIcon icon={faHandHoldingHeart} className="text-xs" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-poppins">
              Sumber Dana Perolehan
            </h2>
            <p className="text-[11px] text-slate-500">
              Rincian asal dana yang digunakan untuk perolehan aset wakaf.
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-400 py-3 text-center">
          Tidak ada data rincian sumber dana perolehan untuk aset ini.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
            <FontAwesomeIcon icon={faHandHoldingHeart} className="text-xs" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-poppins">
              Sumber Dana Perolehan
            </h2>
            <p className="text-[11px] text-slate-500">
              Rincian asal dana yang digunakan untuk perolehan aset wakaf.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-slate-500">
          {sources.length} Sumber
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900 text-white font-semibold">
              <th className="px-4 py-3">Jenis Sumber</th>
              <th className="px-4 py-3">Keterangan</th>
              <th className="px-4 py-3 text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {sources.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                  {formatSourceType(s.source_type)}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {s.description || "-"}
                </td>
                <td className="px-4 py-3 text-right font-bold text-slate-900 tabular-nums font-poppins whitespace-nowrap">
                  {formatCurrency(s.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
