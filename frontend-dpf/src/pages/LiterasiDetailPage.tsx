import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { LandingLayout } from "../layouts/LandingLayout";
import { useLang } from "../lib/i18n";
import { landingDict, translate as translateLanding } from "../i18n/landing";

// Detail Components & Logic
import { useLiterasiDetail } from "../components/literasi/detail/useLiterasiDetail.ts";
import { LiterasiDetailHero } from "../components/literasi/detail/LiterasiDetailHero.tsx";
import { LiterasiDetailContent } from "../components/literasi/detail/LiterasiDetailContent.tsx";
import { LiterasiDetailShare } from "../components/literasi/detail/LiterasiDetailShare.tsx";
import { LiterasiDetailRelated } from "../components/literasi/detail/LiterasiDetailRelated.tsx";
import { LiterasiDetailSkeleton } from "../components/literasi/detail/LiterasiDetailSkeleton.tsx";

export function LiterasiDetailPage() {
  const navigate = useNavigate();
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translateLanding(landingDict, locale, key, fallback);

  const {
    loading,
    errorKey,
    localizedArticle,
    localizedRelated,
    shareStatus,
    shareText,
    handleShare,
    copyToClipboard
  } = useLiterasiDetail(locale);

  return (
    <LandingLayout>
      <section className="relative overflow-hidden bg-slate-50">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-24 h-[420px] w-[420px] rounded-full bg-primary-100/30 blur-[120px]" />
          <div className="absolute -right-24 top-10 h-[380px] w-[380px] rounded-full bg-brandGreen-100/30 blur-[110px]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary-200 hover:text-primary-700"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              {locale === "en" ? "Back" : "Kembali"}
            </button>
            <Link
              to="/literasi"
              className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition"
            >
              {locale === "en" ? "View other articles" : "Lihat berita lain"}
            </Link>
          </div>

          {loading ? (
            <LiterasiDetailSkeleton />
          ) : errorKey ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorKey === "not_found"
                ? locale === "en"
                  ? "Article not found."
                  : "Artikel tidak ditemukan."
                : locale === "en"
                  ? "Failed to load article. Please try again later."
                  : "Gagal memuat artikel. Coba lagi nanti."}
            </div>
          ) : localizedArticle ? (
            <div className="space-y-10">
              <article className="space-y-6">
                <LiterasiDetailHero 
                  article={localizedArticle} 
                  locale={locale} 
                  t={t} 
                />

                <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <LiterasiDetailContent 
                    body={localizedArticle.body} 
                    excerpt={localizedArticle.excerpt} 
                  />

                  <LiterasiDetailShare
                    shareText={shareText}
                    handleShare={handleShare}
                    copyToClipboard={copyToClipboard}
                    shareStatus={shareStatus}
                    locale={locale}
                  />
                </div>
              </article>

              <LiterasiDetailRelated 
                related={localizedRelated} 
                locale={locale} 
                t={t} 
              />
            </div>
          ) : null}
        </div>
      </section>
    </LandingLayout>
  );
}

export default LiterasiDetailPage;
