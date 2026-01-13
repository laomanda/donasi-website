import { useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { LandingNavbar } from "../components/landing/LandingNavbar";
import { LandingFooter } from "../components/landing/LandingFooter";
import { FloatingWhatsApp } from "../components/landing/FloatingWhatsApp";
import { WaveDivider } from "../components/landing/WaveDivider";
import http from "../lib/http";
import { useLang } from "../lib/i18n";

type LandingLayoutProps = PropsWithChildren<{
  whatsappPhone?: string;
  footerWaveBgClassName?: string;
}>;

type ProgramSummary = {
  id: number;
  slug?: string | null;
  title: string;
  title_en?: string | null;
  collected_amount?: number | string | null;
};

const pickLocale = (idVal?: string | null, enVal?: string | null, locale: "id" | "en" = "id") => {
  const idText = (idVal ?? "").trim();
  const enText = (enVal ?? "").trim();
  if (locale === "en") return enText || idText;
  return idText || enText;
};

export function LandingLayout({
  children,
  whatsappPhone = "6281311768254",
  footerWaveBgClassName = "bg-slate-50",
}: LandingLayoutProps) {
  const [programs, setPrograms] = useState<ProgramSummary[]>([]);
  const { locale } = useLang();

  useEffect(() => {
    let active = true;
    http
      .get<{ data: ProgramSummary[] }>("/programs")
      .then((res) => {
        if (!active) return;
        setPrograms(res.data?.data ?? []);
      })
      .catch(() => {
        if (!active) return;
        setPrograms([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const programLinks = useMemo(() => {
    return [...programs]
      .sort((a, b) => Number(b.collected_amount ?? 0) - Number(a.collected_amount ?? 0))
      .slice(0, 5)
      .map((program) => ({
        label: pickLocale(program.title, program.title_en, locale) || "Program",
        href: program.slug ? `/program/${program.slug}` : "/program",
      }));
  }, [programs, locale]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-body antialiased">
      <LandingNavbar />

      <main className="pt-24">{children}</main>

      <div className={footerWaveBgClassName}>
        <WaveDivider fillClassName="fill-brandGreen-700" className="-mb-[1px]" />
      </div>

      <LandingFooter programLinks={programLinks} />

      <FloatingWhatsApp phoneE164={whatsappPhone} />
    </div>
  );
}
