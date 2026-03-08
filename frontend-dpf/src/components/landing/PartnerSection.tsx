import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandshake } from "@fortawesome/free-solid-svg-icons";
import { type Partner, getImageUrl, pickLocale } from "./LandingUI";
import { imagePlaceholder } from "@/lib/placeholder";

export function PartnerSection({ 
    partners, 
    t, 
    locale,
    loading = false
}: { 
    partners: Partner[]; 
    t: (k: string, f?: string) => string; 
    locale: "id" | "en";
    loading?: boolean;
}) {
  const hasPartners = partners.length > 0;

  const buildMarqueeList = (items: Partner[]) => {
    if (!items.length) return [];
    const minCards = 12; // ensure track long enough for large screens
    let base = [...items];
    while (base.length < minCards) {
      base = base.concat(items);
    }
    return [...base, ...base]; // two identical halves for seamless -50% animation
  };

  const midpoint = Math.ceil(partners.length / 2);
  const firstBatch = partners.slice(0, midpoint);
  const secondBatch = partners.slice(midpoint);
  const marqueePartners = buildMarqueeList(firstBatch);
  const marqueePartnersReverse = buildMarqueeList(secondBatch.length ? secondBatch : firstBatch);

  return (
    <section className="bg-slate-50 py-24 overflow-hidden border-t border-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-accent font-bold uppercase tracking-[0.2em] text-brandGreen-600/80">
            {t("landing.partners.badge")}
          </p>
          <h2 className="mt-3 text-3xl font-heading font-bold text-slate-900 sm:text-4xl">
            {t("landing.partners.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-500">
            {t("landing.partners.subtitle")}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="relative">
          <div className="flex flex-col gap-6 overflow-hidden py-6">
            <div className="flex w-max items-center gap-8 animate-pulse pl-8">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={`skeleton-f-${i}`}
                  className="h-[110px] w-[220px] flex-none rounded-2xl bg-slate-200/60 shadow-sm"
                />
              ))}
            </div>
            <div className="flex w-max items-center gap-8 animate-pulse pr-8 self-end">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={`skeleton-r-${i}`}
                  className="h-[110px] w-[220px] flex-none rounded-2xl bg-slate-200/60 shadow-sm"
                />
              ))}
            </div>
          </div>
        </div>
      ) : hasPartners ? (
        <div className="relative">
          {/* Gradient Overlays */}
          <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-24 bg-gradient-to-r from-slate-50 via-slate-50/90 to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-24 bg-gradient-to-l from-slate-50 via-slate-50/90 to-transparent" />

          <div className="flex flex-col gap-6 overflow-hidden py-6">
            {/* Forward Marquee */}
            <div className="animate-marquee flex w-max items-center gap-8 hover:[animation-play-state:paused]">
              {marqueePartners.map((partner, idx) => (
                <div
                  key={`forward-${partner.id}-${idx}`}
                  className="group relative flex h-[110px] w-[220px] flex-none items-center justify-center rounded-2xl border border-transparent bg-transparent p-4 transition-all duration-300"
                >
                  <div className="relative h-16 w-full transition-all duration-500 group-hover:scale-105">
                    <img
                      src={getImageUrl(partner.logo_path)}
                      alt={pickLocale(partner.name, partner.name_en, locale)}
                      className="h-full w-full object-contain"
                      onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
                    />
                  </div>

                  <div className="pointer-events-none absolute -bottom-3 left-1/2 flex -translate-x-1/2 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="whitespace-nowrap rounded-full bg-gradient-to-r from-brandGreen-600 to-primary-600 px-3 py-1 text-[10px] font-semibold tracking-wide text-white shadow-lg shadow-brandGreen-800/30 backdrop-blur-sm">
                      {pickLocale(partner.name, partner.name_en, locale)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Reverse Marquee */}
            <div className="animate-marquee-reverse flex w-max items-center gap-8 hover:[animation-play-state:paused]">
              {marqueePartnersReverse.map((partner, idx) => (
                <div
                  key={`reverse-${partner.id}-${idx}`}
                  className="group relative flex h-[110px] w-[220px] flex-none items-center justify-center rounded-2xl border border-transparent bg-transparent p-4 transition-all duration-300"
                >
                  <div className="relative h-16 w-full transition-all duration-500 group-hover:scale-105">
                    <img
                      src={getImageUrl(partner.logo_path)}
                      alt={pickLocale(partner.name, partner.name_en, locale)}
                      className="h-full w-full object-contain"
                      onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
                    />
                  </div>

                  <div className="pointer-events-none absolute -bottom-3 left-1/2 flex -translate-x-1/2 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="whitespace-nowrap rounded-full bg-gradient-to-r from-brandGreen-600 to-primary-600 px-3 py-1 text-[10px] font-semibold tracking-wide text-white shadow-lg shadow-brandGreen-800/30 backdrop-blur-sm">
                      {pickLocale(partner.name, partner.name_en, locale)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-lg rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
          <p className="text-sm font-medium text-slate-400">{t("landing.partners.empty")}</p>
        </div>
      )}

      {/* Corporate Partner CTA */}
      <div className="mx-auto mt-16 max-w-4xl px-4 text-center">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brandGreen-700 via-brandGreen-600 to-primary-600 px-6 py-10 sm:px-12 sm:py-12 shadow-2xl shadow-brandGreen-900/20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-primary-500/20 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-6">
            <h3 className="font-heading text-2xl font-bold text-white sm:text-3xl">
              {locale === "id" ? "Ingin Berkolaborasi?" : "Want to Collaborate?"}
            </h3>
            <p className="text-slate-300 max-w-lg text-base">
              {locale === "id"
                ? "Jadilah bagian dari perubahan baik. Diskusikan peluang kemitraan strategis bersama kami."
                : "Be part of the good change. Discuss strategic partnership opportunities with us."}
            </p>

            <a
              href="https://wa.me/6281311768254?text=Assalamu%27alaikum%2C%20saya%20tertarik%20untuk%20mendiskusikan%20program%20kemitraan%2FCSR%20dengan%20Djalaludin%20Pane%20Foundation."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-primary-600 shadow-lg transition-transform hover:bg-slate-200"
            >
              <FontAwesomeIcon icon={faHandshake} className="text-primary-600" />
              {locale === "id" ? "Hubungi Kami" : "Contact Us"}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
