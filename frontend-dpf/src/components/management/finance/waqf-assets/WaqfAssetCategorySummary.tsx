import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import type { WaqfAssetCategorySummary as CategorySummaryItem } from "@/types/finance";

interface WaqfAssetCategorySummaryProps {
  categories: CategorySummaryItem[];
}

const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
};

export const WaqfAssetCategorySummary: React.FC<WaqfAssetCategorySummaryProps> = ({
  categories,
}) => {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4 print:p-2">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
            <FontAwesomeIcon icon={faLayerGroup} className="text-xs" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-poppins">
              Ringkasan Nilai Buku per Kategori
            </h2>
            <p className="text-[11px] text-slate-500">
              Distribusi nilai perolehan, depresiasi, dan nilai buku berdasarkan kategori aset wakaf.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-slate-500">
          {categories.length} Kategori
        </span>
      </div>

      {/* Grid of category cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 print:grid-cols-2">
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 transition hover:border-slate-300 print:bg-white"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {cat.category || "Tanpa Kategori"}
                </span>
                <span className="inline-flex shrink-0 items-center rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                  {cat.count} Unit
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Perolehan:</span>
                  <span className="font-medium text-slate-700">
                    {formatCurrency(cat.acquisition_value)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Penyusutan:</span>
                  <span className="font-medium text-slate-700">
                    {formatCurrency(cat.accumulated_depreciation)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-slate-200/80 pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Nilai Buku
              </span>
              <span className="text-xs font-bold text-slate-900 font-poppins">
                {formatCurrency(cat.book_value)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
