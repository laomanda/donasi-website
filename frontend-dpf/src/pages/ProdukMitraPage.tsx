import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStore, faPlus, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { LandingLayout } from "@/layouts/LandingLayout";
import { PageHero } from "@/components/PageHero";
import { useLang } from "@/lib/i18n";
import { translate } from "@/lib/i18n-utils";
import http from "@/lib/http";
import { mitraProductDict } from "@/components/mitra-products/MitraProductI18n";
import { MitraProductCard, type MitraProductItem } from "@/components/mitra-products/MitraProductCard";

type Response = {
  data: MitraProductItem[];
  current_page: number;
  last_page: number;
};

export default function ProdukMitraPage() {
  const { locale } = useLang();
  const isEn = locale === "en";
  const t = (key: string, fallback?: string) => translate(mitraProductDict, locale, key, fallback);
  const [items, setItems] = useState<MitraProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setPage(1);
    http
      .get<Response>("/mitra-products", { params: { page: 1, per_page: 9 } })
      .then((response) => {
        if (!active) return;
        const data = response.data.data ?? [];
        setItems(data);
        setHasMore(response.data.current_page < response.data.last_page);
        setError(null);
      })
      .catch(() => active && setError(t("product.error")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [locale]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const response = await http.get<Response>("/mitra-products", {
        params: { page: nextPage, per_page: 9 },
      });
      const newData = response.data.data ?? [];
      setItems((prev) => [...prev, ...newData]);
      setPage(nextPage);
      setHasMore(response.data.current_page < response.data.last_page);
    } catch {
      setError(t("product.error"));
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <LandingLayout>
      <PageHero
        badge={t("product.badge")}
        title={t("product.title")}
        subtitle={t("product.subtitle")}
        breadcrumb={[{ label: t("product.badge") }]}
        rightElement={
          <div className="mx-auto flex aspect-square w-full max-w-sm items-center justify-center rounded-[36px] bg-gradient-to-br from-primary-100 via-white to-brandGreen-100 shadow-inner">
            <FontAwesomeIcon icon={faStore} className="text-8xl text-primary-600/70" />
          </div>
        }
      />

      <main className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {error && (
            <p className="mb-6 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">
              {error}
            </p>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="aspect-[4/3] animate-pulse rounded-3xl bg-slate-100" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="rounded-[28px] border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center text-sm font-semibold text-slate-500">
              {t("product.empty")}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <MitraProductCard key={item.id} product={item} locale={locale as "id" | "en"} />
              ))}
            </div>
          )}

          {!loading && hasMore && (
            <div className="mt-12 text-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-8 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-brandGreen-700 disabled:opacity-60 active:scale-95"
              >
                <FontAwesomeIcon
                  icon={loadingMore ? faSpinner : faPlus}
                  className={loadingMore ? "animate-spin text-sm" : "text-xs"}
                />
                <span>
                  {loadingMore
                    ? isEn
                      ? "Loading..."
                      : "Memuat..."
                    : isEn
                    ? "Load More"
                    : "Muat Lebih Banyak"}
                </span>
              </button>
            </div>
          )}
        </div>
      </main>
    </LandingLayout>
  );
}
