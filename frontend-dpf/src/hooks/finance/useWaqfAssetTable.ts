import { useMemo } from "react";
import type { WaqfAssetItem } from "@/types/finance";

export interface UseWaqfAssetTableProps {
  assets: WaqfAssetItem[];
  searchQuery: string;
}

export interface UseWaqfAssetTableReturn {
  filteredAssets: WaqfAssetItem[];
  totalCount: number;
  filteredCount: number;
}

export function useWaqfAssetTable({
  assets,
  searchQuery,
}: UseWaqfAssetTableProps): UseWaqfAssetTableReturn {
  const query = searchQuery.toLowerCase().trim();

  const filteredAssets = useMemo(() => {
    if (!query) return assets;

    return assets.filter((asset) => {
      const codeMatch = asset.asset_code?.toLowerCase().includes(query) ?? false;
      const nameMatch = (asset.name || asset.asset_name || "")
        .toLowerCase()
        .includes(query);
      const categoryMatch = asset.category?.toLowerCase().includes(query) ?? false;
      const wakifMatch = asset.wakif?.toLowerCase().includes(query) ?? false;
      const locationMatch = asset.location?.toLowerCase().includes(query) ?? false;

      return codeMatch || nameMatch || categoryMatch || wakifMatch || locationMatch;
    });
  }, [assets, query]);

  return {
    filteredAssets,
    totalCount: assets.length,
    filteredCount: filteredAssets.length,
  };
}
