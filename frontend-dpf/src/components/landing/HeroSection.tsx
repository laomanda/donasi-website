import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandHoldingHeart, faArrowRight, faCoins } from "@fortawesome/free-solid-svg-icons";
import { heroImg } from "@/assets/brand";
import { imagePlaceholder } from "@/lib/placeholder";
import { formatCurrency } from "./LandingUI";

export function HeroSection({ 
    error, 
    t,
    stats,
    locale = "id"
}: { 
    error: string | null; 
    t: (k: string, f?: string) => string;
    stats?: {
      total_programs?: number;
      total_donations?: number;
      amount_collected?: string | number;
    } | null;
    locale?: "id" | "en";
}) {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-slate-50"
    >
      <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:gap-10 sm:px-6 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-20">
        <div className="space-y-6">
          <h1 className="font-heading text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
            {t("landing.hero.title1")} <span className="text-primary-500">{t("landing.hero.title2")} </span>{t("landing.hero.title3")}
          </h1>
          <p className="max-w-2xl text-xl text-slate-700 leading-relaxed whitespace-pre-line text-justify">
            {t("landing.hero.subtitle")}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/donate"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <FontAwesomeIcon icon={faHandHoldingHeart} className="text-sm" />
              {t("landing.hero.ctaDonate")}
            </Link>
            <Link
              to="/program"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brandGreen-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brandGreen-600"
            >
              <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
              {t("landing.hero.ctaProgram")}
            </Link>
          </div>

          {error && <p className="text-sm text-primary-700">{error}</p>}
        </div>

        <div className="relative">
          <div className="relative overflow-visible">
            <div className="relative w-full min-h-[260px] aspect-[4/3] sm:min-h-[340px] sm:aspect-[16/9] lg:min-h-[520px] lg:aspect-auto flex items-center justify-center">
              <img
                src={heroImg}
                alt={t("landing.hero.imageAlt")}
                width="600"
                height="450"
                loading="eager"
                decoding="async"
                className="h-auto w-full max-w-full object-contain transition-transform duration-1000 lg:h-full lg:scale-125 lg:object-cover"
                onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
              />

              {/* Floating Stat Badge: Total Wakaf Terhimpun */}
              <div className="absolute -bottom-2 left-2 sm:bottom-4 sm:left-4 lg:bottom-8 lg:-left-4 z-10 flex items-center gap-3.5 rounded-2xl sm:rounded-3xl border border-white/80 bg-white/95 p-3.5 sm:p-4 shadow-xl backdrop-blur-md">
                <div className="flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-2xl bg-emerald-50 text-brandGreen-600 shadow-inner ring-1 ring-emerald-100 shrink-0">
                  <FontAwesomeIcon icon={faCoins} className="text-lg sm:text-xl text-brandGreen-600" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                      {locale === "en" ? "Total Wakaf Collected" : "Total Wakaf Terhimpun"}
                    </p>
                  </div>
                  <p className="text-sm sm:text-lg font-heading font-extrabold text-slate-900">
                    {stats?.amount_collected ? formatCurrency(stats.amount_collected, locale) : "Rp 0"}
                  </p>
                  <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400">
                    {locale === "en" ? "From all active programs" : "Dari seluruh program wakaf"}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
