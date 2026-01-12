import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faArrowLeft, faCircleInfo, faClock, faEye, faTag, faUser } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LandingLayout } from "../layouts/LandingLayout";
import imagePlaceholder from "../brand/assets/image-placeholder.jpg";
import { useLang } from "../lib/i18n";
import { landingDict, translate as translateLanding } from "../i18n/landing";

type PreviewArticle = {
  title?: string | null;
  slug?: string | null;
  category?: string | null;
  excerpt?: string | null;
  body?: string | null;
  status?: string | null;
  author_name?: string | null;
  thumbnail_url?: string | null;
  published_at?: string | null; // datetime-local from editor
};

type PreviewPayload = {
  type: "article";
  created_at?: string | null;
  return_to?: string | null;
  article: PreviewArticle;
};

const sanitizeHtml = (html: string) => {
  return String(html ?? "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
};

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

type BadgeTone = "neutral" | "primary" | "green" | "warning";

const badgeToneTokens = (tone: BadgeTone) => {
  if (tone === "primary") {
    return {
      wrap: "bg-primary-50 text-primary-800 ring-primary-100",
      icon: "text-primary-700",
      dot: "bg-primary-300",
      label: "text-primary-700/80",
    };
  }

  if (tone === "green") {
    return {
      wrap: "bg-brandGreen-50 text-brandGreen-800 ring-brandGreen-100",
      icon: "text-brandGreen-700",
      dot: "bg-brandGreen-300",
      label: "text-brandGreen-700/80",
    };
  }

  if (tone === "warning") {
    return {
      wrap: "bg-amber-50 text-amber-800 ring-amber-100",
      icon: "text-amber-700",
      dot: "bg-amber-300",
      label: "text-amber-700/80",
    };
  }

  return {
    wrap: "bg-slate-50 text-slate-800 ring-slate-200",
    icon: "text-slate-600",
    dot: "bg-slate-300",
    label: "text-slate-500",
  };
};

function InfoBadge({
  icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: IconDefinition;
  label: string;
  value: string;
  tone?: BadgeTone;
}) {
  const tokens = badgeToneTokens(tone);

  return (
    <span
      className={[
        "inline-flex min-w-0 max-w-full items-center gap-2 rounded-full px-3 py-1.5 font-heading text-xs font-semibold ring-1",
        tokens.wrap,
      ].join(" ")}
      title={`${label}: ${value}`}
    >
      <FontAwesomeIcon icon={icon} className={["text-[11px]", tokens.icon].join(" ")} />
      <span className={["text-[11px] font-semibold", tokens.label].join(" ")}>
        {label}
      </span>
      <span className={["h-1.5 w-1.5 rounded-full", tokens.dot].join(" ")} aria-hidden="true" />
      <span className="min-w-0 truncate font-bold">{value}</span>
    </span>
  );
}

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
  const t = (key: string, fallback?: string) => translateLanding(landingDict, locale, key, fallback);

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
  }, [article?.status, locale, t]);

  const publishLabel = useMemo(() => {
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
      <section className="bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              {t("preview.back")}
            </button>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
              <FontAwesomeIcon icon={faEye} className="text-slate-500" />
              {t("preview.chip.preview")}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
              <FontAwesomeIcon icon={faCircleInfo} />
              {t("preview.chip.unsaved")}
            </span>
          </div>

          {errorKey ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {t(errorKey)}
            </div>
          ) : article ? (
            <div className="space-y-8">
              <div className="relative overflow-hidden rounded-[32px] border border-slate-100 bg-slate-100 shadow-soft">
                <img
                  src={thumbnailUrl}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-2xl"
                  onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
                />
                <img
                  src={thumbnailUrl}
                  alt={String(article.title ?? "")}
                  className="relative z-10 h-[260px] w-full object-contain sm:h-[340px]"
                  onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
                />
              </div>

              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <InfoBadge icon={faTag} label={t("preview.meta.category")} value={String(article.category ?? "").trim() || t("preview.meta.category.empty")} tone="green" />
                  <InfoBadge icon={faClock} label={t("preview.meta.published")} value={publishLabel} tone="primary" />
                  <InfoBadge icon={faUser} label={t("preview.meta.author")} value={String(article.author_name ?? "").trim() || t("preview.meta.author.empty")} tone="neutral" />
                  <InfoBadge icon={faCircleInfo} label={t("preview.meta.status")} value={status.label} tone={status.tone} />
                </div>

                <h1 className="mt-5 font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  {String(article.title ?? "").trim() || t("preview.title.empty")}
                </h1>

                {String(article.excerpt ?? "").trim() ? (
                  <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base sm:leading-7">
                    {String(article.excerpt ?? "").trim()}
                  </p>
                ) : null}

                <div
                  className={[
                    "mt-8 break-words text-[15px] leading-7 text-slate-800 sm:text-base sm:leading-8",
                    "[&_h1]:text-2xl [&_h1]:font-heading [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mt-6",
                    "[&_h2]:text-xl [&_h2]:font-heading [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-6",
                    "[&_h3]:text-lg [&_h3]:font-heading [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-5",
                    "[&_p]:mt-4 [&_p]:text-slate-700 [&_strong]:text-slate-900",
                    "[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5",
                    "[&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-5",
                    "[&_li]:mt-1 [&_li]:text-slate-700",
                    "[&_a]:text-primary-700 [&_a]:font-semibold hover:[&_a]:text-primary-800",
                    "[&_blockquote]:mt-5 [&_blockquote]:rounded-2xl [&_blockquote]:border [&_blockquote]:border-slate-200 [&_blockquote]:bg-slate-50 [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote]:text-slate-700",
                    "[&_img]:my-6 [&_img]:block [&_img]:w-full [&_img]:h-auto [&_img]:rounded-2xl [&_img]:shadow-sm [&_img]:ring-1 [&_img]:ring-slate-200",
                  ].join(" ")}
                  {...(isProbablyHtml ? { dangerouslySetInnerHTML: { __html: contentHtml } } : {})}
                >
                  {isProbablyHtml ? null : rawContent ? (
                    <div className="whitespace-pre-wrap">{rawContent}</div>
                  ) : (
                    <p className="text-sm font-semibold text-slate-500">{t("preview.content.empty")}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-600 shadow-sm">
              {t("preview.loading")}
            </div>
          )}
        </div>
      </section>
    </LandingLayout>
  );
}

export default PreviewPage;

