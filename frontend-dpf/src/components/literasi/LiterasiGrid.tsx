import { LiterasiCard } from "./LiterasiCard.tsx";
import { LiterasiSkeleton } from "./LiterasiSkeleton.tsx";
import type { Literasi } from "./LiterasiShared.ts";

interface LiterasiGridProps {
  articles: Literasi[];
  loading: boolean;
  totalFiltered: number;
  onLoadMore: () => void;
  hasMore: boolean;
  locale: "id" | "en";
  t: (key: string, fallback?: string) => string;
}

export function LiterasiGrid({
  articles,
  loading,
  onLoadMore,
  hasMore,
  locale,
  t
}: LiterasiGridProps) {
  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {loading &&
            Array.from({ length: 6 }).map((_, idx) => <LiterasiSkeleton key={`art-skel-${idx}`} />)}

          {!loading && articles.map((article) => (
            <LiterasiCard key={article.id} article={article} locale={locale} t={t} />
          ))}
        </div>

        {!loading && hasMore && (
          <div className="mt-12 text-center">
            <button
              onClick={onLoadMore}
              className="inline-flex items-center gap-2 rounded-full bg-primary-700 px-8 py-3 text-sm font-bold text-white shadow-md ring-1 ring-slate-200 transition hover:bg-primary-800 hover:shadow-lg active:scale-95"
            >
              {t("program.loadMore", "Lihat Lebih Banyak")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
