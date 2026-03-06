import { useState, useEffect, useMemo } from "react";
import http from "../../lib/http";
import type { Literasi } from "./LiterasiShared.ts";
import { pickLocale } from "./LiterasiShared.ts";

export function useLiterasi(locale: "id" | "en") {
  const [articles, setArticles] = useState<Literasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorKey, setErrorKey] = useState<"fetch_failed" | null>(null);

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(9);

  useEffect(() => {
    let active = true;
    setLoading(true);
    http
      .get<{ data: Literasi[] }>("/articles", { params: { per_page: 1000 } })
      .then((res) => {
        if (!active) return;
        setArticles(res.data?.data ?? []);
        setErrorKey(null);
      })
      .catch((err) => {
        console.error("Failed to fetch literasi:", err);
        if (!active) return;
        setErrorKey("fetch_failed");
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, []);

  const localizedArticles = useMemo(
    () =>
      articles.map((a) => ({
        ...a,
        title: pickLocale(a.title, a.title_en, locale),
        excerpt: pickLocale(a.excerpt, a.excerpt_en, locale),
        category: pickLocale(a.category, a.category_en, locale),
      })),
    [articles, locale]
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    localizedArticles.forEach((a) => a.category && set.add(a.category));
    return Array.from(set).sort();
  }, [localizedArticles]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return localizedArticles.filter((a) => {
      const matchCategory = activeCategory ? a.category === activeCategory : true;
      const matchSearch =
        !term ||
        a.title.toLowerCase().includes(term) ||
        (a.excerpt ?? "").toLowerCase().includes(term);
      return matchCategory && matchSearch;
    });
  }, [localizedArticles, search, activeCategory]);

  // Reset pagination when filter changes
  useEffect(() => {
    setVisibleCount(9);
  }, [search, activeCategory]);

  const limited = filtered.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  const resetFilters = () => {
    setSearch("");
    setActiveCategory(null);
  };

  return {
    articles,
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
    resetFilters,
  };
}
