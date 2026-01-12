import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowLeft,
  faClock,
  faLink,
  faShareNodes,
  faTag,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { LandingLayout } from "../layouts/LandingLayout";
import http from "../lib/http";
import { resolveStorageBaseUrl } from "../lib/urls";
import imagePlaceholder from "../brand/assets/image-placeholder.jpg";
import { useLang } from "../lib/i18n";
import { landingDict, translate as translateLanding } from "../i18n/landing";

type PublicArticle = {
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

const pickLocale = (idVal?: string | null, enVal?: string | null, locale: "id" | "en" = "id") => {
  const idText = (idVal ?? "").trim();
  const enText = (enVal ?? "").trim();
  if (locale === "en") return enText || idText;
  return idText || enText;
};

type ArticleShowResponse = {
  article: PublicArticle;
  related: PublicArticle[];
};

const formatDate = (value?: string | null, locale: "id" | "en" = "id", t?: (key: string, fallback?: string) => string) => {
  if (!value) return t ? t("landing.common.soon") : locale === "en" ? "Soon" : "Segera";
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
};

const getImageUrl = (path?: string | null) => {
  if (!path) return imagePlaceholder;
  if (path.startsWith("http")) return path;
  const base = resolveStorageBaseUrl();
  return `${base}/${path}`;
};

const sanitizeHtml = (html: string) => {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
};

type BadgeTone = "neutral" | "primary" | "green";

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

export function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translateLanding(landingDict, locale, key, fallback);

  const [article, setArticle] = useState<PublicArticle | null>(null);
  const [related, setRelated] = useState<PublicArticle[]>([]);
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
      .get<ArticleShowResponse>(`/articles/${slug}`)
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

  const shareUrl = typeof window !== "undefined" && slug ? `${window.location.origin}/articles/${slug}` : "";
  const shareText = localizedArticle?.title ? `${localizedArticle.title} - ${shareUrl}` : shareUrl;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: localizedArticle?.title ?? (locale === "en" ? "DPF Article" : "Artikel DPF"),
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

  const isProbablyHtml = useMemo(() => {
    const body = String(localizedArticle?.body ?? "");
    return /<\/?(p|div|span|h1|h2|h3|h4|ul|ol|li|br|strong|em|img|a|blockquote)\b/i.test(body);
  }, [localizedArticle?.body]);

  const rawContent = useMemo(() => {
    return String(localizedArticle?.body ?? localizedArticle?.excerpt ?? "");
  }, [localizedArticle?.body, localizedArticle?.excerpt]);

  const contentHtml = useMemo(() => {
    if (!rawContent) return "";
    if (isProbablyHtml) return sanitizeHtml(rawContent);
    return sanitizeHtml(rawContent.replace(/\n/g, "<br/>"));
  }, [isProbablyHtml, rawContent]);

  return (
    <LandingLayout>
      <section className="relative overflow-hidden bg-slate-50">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-24 h-[420px] w-[420px] rounded-full bg-primary-100/30 blur-[120px]" />
          <div className="absolute -right-24 top-10 h-[380px] w-[380px] rounded-full bg-brandGreen-100/30 blur-[110px]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary-200 hover:text-primary-700"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              {locale === "en" ? "Back" : "Kembali"}
            </button>
            <Link
              to="/literasi"
              className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition"
            >
              {locale === "en" ? "View other articles" : "Lihat berita lain"}
            </Link>
          </div>

          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-64 w-full rounded-3xl bg-slate-100" />
              <div className="h-6 w-3/4 rounded-full bg-slate-100" />
              <div className="h-4 w-1/2 rounded-full bg-slate-100" />
              <div className="space-y-3">
                <div className="h-4 w-full rounded-full bg-slate-100" />
                <div className="h-4 w-5/6 rounded-full bg-slate-100" />
                <div className="h-4 w-2/3 rounded-full bg-slate-100" />
                <div className="h-4 w-4/5 rounded-full bg-slate-100" />
              </div>
            </div>
          ) : errorKey ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorKey === "not_found"
                ? locale === "en"
                  ? "Article not found."
                  : "Artikel tidak ditemukan."
                : locale === "en"
                  ? "Failed to load article. Please try again later."
                  : "Gagal memuat artikel. Coba lagi nanti."}
            </div>
          ) : article && localizedArticle ? (
            <div className="space-y-10">
              <article className="space-y-6">
                <div className="relative aspect-[16/9] overflow-hidden rounded-[32px] border border-slate-100 bg-slate-100 shadow-soft">
                  <img
                    src={getImageUrl(article.thumbnail_path)}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-2xl"
                    onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
                  />
                  <img
                    src={getImageUrl(article.thumbnail_path)}
                    alt={localizedArticle.title}
                    className="relative z-10 h-full w-full object-cover"
                    onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
                  />
                </div>

                <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex flex-wrap items-center gap-2">
                    {localizedArticle.category ? (
                      <InfoBadge 
                        icon={faTag} 
                        label={locale === "en" ? "Category" : "Kategori"} 
                        value={localizedArticle.category} 
                    tone="green" 
                  />
                ) : null}
                <InfoBadge 
                  icon={faClock} 
                  label={locale === "en" ? "Published" : "Terbit"} 
                  value={formatDate(article.published_at, locale, t)} 
                  tone="primary" 
                />
                {article.author_name ? (
                  <InfoBadge 
                    icon={faUser} 
                        label={locale === "en" ? "Author" : "Penulis"} 
                        value={article.author_name} 
                        tone="green" 
                      />
                    ) : null}
                  </div>

                  <h1 className="mt-5 font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                    {localizedArticle.title}
                  </h1>
                  {localizedArticle.excerpt ? (
                    <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base sm:leading-7">
                      {localizedArticle.excerpt}
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
                    {isProbablyHtml ? null : <div className="whitespace-pre-wrap">{rawContent}</div>}
                  </div>

                  <div className="mt-10 border-t border-slate-100 pt-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-500">{locale === "en" ? "Share" : "Bagikan"}</p>
                        <p className="mt-1 text-sm font-semibold text-slate-600">
                          {locale === "en" ? "Share this useful information." : "Sebarkan informasi bermanfaat ini."}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={handleShare}
                          className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
                        >
                          <FontAwesomeIcon icon={faShareNodes} />
                          {locale === "en" ? "Share" : "Bagikan"}
                        </button>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-brandGreen-200 bg-brandGreen-50 px-4 py-2.5 text-sm font-semibold text-brandGreen-700 transition hover:bg-brandGreen-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandGreen-200"
                        >
                          <FontAwesomeIcon icon={faWhatsapp} />
                          WhatsApp
                        </a>
                        <button
                          type="button"
                          onClick={async () => {
                            await navigator.clipboard?.writeText(shareUrl);
                            setShareStatus(locale === "en" ? "Link copied" : "Tautan disalin");
                            setTimeout(() => setShareStatus(null), 2000);
                          }}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary-200 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
                        >
                          <FontAwesomeIcon icon={faLink} />
                          {locale === "en" ? "Copy link" : "Salin tautan"}
                        </button>
                        {shareStatus ? (
                          <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700 ring-1 ring-primary-100">
                            {shareStatus}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">{locale === "en" ? "Recommendation" : "Rekomendasi"}</p>
                    <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">{locale === "en" ? "Related articles" : "Berita terkait"}</h2>
                  </div>
                  <Link to="/literasi" className="text-sm font-bold text-primary-600 hover:text-primary-700">
                    {locale === "en" ? "View all" : "Lihat semua"}
                  </Link>
                </div>

                {localizedRelated.length === 0 ? (
                  <p className="mt-6 text-sm font-semibold text-slate-500">{locale === "en" ? "No related articles yet." : "Belum ada berita terkait."}</p>
                ) : (
                  <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {localizedRelated.slice(0, 3).map((item) => (
                      <Link
                        key={item.id}
                        to={`/articles/${item.slug}`}
                        className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary-100 hover:shadow-soft"
                      >
                        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                          <img
                            src={getImageUrl(item.thumbnail_path)}
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-xl"
                            onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
                          />
                          <img
                            src={getImageUrl(item.thumbnail_path)}
                            alt={item.title}
                            className="relative z-10 h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-100"
                            onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
                          />
                        </div>
                        <div className="p-5">
                          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                            {item.category ? (
                              <span className="inline-flex min-w-0 max-w-full items-center rounded-full bg-brandGreen-50 px-3 py-1 text-[11px] font-semibold text-brandGreen-700 ring-1 ring-brandGreen-100 sm:max-w-[14rem] truncate">
                                {locale === "en" ? "Category" : "Kategori"}: {item.category}
                              </span>
                            ) : null}
                            <span>{locale === "en" ? "Published" : "Terbit"}: {formatDate(related.find(r => r.id === item.id)?.published_at, locale, t)}</span>
                          </div>
                          <h3 className="mt-2 line-clamp-2 font-heading text-base font-bold text-slate-900 group-hover:text-primary-700">
                            {item.title}
                          </h3>
                          {item.excerpt && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{item.excerpt}</p>}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </div>
          ) : null}
        </div>
      </section>
    </LandingLayout>
  );
}

export default ArticleDetailPage;
