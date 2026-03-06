import { LandingLayout } from "../layouts/LandingLayout";
import { useLang } from "../lib/i18n";
import { literasiDict } from "../components/literasi/LiterasiI18n";
import { translate } from "../lib/i18n-utils";

// Literasi Components & Logic
import { useLiterasi } from "../components/literasi/useLiterasi.ts";
import { LiterasiHero } from "../components/literasi/LiterasiHero.tsx";
import { LiterasiFilters } from "../components/literasi/LiterasiFilters.tsx";
import { LiterasiGrid } from "../components/literasi/LiterasiGrid.tsx";
import { LiterasiEmpty } from "../components/literasi/LiterasiEmpty.tsx";

export function LiterasiPage() {
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(literasiDict, locale, key, fallback);

  const {
    loading,
    errorKey,
    search,
    setSearch,
    activeCategory,
    setActiveCategory,
    isFilterExpanded,
    setIsFilterExpanded,
    categories,
    filtered,
    limited,
    handleLoadMore,
    resetFilters
  } = useLiterasi(locale);

  return (
    <LandingLayout>
      {/* HEADER HERO SECTION */}
      <LiterasiHero t={t} />

      {/* SEARCH & FILTER SECTION */}
      <div className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <LiterasiFilters
            search={search}
            setSearch={setSearch}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            isFilterExpanded={isFilterExpanded}
            setIsFilterExpanded={setIsFilterExpanded}
            categories={categories}
            totalResults={filtered.length}
            t={t}
          />
        </div>
      </div>

      {/* ARTICLES GRID SECTION */}
      <div className="bg-slate-50 min-h-[400px]">
        {errorKey && (
          <div className="mx-auto max-w-xl px-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-center text-sm font-medium text-red-600">
            {t("literasi.error")}
          </div>
        )}

        <LiterasiGrid
          articles={limited}
          loading={loading}
          totalFiltered={filtered.length}
          onLoadMore={handleLoadMore}
          hasMore={limited.length < filtered.length}
          locale={locale}
          t={t}
        />

        {!loading && limited.length === 0 && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <LiterasiEmpty onReset={resetFilters} t={t} />
          </div>
        )}
      </div>
    </LandingLayout>
  );
}
