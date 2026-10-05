import { useMemo } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faBuildingColumns } from "@fortawesome/free-solid-svg-icons";
import { FinanceErrorState } from "@/components/management/finance/shared";
import { useWaqfAsset } from "@/hooks/finance/useWaqfAsset";
import {
  WaqfAssetDetailHeader,
  WaqfAssetIdentity,
  WaqfAssetFinancialPosition,
  WaqfAssetSources,
  WaqfAssetDepreciationHistory,
} from "@/components/management/finance/waqf-assets";

export function WaqfAssetDetailPage() {
  const { id: paramId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  const assetId = Number(paramId);
  const isValidId = !isNaN(assetId) && assetId > 0;

  // Retrieve optional period_id from query params to maintain reporting context
  const rawPeriodId = searchParams.get("period_id");
  const periodId = useMemo(() => {
    if (!rawPeriodId) return "";
    const n = Number(rawPeriodId);
    return isNaN(n) ? "" : n;
  }, [rawPeriodId]);

  const {
    assetData,
    loading,
    refreshing,
    error,
    refresh,
  } = useWaqfAsset(isValidId ? assetId : undefined, periodId || null);

  const backUrl = `/finance/waqf-assets${periodId ? `?period_id=${periodId}` : ""}`;

  // 1. Invalid Asset ID state
  if (!isValidId) {
    return (
      <div className="max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            to="/finance/waqf-assets"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 shadow-2xs hover:bg-slate-50"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900 font-poppins">
            Aset Wakaf Tidak Valid
          </h1>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-xs space-y-4">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <FontAwesomeIcon icon={faBuildingColumns} className="text-xl" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-800 font-poppins">
              ID Aset Tidak Ditemukan
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Parameter identifier aset yang Anda tuju tidak valid atau tidak berformat angka.
            </p>
          </div>
          <Link
            to="/finance/waqf-assets"
            className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition active:scale-95"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
            <span>Kembali ke Register Aset Wakaf</span>
          </Link>
        </div>
      </div>
    );
  }

  // 2. Initial Loading Skeleton
  if (loading && !assetData) {
    return (
      <div className="max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between animate-pulse">
          <div className="space-y-2">
            <div className="h-7 w-64 rounded-xl bg-slate-200" />
            <div className="h-4 w-36 rounded-md bg-slate-100" />
          </div>
          <div className="h-10 w-44 rounded-xl bg-slate-200" />
        </div>

        {/* Content Skeleton */}
        <div className="space-y-6 animate-pulse">
          <div className="h-48 rounded-2xl bg-slate-200" />
          <div className="h-32 rounded-2xl bg-slate-200" />
          <div className="h-44 rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  // 3. Error State
  if (error && !assetData) {
    return (
      <div className="max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            to={backUrl}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 shadow-2xs hover:bg-slate-50"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900 font-poppins">
            Detail Aset Wakaf
          </h1>
        </div>

        <FinanceErrorState
          title="Gagal Memuat Detail Aset Wakaf"
          message={error}
          onRetry={refresh}
        />
      </div>
    );
  }

  if (!assetData) return null;

  return (
    <div className="max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Detail Header */}
      <WaqfAssetDetailHeader
        asset={assetData}
        periodId={periodId}
        refreshing={refreshing}
        onRefresh={refresh}
      />

      {/* Main Content Layout */}
      <div className="space-y-6">
        {/* Identitas Aset */}
        <WaqfAssetIdentity asset={assetData} />

        {/* Posisi Nilai Finansial */}
        <WaqfAssetFinancialPosition asset={assetData} />

        {/* Sumber Dana Perolehan */}
        <WaqfAssetSources sources={assetData.sources} />

        {/* Riwayat Penyusutan */}
        <WaqfAssetDepreciationHistory history={assetData.depreciation_history} />
      </div>
    </div>
  );
}

export default WaqfAssetDetailPage;
