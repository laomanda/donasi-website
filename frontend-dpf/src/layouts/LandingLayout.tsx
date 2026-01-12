import type { PropsWithChildren } from "react";
import { LandingNavbar } from "../components/landing/LandingNavbar";
import { LandingFooter } from "../components/landing/LandingFooter";
import { FloatingWhatsApp } from "../components/landing/FloatingWhatsApp";
import { WaveDivider } from "../components/landing/WaveDivider";

type LandingLayoutProps = PropsWithChildren<{
  whatsappPhone?: string;
  footerWaveBgClassName?: string;
}>;

export function LandingLayout({
  children,
  whatsappPhone = "6281234567890",
  footerWaveBgClassName = "bg-slate-50",
}: LandingLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-body antialiased">
      <LandingNavbar />

      <main className="pt-24">{children}</main>

      <div className={footerWaveBgClassName}>
        <WaveDivider fillClassName="fill-brandGreen-700" className="-mb-[1px]" />
      </div>

      <LandingFooter />

      <FloatingWhatsApp phoneE164={whatsappPhone} />
    </div>
  );
}
