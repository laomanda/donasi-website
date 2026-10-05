import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import type { WaqfAssetItem } from "@/types/finance";
import { WaqfAssetStatusBadge } from "./WaqfAssetStatusBadge";
import { WaqfAssetConditionBadge } from "./WaqfAssetConditionBadge";

interface WaqfAssetDetailHeaderProps {
  asset: WaqfAssetItem;
  periodId?: number | "";
  refreshing: boolean;
  onRefresh: () => void;
}

export const WaqfAssetDetailHeader: React.FC<WaqfAssetDetailHeaderProps> = ({
  asset,
  periodId,
  refreshing,
  onRefresh,
}) => {
  const code = asset.asset_code || "-";
  const name = asset.asset_name || asset.name || "Aset Tanpa Nama";
  const backUrl = `/finance/waqf-assets${periodId ? `?period_id=${periodId}` : ""}`;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
      {/* Back button and title */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <Link
            to={backUrl}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95"
            title="Kembali ke Aset Wakaf"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-poppins">
              {name}
            </h1>
            <WaqfAssetStatusBadge status={asset.status} />
            <WaqfAssetConditionBadge condition={asset.condition} />
          </div>
        </div>
        <p className="text-xs text-slate-500 pl-12 font-mono">
          Kode Aset: <span className="font-semibold text-slate-800">{code}</span>
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 sm:self-center">
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          title="Segarkan Data Aset"
          className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
        >
          <FontAwesomeIcon
            icon={faRotateRight}
            className={refreshing ? "animate-spin text-slate-400" : "text-slate-600"}
          />
          <span>Segarkan</span>
        </button>

        <Link
          to={backUrl}
          className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 active:scale-95"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-white text-xs" />
          <span>Kembali ke Aset Wakaf</span>
        </Link>
      </div>
    </div>
  );
};
