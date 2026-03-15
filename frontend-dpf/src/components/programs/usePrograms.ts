import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import http from "../../lib/http";
import type { 
  Program, 
} from "./ProgramShared";
import { 
  pickLocale, 
  canonicalStatus, 
  getStatusLabel 
} from "./ProgramShared";

export function usePrograms(locale: "id" | "en", t: (key: string, fallback?: string) => string) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorKey, setErrorKey] = useState<"fetch_failed" | null>(null);
  const [searchParams] = useSearchParams();
  
  const [search, setSearch] = useState((searchParams.get("q") ?? "").trim());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(9);

  // Sync search from params
  useEffect(() => {
    setSearch((searchParams.get("q") ?? "").trim());
  }, [searchParams]);

  // Fetch data
  useEffect(() => {
    let active = true;
    setLoading(true);
    http
      .get<{ data: Program[] }>("/programs", { params: { per_page: 1000 } })
      .then((res) => {
        if (!active) return;
        setPrograms(res.data?.data ?? []);
        setErrorKey(null);
      })
      .catch(() => {
        if (!active) return;
        setErrorKey("fetch_failed");
      })
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, []);

  // Process & Filter
  const localizedPrograms = useMemo(() => {
    const filteredDrafts = programs.filter((p) => {
      const status = String(p.status ?? "").trim().toLowerCase();
      return status !== "draft" && status !== "segera";
    });

    const sorted = [...filteredDrafts].sort((a, b) => {
      const aDate = new Date(a.published_at ?? a.created_at ?? 0).getTime();
      const bDate = new Date(b.published_at ?? b.created_at ?? 0).getTime();
      return bDate - aDate;
    });

    return sorted.map((p) => ({
      ...p,
      title: pickLocale(p.title, p.title_en, locale),
      short_description: pickLocale(p.short_description, p.short_description_en, locale),
      category: pickLocale(p.category, p.category_en, locale) || t("landing.programs.defaultCategory"),
    }));
  }, [programs, locale, t]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    localizedPrograms.forEach((p) => p.category && set.add(p.category));
    return Array.from(set);
  }, [localizedPrograms]);

  const statusOptions = useMemo(
    () => [
      { value: "active", label: getStatusLabel("active", t) },
      { value: "completed", label: getStatusLabel("completed", t) },
      // { value: "draft", label: getStatusLabel("draft", t) }, // Excluded as we filter out drafts
    ],
    [t]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return localizedPrograms.filter((p) => {
      const matchCategory = activeCategory ? p.category === activeCategory : true;
      const matchStatus = activeStatus ? canonicalStatus(p.status, p.published_at, p.deadline_days) === activeStatus : true;
      const matchSearch =
        !term ||
        p.title.toLowerCase().includes(term) ||
        (p.short_description ?? "").toLowerCase().includes(term);
      return matchCategory && matchStatus && matchSearch;
    });
  }, [localizedPrograms, search, activeCategory, activeStatus]);

  // Reset pagination when filter changes
  useEffect(() => {
    setVisibleCount(9);
  }, [search, activeCategory, activeStatus]);

  const resetFilters = () => {
    setSearch("");
    setActiveCategory(null);
    setActiveStatus(null);
  };

  return {
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
    filteredCount: filtered.length,
    limitedPrograms: filtered.slice(0, visibleCount),
    visibleCount,
    setVisibleCount,
    resetFilters,
  };
}
