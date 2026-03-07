import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { useLang } from "@/lib/i18n";
import { translate } from "@/lib/i18n-utils";
import { landingDict } from "@/components/landing/LandingI18n";
import { imagePlaceholder } from "@/lib/placeholder";
import { type Banner, getImageUrl } from "./LandingUI";

export function BannerSection({ banners }: { banners: Banner[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(landingDict, locale, key, fallback);
  const hasBanners = banners.length > 0;
  const slides = hasBanners ? banners : [{ id: -1, image_path: "", display_order: 0 }];

  useEffect(() => {
    setActiveIndex(0);
  }, [banners.length]);

  useEffect(() => {
    if (!hasBanners || banners.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => window.clearInterval(id);
  }, [banners.length, hasBanners]);

  const handleNext = () => {
    if (!hasBanners) return;
    setActiveIndex((prev) => (prev + 1) % banners.length);
  };

  const activeBanner = slides[activeIndex] ?? slides[0];
  const imageUrl = hasBanners && activeBanner?.image_path ? getImageUrl(activeBanner.image_path) : imagePlaceholder;

  const slideVariants = {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <section className="relative -mt-24 overflow-hidden bg-slate-900">
      <div
        className="relative h-[100svh] min-h-[520px] lg:min-h-[600px]"
        onClick={handleNext}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={activeBanner?.id}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 bg-white flex items-center justify-center overflow-hidden"
          >
            {!hasBanners ? (
              <div className="absolute inset-0 bg-slate-50 animate-pulse flex flex-col items-center justify-center gap-4">
                <div className="h-16 w-16 md:h-24 md:w-24 rounded-full bg-slate-200" />
                <div className="h-4 sm:h-6 w-1/3 max-w-[300px] rounded-full bg-slate-200" />
                <div className="h-3 sm:h-4 w-1/4 max-w-[200px] rounded-full bg-slate-200/50" />
              </div>
            ) : (
              <>
                <img
                  src={imageUrl}
                  onError={(e) => {
                     e.currentTarget.src = imagePlaceholder;
                  }}
                  alt="Banner"
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover relative z-10 animate-banner-pan motion-reduce:animate-none"
                />
                <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent" />
                <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-b from-slate-900/50 via-transparent to-transparent" />
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className={`pointer-events-none absolute bottom-16 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full ${!hasBanners ? 'bg-slate-100/80 text-slate-700 shadow-sm border border-slate-200' : 'bg-white/10 text-white shadow-sm backdrop-blur border border-transparent'} px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] sm:gap-4 sm:px-4 sm:text-xs`}>
          <span className={`flex h-10 w-7 items-center justify-center rounded-full border ${!hasBanners ? 'border-slate-300' : 'border-white/70'}`}>
            <FontAwesomeIcon icon={faArrowDown} className={`text-sm animate-bounce motion-reduce:animate-none ${!hasBanners ? 'text-slate-500' : ''}`} />
          </span>
          <span className="leading-tight">{t("landing.banner.scroll", "Scroll untuk eksplorasi")}</span>
        </div>
      </div>
    </section>
  );
}
