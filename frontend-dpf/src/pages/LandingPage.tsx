import { useEffect, useMemo, useState } from "react";
import http from "@/lib/http";
import { useLang } from "@/lib/i18n";
import { landingDict, translate } from "@/i18n/landing";
import { LandingLayout } from "@/layouts/LandingLayout";

// Refactored Components
import { 
  type HomePayload, 
  type Banner, 
  pickLocale 
} from "@/components/landing/LandingUI";
import { BannerSection } from "@/components/landing/BannerSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { PromiseStrip } from "@/components/landing/PromiseStrip";
import { ProgramsSection } from "@/components/landing/ProgramsSection";
import { ArticlesSection } from "@/components/landing/ArticlesSection";
import { PartnerSection } from "@/components/landing/PartnerSection";
import { ProposalSection } from "@/components/landing/ProposalSection";

function LandingPage() {
  const [data, setData] = useState<HomePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(landingDict, locale, key, fallback);

  useEffect(() => {
    let mounted = true;
    http
      .get<HomePayload>("/home")
      .then((response) => {
        if (!mounted) return;
        setData(response.data);
        setError(null);
      })
      .catch(() => {
        if (!mounted) return;
        setError(t("landing.error"));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    http
      .get<Banner[]>("/banners")
      .then((res) => {
        if (!active) return;
        setBanners(res.data ?? []);
      })
      .catch(() => {
        if (!active) return;
        setBanners([]);
      })
    return () => {
      active = false;
    };
  }, []);

  const highlights = data?.highlights ?? [];
  const articles = data?.latest_articles ?? [];
  const partners = data?.partners ?? [];

  const localizedHighlights = useMemo(
    () =>
      highlights
        .filter((p) => {
          const status = String(p.status ?? "").trim().toLowerCase();
          return status !== "draft" && status !== "segera";
        })
        .map((p) => ({
          ...p,
          title: pickLocale(p.title, p.title_en, locale as any),
          short_description: pickLocale(p.short_description, p.short_description_en, locale as any),
          category: pickLocale(p.category, p.category_en, locale as any),
        })),
    [highlights, locale]
  );

  const localizedArticles = useMemo(
    () =>
      articles.map((a: any) => ({
        ...a,
        title: pickLocale(a.title, a.title_en, locale as any),
        excerpt: pickLocale(a.excerpt, a.excerpt_en, locale as any),
        category: pickLocale(a.category, a.category_en, locale as any),
      })),
    [articles, locale]
  );

  const localizedPartners = useMemo(
    () =>
      partners.map((p) => ({
        ...p,
        name: pickLocale(p.name, p.name_en, locale as any),
      })),
    [partners, locale]
  );

  return (
    <LandingLayout whatsappPhone="6281311768254" footerWaveBgClassName="bg-slate-50">
      <BannerSection banners={banners} />
      <HeroSection error={error} t={t} />
      <PromiseStrip t={t} />
      <ProgramsSection highlights={localizedHighlights} loading={loading} t={t} locale={locale as any} />
      <ArticlesSection articles={localizedArticles} loading={loading} t={t} locale={locale as any} />
      <PartnerSection partners={localizedPartners} t={t} locale={locale as any} />
      <ProposalSection />
    </LandingLayout>
  );
}

export default LandingPage;
export { LandingPage };
