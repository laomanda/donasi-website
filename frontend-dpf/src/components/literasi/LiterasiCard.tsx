import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark as faBookmarkSolid, faTrash } from "@fortawesome/free-solid-svg-icons";
import { faBookmark as faBookmarkRegular } from "@fortawesome/free-regular-svg-icons";
import { imagePlaceholder } from "@/lib/placeholder";
import { useSavedItems } from "@/lib/SavedItemsContext";
import type { Literasi } from "./LiterasiShared.ts";
import { getImageUrl, formatDate } from "./LiterasiShared.ts";

interface LiterasiCardProps {
  article: Literasi;
  locale: "id" | "en";
  t: (key: string, fallback?: string) => string;
  variant?: "save" | "remove";
}

export function LiterasiCard({ article, locale, t, variant = "save" }: LiterasiCardProps) {
  const { toggleSave, isSaved } = useSavedItems();
  const saved = isSaved(Number(article.id), 'Article');

  const author = (article.author_name ?? "").trim();
  const authorLabel = author !== "" ? author : t("literasi.articles.anonymous");
  const isAnonymous = author === "";
  const initials = authorLabel
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.slice(0, 1))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article 
      className="group relative flex h-full flex-col overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
      style={{ minHeight: "480px" }}
    >
      <Link to={`/literasi/${article.slug}`} className="block">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
          <img
            src={getImageUrl(article.thumbnail_path)}
            alt={article.title}
            className="h-full w-full object-cover"
            onError={(evt) => {
              const target = evt.target as HTMLImageElement;
              if (target.src !== imagePlaceholder) target.src = imagePlaceholder;
            }}
          />
          <div className="absolute left-4 top-4 flex items-center gap-2 text-xs font-semibold text-white">
            <span className="rounded-full uppercase font-heading bg-primary-600 px-2 py-1 text-[11px] font-semibold text-white shadow-sm">
              {article.category ?? t("literasi.articles.category.default", "Literasi")}
            </span>
          </div>
        </div>
      </Link>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleSave(Number(article.id), 'Article');
        }}
        className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all active:scale-90 ${
          variant === "remove"
            ? "bg-red-50 text-red-500 hover:bg-red-100 shadow-sm border border-red-100"
            : saved 
              ? "bg-primary-600 text-white shadow-lg" 
              : "bg-white/70 text-slate-700 hover:bg-white hover:text-primary-600"
        }`}
        title={variant === "remove" ? "Hapus dari simpanan" : (saved ? "Hapus dari simpanan" : "Simpan artikel")}
      >
        <FontAwesomeIcon icon={variant === "remove" ? faTrash : (saved ? faBookmarkSolid : faBookmarkRegular)} className="text-sm" />
      </button>

      <div className="flex flex-1 flex-col p-5">
        {/* The old category span is removed as it's replaced by the absolute positioned one */}
        <h3 className="mt-4 line-clamp-2 min-h-[56px] font-heading text-lg font-semibold leading-snug text-slate-900">
          <Link to={`/literasi/${article.slug}`}>{article.title}</Link>
        </h3>

        <p className="mt-3 line-clamp-3 min-h-[72px] text-sm leading-relaxed text-slate-600">
          {article.excerpt}
        </p>

        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brandGreen-50 text-xs font-bold text-brandGreen-700 ring-1 ring-brandGreen-100">
              {initials || "A"}
            </span>
            <div className="leading-tight">
              <p className="text-xs font-semibold text-slate-700">{authorLabel}</p>
              <p className="text-[11px] text-slate-500">
                {isAnonymous ? t("literasi.articles.anonymous") : t("literasi.articles.author")}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500">{formatDate(article.published_at, locale, t)}</span>
        </div>
      </div>
    </article>
  );
}
