import { useEffect, useState } from "react";
import { imagePlaceholder } from "@/lib/placeholder";
import { resolveStorageUrl } from "@/lib/urls";

/* --- Components --- */

export interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatter?: (val: number) => string;
  prefix?: string;
  suffix?: string;
}

export function AnimatedCounter({
  value,
  duration = 1.4,
  formatter,
  prefix = "",
  suffix = "",
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const startValue = 0;
    const endValue = Number(value) || 0;

    if (endValue === 0) {
      setDisplayValue(0);
      return;
    }

    // Smooth cubic ease-out
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = (timestamp - startTimestamp) / (duration * 1000);
      const progress = Math.min(elapsed, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + (endValue - startValue) * easeOut);

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [value, duration]);

  if (formatter) {
    return <>{formatter(displayValue)}</>;
  }

  return (
    <>
      {prefix}
      {displayValue.toLocaleString("id-ID")}
      {suffix}
    </>
  );
}

/* --- Types --- */

export type Program = {
  id: number;
  slug?: string | null;
  title: string;
  title_en?: string | null;
  short_description: string;
  short_description_en?: string | null;
  thumbnail_path: string | null;
  target_amount?: string | number | null;
  collected_amount: string | number;
  status: string;
  category?: string | null;
  category_en?: string | null;
  deadline_days?: number | string | null;
};

export type Literasi = {
  id: number;
  slug: string;
  title: string;
  title_en?: string | null;
  excerpt: string;
  excerpt_en?: string | null;
  published_at: string | null;
  thumbnail_path?: string | null;
  category?: string | null;
  category_en?: string | null;
  author_name?: string | null;
};

export type Partner = {
  id: number;
  name: string;
  name_en?: string | null;
  logo_path: string | null;
  url?: string | null;
};

export type Banner = {
  id: number;
  image_path: string;
  display_order: number;
  status?: "published" | "draft";
};

export type ProgramAllocation = {
  id: number | null;
  title: string;
  title_en?: string | null;
  category?: string | null;
  category_en?: string | null;
  collected_amount: number | string;
  allocated_amount: number | string;
  target_amount: number | string;
  allocation_count: number;
  slug?: string | null;
  thumbnail_path?: string | null;
};

export type MonthlyTrend = {
  month_key: string;
  label: string;
  month_name: string;
  collected: number;
  allocated: number;
};

export type HomeStats = {
  total_programs: number;
  total_donations: number;
  amount_collected: string | number;
  total_allocations?: number;
  amount_allocated?: string | number;
  collected_mom?: number | null;
  allocated_mom?: number | null;
  program_allocations?: ProgramAllocation[];
  monthly_trends?: MonthlyTrend[];
};

export type HomePayload = {
  highlights: Program[];
  latest_articles: Literasi[];
  partners: Partner[];
  selected_year?: string;
  available_years?: number[];
  stats: HomeStats;
};

/* --- Helpers --- */

export const formatCurrency = (value: number | string | undefined, locale: "id" | "en") =>
  new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));

export const calculateMoM = (
  monthlyTrends?: MonthlyTrend[] | null,
  explicitMoM?: number | null
): number | null => {
  if (explicitMoM !== undefined && explicitMoM !== null) {
    return explicitMoM;
  }
  if (!monthlyTrends || monthlyTrends.length < 2) {
    return null;
  }

  for (let i = monthlyTrends.length - 1; i >= 1; i--) {
    const current = Number(monthlyTrends[i]?.collected ?? 0);
    const prev = Number(monthlyTrends[i - 1]?.collected ?? 0);
    if (current > 0 || prev > 0) {
      if (prev > 0) {
        return Number((((current - prev) / prev) * 100).toFixed(1));
      }
      return 100.0;
    }
  }

  return null;
};

export const calculateAllocMoM = (
  monthlyTrends?: MonthlyTrend[] | null,
  explicitMoM?: number | null
): number | null => {
  if (explicitMoM !== undefined && explicitMoM !== null) {
    return explicitMoM;
  }
  if (!monthlyTrends || monthlyTrends.length < 2) {
    return null;
  }

  for (let i = monthlyTrends.length - 1; i >= 1; i--) {
    const current = Number(monthlyTrends[i]?.allocated ?? 0);
    const prev = Number(monthlyTrends[i - 1]?.allocated ?? 0);
    if (current > 0 || prev > 0) {
      if (prev > 0) {
        return Number((((current - prev) / prev) * 100).toFixed(1));
      }
      return 100.0;
    }
  }

  return null;
};

export const formatDate = (value: string | null | undefined, locale: "id" | "en", t: (k: string, f?: string) => string) => {
  if (!value) return t("landing.common.soon");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return t("landing.common.soon");
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

export const pickLocale = (idVal?: string | null, enVal?: string | null, locale: "id" | "en" = "id") => {
  const idText = (idVal ?? "").trim();
  const enText = (enVal ?? "").trim();
  if (locale === "en") return enText || idText;
  return idText || enText;
};

export const getImageUrl = (path?: string | null) => {
  return resolveStorageUrl(path, imagePlaceholder);
};
