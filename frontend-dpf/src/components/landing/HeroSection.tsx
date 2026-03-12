import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandHoldingHeart, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { heroImg } from "@/assets/brand";
import { imagePlaceholder } from "@/lib/placeholder";

export function HeroSection({ 
    error, 
    t 
}: { 
    error: string | null; 
    t: (k: string, f?: string) => string 
}) {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-slate-50"
    >
      <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:gap-10 sm:px-6 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-20">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary-700 shadow-sm">
            {t("landing.hero.badge")}
          </span>
          <h1 className="font-heading text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
            {t("landing.hero.title1")} <span className="text-primary-500">{t("landing.hero.title2")} </span>{t("landing.hero.title3")}
          </h1>
          <p className="max-w-2xl text-2xl text-slate-700">
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
            <div className="relative w-full min-h-[220px] aspect-[4/3] sm:min-h-[320px] sm:aspect-[16/9] lg:min-h-[520px] lg:aspect-auto">
              <img
                src={heroImg}
                alt={t("landing.hero.imageAlt")}
                className="h-auto w-full max-w-full object-contain transition-transform duration-1000 lg:h-full lg:scale-125 lg:object-cover"
                onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
