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
      <div className="bg-slate-50/70 pt-10 sm:pt-14 lg:pt-16 pb-16 sm:pb-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 min-w-0">
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
                  saved={saved}
                  onToggleSave={() => toggleSave(Number(localizedArticle?.id ?? article?.id), 'Article')}
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

