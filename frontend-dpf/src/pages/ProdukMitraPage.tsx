import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faStore } from "@fortawesome/free-solid-svg-icons";
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
  const t = (key: string, fallback?: string) => translate(mitraProductDict, locale, key, fallback);
  const [items, setItems] = useState<MitraProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    let active = true;
    setLoading(true);
    http
      .get<Response>("/mitra-products", { params: { page, per_page: 12 } })
      .then((response) => {
        if (!active) return;
        setItems(response.data.data ?? []);
        setLastPage(response.data.last_page ?? 1);
        setError(null);
      })
      .catch(() => active && setError(t("product.error")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [page, locale]);

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
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-primary-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          {t("product.backHome", "Kembali ke beranda")}
        </Link>
      </PageHero>

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

          {!loading && lastPage > 1 && (
            <div className="mt-10 flex items-center justify-between text-sm font-bold text-slate-600">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
                className="rounded-xl px-4 py-2 hover:bg-slate-50 disabled:opacity-40"
              >
                ←
              </button>
              <span>
                {page} / {lastPage}
              </span>
              <button
                type="button"
                disabled={page >= lastPage}
                onClick={() => setPage((value) => value + 1)}
                className="rounded-xl px-4 py-2 hover:bg-slate-50 disabled:opacity-40"
              >
                →
              </button>
            </div>
          )}
        </div>
      </main>
    </LandingLayout>
  );
}
