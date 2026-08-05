import type { Locale } from "@/lib/i18n";
import { useLang } from "@/lib/i18n";
import { landingDict } from "@/components/landing/LandingI18n";
import { translate } from "@/lib/i18n-utils";
import { GalleryDpfCta } from "./GalleryDpfCta";
import { GalleryMitraCta } from "./GalleryMitraCta";
import { MitraProductCta } from "./MitraProductCta";

export function TrioCtaSection({ locale }: { locale: Locale }) {
  const { locale: currentLocale } = useLang();
  const activeLocale = locale || currentLocale;
  const t = (key: string, fallback?: string) => translate(landingDict, activeLocale, key, fallback);

  return (
    <section className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 text-center space-y-3">
          <span className="inline-flex items-center rounded-full bg-brandGreen-50 px-3.5 py-1 text-xs font-semibold text-brandGreen-700 ring-1 ring-brandGreen-100">
            {t("landing.trioCta.badge", "Eksplorasi & Galeri")}
          </span>
          <h2 className="text-3xl font-heading font-bold text-slate-900 sm:text-4xl">
            {t("landing.trioCta.title", "Aktivitas & Produk DPF")}
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-600">
            {t("landing.trioCta.subtitle", "Lihat wujud nyata dampak wakaf dan produk pemberdayaan UMKM mitra DPF.")}
          </p>
        </div>

        {/* 3-Column Grid with Produk Mitra in the middle */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <GalleryDpfCta locale={activeLocale} />
          <MitraProductCta locale={activeLocale} />
          <GalleryMitraCta locale={activeLocale} />
        </div>
      </div>
    </section>
  );
}
