import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faUser, faThumbtack } from "@fortawesome/free-solid-svg-icons";
import { getImageUrl, formatDate } from "../LiterasiShared.ts";
import { imagePlaceholder } from "@/lib/placeholder";
import type { LiterasiDetail } from "./useLiterasiDetail.ts";

interface LiterasiDetailHeroProps {
  article: LiterasiDetail;
  locale: "id" | "en";
  t: (key: string, fallback?: string) => string;
}

export function LiterasiDetailHero({ article, locale, t }: LiterasiDetailHeroProps) {
  const videoUrl = article.video_path || (article as any).video_url 
    ? getImageUrl((article as any).video_url || article.video_path) 
    : null;
  const hasVideo = Boolean(videoUrl);
  const [activeMedia, setActiveMedia] = useState<"video" | "image">(hasVideo ? "video" : "image");

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      {/* Featured Media Showcase (Crisp single image/video, no tacky blur backdrop) */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
        {hasVideo && activeMedia === "video" ? (
          <video
            src={videoUrl!}
            controls
            preload="metadata"
            className="h-full w-full object-contain bg-black"
          />
        ) : (
          <img
            src={getImageUrl(article.thumbnail_path)}
            alt={article.title}
            className="h-full w-full object-cover"
            onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
          />
        )}

        {/* Media Switcher when both Video & Image exist */}
        {hasVideo && (
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveMedia((prev) => (prev === "video" ? "image" : "video"))}
              className="rounded-lg bg-black/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/90"
            >
              {activeMedia === "video" ? "Lihat Foto" : "Tonton Video"}
            </button>
          </div>
        )}
      </div>

      {/* Meta Information, Category, and Title */}
      <div className="space-y-3 pb-6 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-3">
          {article.category ? (
            <span className="rounded-md bg-brandGreen-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              {article.category}
            </span>
          ) : null}

          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <FontAwesomeIcon icon={faClock} className="text-slate-400 text-xs" />
              <span>{formatDate(article.published_at, locale, t)}</span>
            </span>

            {article.author_name ? (
              <>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faUser} className="text-slate-400 text-xs" />
                  <span>{article.author_name}</span>
                </span>
              </>
            ) : null}

            {article.is_pinned ? (
              <>
                <span className="text-slate-300">•</span>
                <span
                  title={locale === "en" ? "Pinned" : "Pilihan"}
                  className="inline-flex items-center gap-1 font-bold text-primary-600"
                >
                  <FontAwesomeIcon icon={faThumbtack} className="text-xs" />
                  <span>{locale === "en" ? "Pinned" : "Pilihan"}</span>
                </span>
              </>
            ) : null}
          </div>
        </div>

        <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight break-words [overflow-wrap:anywhere]">
          {article.title}
        </h1>

        {article.excerpt ? (
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal break-words [overflow-wrap:anywhere] pt-1">
            {article.excerpt}
          </p>
        ) : null}
      </div>
    </div>
  );
}

