import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faBookmark as faBookmarkSolid } from "@fortawesome/free-solid-svg-icons";
import { faBookmark as faBookmarkRegular } from "@fortawesome/free-regular-svg-icons";
import { useSavedItems } from "../lib/SavedItemsContext";
import { LandingLayout } from "../layouts/LandingLayout";
import { useLang } from "../lib/i18n";
import { literasiDict } from "../components/literasi/LiterasiI18n";
import { translate } from "../lib/i18n-utils";

// Detail Components & Logic
import { useLiterasiDetail } from "../components/literasi/detail/useLiterasiDetail.ts";
import { LiterasiDetailHero } from "../components/literasi/detail/LiterasiDetailHero.tsx";
import { LiterasiDetailContent } from "../components/literasi/detail/LiterasiDetailContent.tsx";
import { LiterasiDetailShare } from "../components/literasi/detail/LiterasiDetailShare.tsx";
import { LiterasiDetailRelated } from "../components/literasi/detail/LiterasiDetailRelated.tsx";
import { LiterasiDetailSkeleton } from "../components/literasi/detail/LiterasiDetailSkeleton.tsx";
import { LiterasiDetailPrograms } from "../components/literasi/detail/LiterasiDetailPrograms.tsx";

export function LiterasiDetailPage() {
  const navigate = useNavigate();
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(literasiDict, locale, key, fallback);

  const {
    loading,
    errorKey,
    localizedArticle,
    localizedRelated,
    shareStatus,
    shareText,
    handleShare,
    copyToClipboard,
    article
  } = useLiterasiDetail(locale);

  const { toggleSave, isSaved } = useSavedItems();
  const saved = isSaved(Number(article?.id), 'Article');

  return (
    <LandingLayout>
      <div className="bg-slate-50/70 py-8 sm:py-12">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 min-w-0">
          {/* Top Actions Bar */}
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs hover:border-slate-300 hover:text-slate-900 transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              {t("literasi.detail.back")}
            </button>
            <Link
              to="/literasi"
              className="text-xs sm:text-sm font-semibold text-brandGreen-700 hover:text-brandGreen-800 transition-colors"
            >
              {t("literasi.detail.viewOther")}
            </Link>
            <span className="h-4 w-px bg-slate-200" />
            <button
              type="button"
              onClick={() => toggleSave(Number(article?.id), 'Article')}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs sm:text-sm font-semibold shadow-xs transition-colors ${
                saved 
                  ? "bg-brandGreen-600 text-white border-brandGreen-600 hover:bg-brandGreen-700" 
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <FontAwesomeIcon icon={saved ? faBookmarkSolid : faBookmarkRegular} />
              {saved ? (locale === "en" ? "Saved" : "Tersimpan") : (locale === "en" ? "Save" : "Simpan")}
            </button>
          </div>

          {loading ? (
            <LiterasiDetailSkeleton />
          ) : errorKey ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm font-semibold text-red-700">
              {errorKey === "not_found" ? t("literasi.detail.notFound") : t("literasi.detail.error")}
            </div>
          ) : localizedArticle ? (
            <div className="grid grid-cols-1 gap-10 xl:gap-14 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_400px] items-start min-w-0 max-w-full">
              {/* Kolom Kiri: Artikel Utama dalam 1 Card yang Bersih dan Lega */}
              <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:p-10 shadow-xs min-w-0">
                <LiterasiDetailHero 
                  article={localizedArticle} 
                  locale={locale} 
                  t={t} 
                />

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
              </article>

              {/* Kolom Kanan: Sidebar Program & Berita Terkait */}
              <aside className="space-y-8 lg:sticky lg:top-24 min-w-0 max-w-full">
                {localizedArticle.programs && localizedArticle.programs.length > 0 && (
                  <LiterasiDetailPrograms
                    programs={localizedArticle.programs}
                    locale={locale}
                  />
                )}

                <LiterasiDetailRelated 
                  related={localizedRelated} 
                  locale={locale} 
                  t={t} 
                />
              </aside>
            </div>
          ) : null}
        </div>
      </div>
    </LandingLayout>
  );
}

export default LiterasiDetailPage;

