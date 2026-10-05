import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleInfo,
  faBuildingColumns,
  faBarcode,
  faLayerGroup,
  faUserTie,
  faCalendarAlt,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import type { WaqfAssetItem } from "@/types/finance";
import { WaqfAssetStatusBadge } from "./WaqfAssetStatusBadge";
import { WaqfAssetConditionBadge } from "./WaqfAssetConditionBadge";
import { WaqfAssetEconomicUseBadge } from "./WaqfAssetEconomicUseBadge";

interface WaqfAssetIdentityProps {
  asset: WaqfAssetItem;
}

export const WaqfAssetIdentity: React.FC<WaqfAssetIdentityProps> = ({ asset }) => {
  const code = asset.asset_code || "-";
  const name = asset.asset_name || asset.name || "Aset Tanpa Nama";
  const category = asset.category || "-";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
          <FontAwesomeIcon icon={faCircleInfo} className="text-xs" />
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-poppins">
            Informasi Aset
          </h2>
          <p className="text-[11px] text-slate-500">
            Detail identitas, peruntukan, dan operasional aset wakaf.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Nama Aset */}
        <div className="space-y-1">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <FontAwesomeIcon icon={faBuildingColumns} className="text-[10px]" />
            Nama Aset
          </span>
          <p className="font-bold text-slate-900 font-poppins text-sm leading-snug">
            {name}
          </p>
        </div>

        {/* Kode Aset */}
        <div className="space-y-1">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <FontAwesomeIcon icon={faBarcode} className="text-[10px]" />
            Kode Aset
          </span>
          <p className="font-mono font-bold text-slate-900 text-sm">
            {code}
          </p>
        </div>

        {/* Kategori */}
        <div className="space-y-1">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <FontAwesomeIcon icon={faLayerGroup} className="text-[10px]" />
            Kategori Aset
          </span>
          <p className="font-medium text-slate-800">
            {category}
          </p>
        </div>

        {/* Penggunaan Ekonomi */}
        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Penggunaan Ekonomi
          </span>
          <div>
            <WaqfAssetEconomicUseBadge
              economicUse={asset.economic_use}
              percentage={asset.productive_percentage}
            />
          </div>
        </div>

        {/* Wakif */}
        <div className="space-y-1">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <FontAwesomeIcon icon={faUserTie} className="text-[10px]" />
            Wakif / Pewakaf
          </span>
          <p className="font-medium text-slate-800">
            {asset.wakif || "-"}
          </p>
        </div>

        {/* Tanggal Perolehan */}
        <div className="space-y-1">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-[10px]" />
            Tanggal Perolehan
          </span>
          <p className="font-medium text-slate-800">
            {asset.acquisition_date || "-"}
          </p>
        </div>

        {/* Status Aset */}
        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Status Operasional
          </span>
          <div>
            <WaqfAssetStatusBadge status={asset.status} />
          </div>
        </div>

        {/* Kondisi Aset */}
        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Kondisi Fisik
          </span>
          <div>
            <WaqfAssetConditionBadge condition={asset.condition} />
          </div>
        </div>

        {/* Lokasi Aset */}
        {asset.location && (
          <div className="sm:col-span-2 space-y-1 border-t border-slate-100 pt-3">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[10px]" />
              Lokasi / Alamat Aset
            </span>
            <p className="font-medium text-slate-800 leading-relaxed">
              {asset.location}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
