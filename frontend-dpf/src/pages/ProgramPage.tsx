import { useRef, useState } from "react";
import { LandingLayout } from "../layouts/LandingLayout";
import { useLang } from "../lib/i18n";
import { programDict } from "../components/programs/ProgramI18n";
import { translate } from "../lib/i18n-utils";
import { useSearchHighlight } from "../lib/highlight";

import { usePrograms } from "../components/programs/usePrograms";
import { ProgramHero } from "../components/programs/ProgramHero";
import { ProgramFilters } from "../components/programs/ProgramFilters";
import { ProgramGrid } from "../components/programs/ProgramGrid";

export function ProgramPage() {
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(programDict, locale, key, fallback);
  const pageRef = useRef<HTMLDivElement | null>(null);

  // Modular Logic Hook
  const {
    loading,
    errorKey,
    search,
    setSearch,
    activeCategory,
    setActiveCategory,
    activeStatus,
    setActiveStatus,
    categories,
    statusOptions,
    filteredCount,
    limitedPrograms,
    visibleCount,
    setVisibleCount,
    resetFilters,
  } = usePrograms(locale, t);

  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Search Highlighting
  useSearchHighlight(pageRef, { autoClearMs: 6000 });

  return (
    <LandingLayout>
      <div ref={pageRef}>
        <ProgramHero t={t} />

        <ProgramFilters
          search={search}
          setSearch={setSearch}
          filteredCount={filteredCount}
          isFilterExpanded={isFilterExpanded}
          setIsFilterExpanded={setIsFilterExpanded}
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          statusOptions={statusOptions}
          activeStatus={activeStatus}
          setActiveStatus={setActiveStatus}
          t={t}
        />

        <ProgramGrid
          loading={loading}
          errorKey={errorKey}
          programs={limitedPrograms}
          visibleCount={visibleCount}
          setVisibleCount={setVisibleCount}
          filteredCount={filteredCount}
          locale={locale}
          t={t}
          resetFilters={resetFilters}
        />
      </div>
    </LandingLayout>
  );
}
