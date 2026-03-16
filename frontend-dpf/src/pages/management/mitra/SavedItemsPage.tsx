import { useEffect, useState } from "react";
import http from "../../../lib/http";
import { useLang } from "../../../lib/i18n";
import { mitraDict, translate } from "../../../i18n/mitra";
import { programDict } from "../../../components/programs/ProgramI18n";
import { literasiDict } from "../../../components/literasi/LiterasiI18n";
import { MitraPageHeader } from "../../../components/management/mitra/shared/MitraPageHeader";
import { ProgramCard } from "../../../components/programs/ProgramCard";
import { LiterasiCard } from "../../../components/literasi/LiterasiCard";
import type { Program } from "../../../components/programs/ProgramShared";
import type { Literasi } from "../../../components/literasi/LiterasiShared";
import { useSavedItems } from "../../../lib/SavedItemsContext";

const combinedDict = { ...mitraDict, ...programDict, ...literasiDict };

export function SavedItemsPage() {
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [articles, setArticles] = useState<Literasi[]>([]);
  const [activeTab, setActiveTab] = useState<'programs' | 'articles'>('programs');

  const [visiblePrograms, setVisiblePrograms] = useState(6);
  const [visibleArticles, setVisibleArticles] = useState(6);

  const { locale } = useLang();
  const { savedItems } = useSavedItems(); // Watch for changes
  const t = (key: string, fallback?: string) => translate(combinedDict as any, locale, key, fallback);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await http.get('/mitra/saved-items');
        setPrograms(res.data.programs || []);
        setArticles(res.data.articles || []);
      } catch (err) {
        console.error("Failed to fetch saved items:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [savedItems]); // Re-fetch when items are toggled

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <MitraPageHeader
        title={t("mitra.saved_items_title", "Item Tersimpan")}
        subtitle={t("mitra.saved_items_subtitle", "Lihat daftar program dan artikel yang Anda simpan.")}
      />

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('programs')}
          className={`px-6 py-3 text-sm font-semibold transition-colors relative ${
            activeTab === 'programs' ? 'text-brandGreen-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {t("mitra.saved_programs", "Program Tersimpan")}
          {activeTab === 'programs' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brandGreen-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('articles')}
          className={`px-6 py-3 text-sm font-semibold transition-colors relative ${
            activeTab === 'articles' ? 'text-brandGreen-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {t("mitra.saved_articles", "Artikel Tersimpan")}
          {activeTab === 'articles' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brandGreen-600" />
          )}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-96 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {activeTab === 'programs' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs.length > 0 ? (
                  programs.slice(0, visiblePrograms).map((program) => (
                    <ProgramCard key={program.id} program={program} locale={locale as 'id'|'en'} t={t} variant="remove" />
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                    <p className="text-slate-500">{t("mitra.no_saved_programs", "Belum ada program yang disimpan.")}</p>
                  </div>
                )}
              </div>
              
              {programs.length > visiblePrograms && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => setVisiblePrograms(prev => prev + 6)}
                    className="px-8 py-3 rounded-full border-2 border-brandGreen-600 text-brandGreen-600 font-bold hover:bg-brandGreen-600 hover:text-white transition-all active:scale-95 shadow-sm"
                  >
                    {t("common.load_more", "Lihat Lebih Banyak")}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'articles' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.length > 0 ? (
                  articles.slice(0, visibleArticles).map((article) => (
                    <LiterasiCard key={article.id} article={article} locale={locale as 'id'|'en'} t={t} variant="remove" />
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                    <p className="text-slate-500">{t("mitra.no_saved_articles", "Belum ada artikel yang disimpan.")}</p>
                  </div>
                )}
              </div>

              {articles.length > visibleArticles && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => setVisibleArticles(prev => prev + 6)}
                    className="px-8 py-3 rounded-full border-2 border-brandGreen-600 text-brandGreen-600 font-bold hover:bg-brandGreen-600 hover:text-white transition-all active:scale-95 shadow-sm"
                  >
                    {t("common.load_more", "Lihat Lebih Banyak")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
