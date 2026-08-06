import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faImages, faPlus, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { LandingLayout } from "@/layouts/LandingLayout";
import { PageHero } from "@/components/PageHero";
import { useLang, type Locale } from "@/lib/i18n";
import { translate } from "@/lib/i18n-utils";
import { galleryDpfDict } from "@/components/gallery-dpf/GalleryDpfI18n";
import http from "@/lib/http";
import GalleryDpfGrid from "@/components/gallery-dpf/GalleryDpfGrid";

type GalleryItem = { id: number; image: string; caption_id: string; caption_en: string };
type GalleryResponse = { data: GalleryItem[]; current_page: number; last_page: number };

export function AktivitasDpfPage() {
  const { locale } = useLang();
  const isEn = locale === "en";
  const t = (key: string, fallback?: string) => translate(galleryDpfDict, locale, key, fallback);
  const errorLabel = t("gallery.error");
  const [items, setItems] = useState<GalleryItem[]>([]);
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
      .get<GalleryResponse>("/gallery-dpf", { params: { page: 1, per_page: 15 } })
      .then((response) => {
        if (!active) return;
        const data = response.data.data ?? [];
        setItems(data);
        setHasMore(response.data.current_page < response.data.last_page);
        setError(null);
      })
      .catch(() => {
        if (active) {
          setItems([]);
          setError(errorLabel);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [locale, errorLabel]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const response = await http.get<GalleryResponse>("/gallery-dpf", {
        params: { page: nextPage, per_page: 15 },
      });
      const newData = response.data.data ?? [];
      setItems((prev) => [...prev, ...newData]);
      setPage(nextPage);
      setHasMore(response.data.current_page < response.data.last_page);
    } catch {
      setError(errorLabel);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <LandingLayout>
      <PageHero
        badge={t("gallery.badge")}
        title={t("gallery.title")}
        subtitle={t("gallery.subtitle")}
        breadcrumb={[{ label: t("gallery.breadcrumb") }]}
        rightElement={
          <div className="mx-auto flex aspect-square w-full max-w-sm items-center justify-center rounded-[36px] bg-gradient-to-br from-brandGreen-100 via-white to-primary-100 shadow-inner">
            <FontAwesomeIcon icon={faImages} className="text-8xl text-brandGreen-600/70" />
          </div>
        }
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-primary-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          {t("gallery.back")}
        </Link>
      </PageHero>

      <main className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="columns-1 gap-4 sm:columns-2 md:columns-3 lg:columns-4 space-y-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="break-inside-avoid rounded-2xl bg-slate-100 animate-pulse mb-4"
                  style={{ height: `${200 + (index % 4) * 50}px` }}
                />
              ))}
            </div>
          ) : (
            <GalleryDpfGrid items={items} locale={locale as Locale} emptyLabel={t("gallery.empty")} />
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

export default AktivitasDpfPage;
