import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LandingLayout } from "../../../layouts/LandingLayout";
import { imagePlaceholder } from "@/lib/placeholder";
import { useLang } from "../../../lib/i18n";
import { translate } from "../../../lib/i18n-utils";
import { literasiDict } from "../../../components/literasi/LiterasiI18n";
import { sanitizeHtml } from "../../../lib/sanitize";

// Preview Components
import type { PreviewPayload } from "../../../components/management/editor/article/preview/ArticlePreviewTypes";
import { SectionWrapper, ErrorState, LoadingState } from "../../../components/management/editor/article/preview/ArticlePreviewUI";
import ArticlePreviewHeader from "../../../components/management/editor/article/preview/ArticlePreviewHeader";
import ArticlePreviewHero from "../../../components/management/editor/article/preview/ArticlePreviewHero";
import ArticlePreviewContent from "../../../components/management/editor/article/preview/ArticlePreviewContent";

/* --- Helpers --- */

const formatDate = (value: string | null | undefined, locale: "id" | "en" = "id") => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const normalizeStatus = (value: string, t: (key: string, fallback?: string) => string) => {
  const status = String(value ?? "").toLowerCase().trim();
  if (status === "published") return { label: t("preview.status.published"), tone: "green" as const };
  if (status === "review") return { label: t("preview.status.review"), tone: "warning" as const };
  return { label: t("preview.status.draft"), tone: "neutral" as const };
};

export function PreviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(literasiDict, locale, key, fallback);

  const storageKey = useMemo(() => {
    return String(searchParams.get("key") ?? "dpf_preview_article_new").trim();
  }, [searchParams]);

  const previewType = useMemo(() => {
    return String(searchParams.get("type") ?? "article").trim();
  }, [searchParams]);

  const [payload, setPayload] = useState<PreviewPayload | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  useEffect(() => {
    if (previewType !== "article") {
      setPayload(null);
      setErrorKey("preview.error.unknownType");
      return;
    }

    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        setPayload(null);
        setErrorKey("preview.error.notFound");
        return;
      }
      const parsed = JSON.parse(raw) as PreviewPayload;
      if (!parsed || parsed.type !== "article" || !parsed.article) {
        setPayload(null);
        setErrorKey("preview.error.invalidFormat");
        return;
      }
      setPayload(parsed);
      setErrorKey(null);
    } catch {
      setPayload(null);
      setErrorKey("preview.error.readFail");
    }
  }, [previewType, storageKey]);

  const article = payload?.article ?? null;

  const status = useMemo(() => {
    return normalizeStatus(article?.status ?? "draft", t);
  }, [article?.status, t]);

  const publishLabelValue = useMemo(() => {
    if (!article) return "";
    if (String(article.status ?? "").toLowerCase() !== "published") return t("preview.publish.notPublished");
    const formatted = formatDate(article.published_at ?? "", locale);
    return formatted || t("preview.publish.pending");
  }, [article, locale, t]);

  const thumbnailUrl = useMemo(() => {
    const url = String(article?.thumbnail_url ?? "").trim();
    return url || imagePlaceholder;
  }, [article?.thumbnail_url]);

  const isProbablyHtml = useMemo(() => {
    const body = String(article?.body ?? "");
    return /<\/?(p|div|span|h1|h2|h3|h4|ul|ol|li|br|strong|em|img|a|blockquote)\b/i.test(body);
  }, [article?.body]);

  const rawContent = useMemo(() => {
    return String(article?.body ?? article?.excerpt ?? "");
  }, [article?.body, article?.excerpt]);

  const contentHtml = useMemo(() => {
    if (!rawContent) return "";
    if (isProbablyHtml) return sanitizeHtml(rawContent);
    return sanitizeHtml(rawContent.replace(/\n/g, "<br/>"));
  }, [isProbablyHtml, rawContent]);

  const onBack = () => {
    if (typeof window !== "undefined" && window.opener) {
      window.close();
      return;
    }

    const returnTo = String(payload?.return_to ?? "").trim();
    if (returnTo) {
      navigate(returnTo);
      return;
    }
    navigate(-1);
  };

  return (
    <LandingLayout>
      <SectionWrapper>
        <ArticlePreviewHeader 
          onBack={onBack} 
          backLabel={t("preview.back")}
          previewLabel={t("preview.chip.preview")}
          unsavedLabel={t("preview.chip.unsaved")}
        />

        {errorKey ? (
          <ErrorState title={t(errorKey)} />
        ) : article ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ArticlePreviewHero 
              thumbnailUrl={thumbnailUrl} 
              title={String(article.title ?? "")} 
            />

            <ArticlePreviewContent 
              category={String(article.category ?? "").trim() || t("preview.meta.category.empty")}
              categoryLabel={t("preview.meta.category")}
              publishLabel={t("preview.meta.published")}
              publishedLabel={publishLabelValue}
              author={String(article.author_name ?? "").trim() || t("preview.meta.author.empty")}
              authorLabel={t("preview.meta.author")}
              statusLabel={t("preview.meta.status")}
              statusText={status.label}
              statusTone={status.tone}
              title={String(article.title ?? "").trim() || t("preview.title.empty")}
              excerpt={String(article.excerpt ?? "").trim()}
              contentHtml={contentHtml}
              isProbablyHtml={isProbablyHtml}
              rawContent={rawContent}
              emptyContentLabel={t("preview.content.empty")}
            />
          </div>
        ) : (
          <LoadingState label={t("preview.loading")} />
        )}
      </SectionWrapper>
    </LandingLayout>
  );
}

export default PreviewPage;

