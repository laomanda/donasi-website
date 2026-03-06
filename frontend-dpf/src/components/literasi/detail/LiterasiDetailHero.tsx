import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faTag, faUser } from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { getImageUrl, formatDate } from "../LiterasiShared.ts";
import { imagePlaceholder } from "@/lib/placeholder";
import type { LiterasiDetail } from "./useLiterasiDetail.ts";

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

interface LiterasiDetailHeroProps {
  article: LiterasiDetail;
  locale: "id" | "en";
  t: (key: string, fallback?: string) => string;
}

export function LiterasiDetailHero({ article, locale, t }: LiterasiDetailHeroProps) {
  return (
    <div className="space-y-6">
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
          alt={article.title}
          className="relative z-10 h-full w-full object-cover"
          onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
        />
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          {article.category ? (
            <InfoBadge 
              icon={faTag} 
              label={locale === "en" ? "Category" : "Kategori"} 
              value={article.category} 
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
          {article.title}
        </h1>
        {article.excerpt ? (
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base sm:leading-7">
            {article.excerpt}
          </p>
        ) : null}
      </div>
    </div>
  );
}
