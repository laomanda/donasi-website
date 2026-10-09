import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faUser, faThumbtack, faBookmark as faBookmarkSolid } from "@fortawesome/free-solid-svg-icons";
import { faBookmark as faBookmarkRegular } from "@fortawesome/free-regular-svg-icons";
import { getImageUrl, formatDate } from "../LiterasiShared.ts";
import { imagePlaceholder } from "@/lib/placeholder";
import type { LiterasiDetail } from "./useLiterasiDetail.ts";

interface LiterasiDetailHeroProps {
  article: LiterasiDetail;
  locale: "id" | "en";
  t: (key: string, fallback?: string) => string;
  saved?: boolean;
  onToggleSave?: () => void;
}

export function LiterasiDetailHero({ article, locale, t, saved, onToggleSave }: LiterasiDetailHeroProps) {
  const videoUrl = article.video_path || (article as any).video_url 
    ? getImageUrl((article as any).video_url || article.video_path) 
    : null;
  const hasVideo = Boolean(videoUrl);
  const [activeMedia, setActiveMedia] = useState<"video" | "image">(hasVideo ? "video" : "image");

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      {/* 1. Header Komposisi Berita: Kategori & Meta -> Judul Headline -> Lead Excerpt */}
      <div className="space-y-3.5">
        {/* Category Badge, Meta Information & Tombol Simpan */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {article.category ? (
              <span className="rounded-md bg-brandGreen-500 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-2xs">
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

          {/* Tombol Simpan / Bookmark Artikel */}
          {onToggleSave && (
            <button
              type="button"
              onClick={onToggleSave}
              className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs sm:text-sm font-semibold shadow-xs transition-colors shrink-0 ${
                saved
                  ? "bg-brandGreen-600 text-white border-brandGreen-600 hover:bg-brandGreen-700"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
              title={saved ? (locale === "en" ? "Remove from saved" : "Hapus dari simpanan") : (locale === "en" ? "Save article" : "Simpan artikel")}
            >
              <FontAwesomeIcon icon={saved ? faBookmarkSolid : faBookmarkRegular} />
              <span>{saved ? (locale === "en" ? "Saved" : "Tersimpan") : (locale === "en" ? "Save" : "Simpan")}</span>
            </button>
          )}
        </div>

        {/* Judul Headline Berita: Proporsional, Tegas & Elegan */}
        <h1 className="font-heading text-xl sm:text-2xl lg:text-[30px] font-extrabold text-slate-900 leading-snug tracking-tight break-words [overflow-wrap:anywhere]">
          {article.title}
        </h1>

        {/* Ringkasan / Lead Deck Berita (Tampil jika ada dan berbeda dari isi utama) */}
        {article.excerpt && article.body && article.excerpt.trim() !== article.body.trim() ? (
          <div className="rounded-xl border-l-4 border-brandGreen-500 bg-slate-50/80 p-3.5 sm:p-4 text-xs sm:text-sm text-slate-600 leading-relaxed italic whitespace-pre-line">
            {article.excerpt}
          </div>
        ) : null}
      </div>

      {/* 2. Media Utama Berita (Featured Photo / Video Showcase) di bawah Headline */}
      {(article.thumbnail_path || hasVideo) && (
        <figure className="space-y-2">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-200/90 bg-slate-900 shadow-2xs">
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

          {/* Caption / Keterangan Foto Utama Berita */}
          <figcaption className="text-center text-[11px] sm:text-xs text-slate-500 italic">
            Foto: {article.title}
          </figcaption>
        </figure>
      )}
    </div>
  );
}

