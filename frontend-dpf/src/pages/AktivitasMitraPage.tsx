import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faImages } from "@fortawesome/free-solid-svg-icons";
import { LandingLayout } from "@/layouts/LandingLayout";
import { PageHero } from "@/components/PageHero";
import { useLang, type Locale } from "@/lib/i18n";
import { translate } from "@/lib/i18n-utils";
import { galleryMitraDict } from "@/components/gallery-mitra/GalleryMitraI18n";
import http from "@/lib/http";
import GalleryMitraGrid from "@/components/gallery-mitra/GalleryMitraGrid";

type GalleryItem = { id: number; image: string; caption_id: string; caption_en: string };
type GalleryResponse = { data: GalleryItem[]; current_page: number; last_page: number };

export function AktivitasMitraPage() {
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(galleryMitraDict, locale, key, fallback);
  const errorLabel = t("gallery.error");
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    let active = true;
    setLoading(true);
    http.get<GalleryResponse>("/gallery-mitra", { params: { page, per_page: 24 } })
      .then((response) => {
        if (!active) return;
        setItems(response.data.data ?? []);
        setLastPage(response.data.last_page ?? 1);
        setError(null);
      })
      .catch(() => { if (active) { setItems([]); setError(errorLabel); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, errorLabel]);

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
            <GalleryMitraGrid items={items} locale={locale as Locale} emptyLabel={t("gallery.empty")} />
          )}

          {!loading && lastPage > 1 && (
            <div className="mt-10 flex items-center justify-between text-sm font-bold text-slate-600">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-xl px-4 py-2 hover:bg-slate-50 disabled:opacity-40"
              >
                {t("gallery.previous")}
              </button>
              <span>{page} / {lastPage}</span>
              <button
                type="button"
                disabled={page >= lastPage}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-xl px-4 py-2 hover:bg-slate-50 disabled:opacity-40"
              >
                {t("gallery.next")}
              </button>
            </div>
          )}
        </div>
      </main>
    </LandingLayout>
  );
}

export default AktivitasMitraPage;
