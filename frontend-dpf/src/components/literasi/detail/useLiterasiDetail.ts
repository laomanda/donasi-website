import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import http from "../../../lib/http";
import { pickLocale } from "../LiterasiShared.ts";

export type LiterasiDetail = {
  id: number;
  slug: string;
  title: string;
  title_en?: string | null;
  excerpt?: string | null;
  excerpt_en?: string | null;
  body?: string | null;
  body_en?: string | null;
  category?: string | null;
  category_en?: string | null;
  published_at?: string | null;
  thumbnail_path?: string | null;
  author_name?: string | null;
};

export type LiterasiDetailResponse = {
  article: LiterasiDetail;
  related: LiterasiDetail[];
};

export function useLiterasiDetail(locale: "id" | "en") {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<LiterasiDetail | null>(null);
  const [related, setRelated] = useState<LiterasiDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorKey, setErrorKey] = useState<"not_found" | "load_failed" | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  const localizedArticle = useMemo(() => {
    if (!article) return null;
    return {
      ...article,
      title: pickLocale(article.title, article.title_en, locale),
      excerpt: pickLocale(article.excerpt, article.excerpt_en, locale),
      body: pickLocale(article.body, article.body_en, locale),
      category: pickLocale(article.category, article.category_en, locale),
    };
  }, [article, locale]);

  const localizedRelated = useMemo(
    () =>
      related.map((r) => ({
        ...r,
        title: pickLocale(r.title, r.title_en, locale),
        excerpt: pickLocale(r.excerpt, r.excerpt_en, locale),
        category: pickLocale(r.category, r.category_en, locale),
      })),
    [related, locale]
  );

  useEffect(() => {
    if (!slug) {
      setErrorKey("not_found");
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    http
      .get<LiterasiDetailResponse>(`/articles/${slug}`)
      .then((res) => {
        if (!active) return;
        setArticle(res.data.article);
        setRelated(res.data.related ?? []);
        setErrorKey(null);
      })
      .catch(() => {
        if (!active) return;
        setErrorKey("load_failed");
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  const shareUrl = typeof window !== "undefined" && slug ? `${window.location.origin}/literasi/${slug}` : "";
  const shareText = localizedArticle?.title ? `${localizedArticle.title} - ${shareUrl}` : shareUrl;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: localizedArticle?.title ?? (locale === "en" ? "DPF Articles" : "Literasi DPF"),
          text: localizedArticle?.excerpt ?? localizedArticle?.title ?? "",
          url: shareUrl,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setShareStatus(locale === "en" ? "Link copied" : "Tautan disalin");
        setTimeout(() => setShareStatus(null), 2000);
      }
    } catch {
      setShareStatus(locale === "en" ? "Failed to share" : "Gagal membagikan");
      setTimeout(() => setShareStatus(null), 2000);
    }
  };

  const copyToClipboard = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus(locale === "en" ? "Link copied" : "Tautan disalin");
      setTimeout(() => setShareStatus(null), 2000);
    }
  };

  return {
    slug,
    article,
    localizedArticle,
    localizedRelated,
    loading,
    errorKey,
    shareStatus,
    setShareStatus,
    shareUrl,
    shareText,
    handleShare,
    copyToClipboard
  };
}
