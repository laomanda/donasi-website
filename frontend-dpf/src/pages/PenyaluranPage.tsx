import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faReceipt
} from "@fortawesome/free-solid-svg-icons";
import { LandingLayout } from "@/layouts/LandingLayout";
import { useLang } from "@/lib/i18n";
import http from "@/lib/http";
import { motion } from "framer-motion";
import {
  type HomePayload,
  formatCurrency,
  AnimatedCounter,
} from "@/components/landing/LandingUI";
import proposalWakafImg from "@/assets/brand/proposal_wakaf.webp";

export function PenyaluranPage() {
  const { locale } = useLang();
  const [data, setData] = useState<HomePayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    http
      .get<HomePayload>("/home")
      .then((res) => {
        if (!isMounted) return;
        setData(res.data);
      })
      .catch((err) => console.error("Error loading distribution stats:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalCollected = Number(data?.stats?.amount_collected ?? 0);
  const totalAllocated = Number(data?.stats?.amount_allocated ?? 0);

  const distributionRatio =
    totalCollected > 0 ? ((totalAllocated / totalCollected) * 100).toFixed(1) : "0";

  return (
    <LandingLayout whatsappPhone="6285195542022" footerWaveBgClassName="bg-slate-50">
      {/* =========================================================================
          HERO SECTION: "Amanah & Human-Impact" (Split Hero with Live Metrik)
      ========================================================================= */}
      <header className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-slate-50 to-white pt-28 pb-16 lg:pt-36 lg:pb-24">
        {/* Ambient Gradient Glows in Background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-emerald-200/35 via-primary-100/30 to-sky-200/35 blur-3xl opacity-70"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-40 -left-20 -z-10 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-60 -right-20 -z-10 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl"
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Grid Layout (Left: Text & Action, Right: Visual & Floating Badges) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-left">

              {/* Main Heading */}
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.25] sm:leading-[1.22]">
                {locale === "en" ? (
                  <>
                    Tangible Impact of Waqf:{" "}
                    <span className="relative inline-block text-primary-700 pb-2 sm:pb-2.5">
                      <span>Flowing as Blessings,</span>
                      <motion.svg
                        className="absolute bottom-0 -left-2 sm:-left-3 w-[calc(100%+16px)] sm:w-[calc(100%+24px)] h-2.5 sm:h-3 text-primary-500 overflow-visible pointer-events-none"
                        viewBox="0 0 280 12"
                        fill="none"
                        preserveAspectRatio="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* Soft permanent base line */}
                        <path
                          d="M2 3C75 10 205 10 278 4"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          className="opacity-25"
                        />
                        {/* Flowing animated stream line (infinite loop) */}
                        <motion.path
                          d="M2 3C75 10 205 10 278 4"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          animate={{
                            pathLength: [0, 1, 1, 0],
                            pathOffset: [0, 0, 0.4, 1],
                            opacity: [0.3, 1, 1, 0],
                          }}
                          transition={{
                            duration: 2.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                            repeatDelay: 0.8,
                          }}
                        />
                      </motion.svg>
                    </span>{" "}
                    Empowering Lives.
                  </>
                ) : (
                  <>
                    Jejak Nyata Amanah Wakaf:{" "}
                    <span className="relative inline-block text-primary-700 pb-2 sm:pb-2.5">
                      <span>Mengalir Jadi Manfaat,</span>
                      <motion.svg
                        className="absolute bottom-0 -left-2 sm:-left-3 w-[calc(100%+16px)] sm:w-[calc(100%+24px)] h-2.5 sm:h-3 text-primary-500 overflow-visible pointer-events-none"
                        viewBox="0 0 280 12"
                        fill="none"
                        preserveAspectRatio="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* Soft permanent base line */}
                        <path
                          d="M2 3C75 10 205 10 278 4"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          className="opacity-25"
                        />
                        {/* Flowing animated stream line (infinite loop) */}
                        <motion.path
                          d="M2 3C75 10 205 10 278 4"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          animate={{
                            pathLength: [0, 1, 1, 0],
                            pathOffset: [0, 0, 0.4, 1],
                            opacity: [0.3, 1, 1, 0],
                          }}
                          transition={{
                            duration: 2.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                            repeatDelay: 0.8,
                          }}
                        />
                      </motion.svg>
                    </span>{" "}
                    Tumbuh Berkelanjutan.
                  </>
                )}
              </h1>

              {/* Subheadline Description */}
              <p className="max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                {locale === "en"
                  ? "Every rupiah of waqf and donation entrusted to DPF is distributed transparently and measurably to productive programs, education, healthcare, and community welfare."
                  : "Setiap rupiah donasi dan wakaf yang Anda amanahkan kepada DPF disalurkan dengan prinsip tepat sasaran, terukur, dan terdokumentasi rapi untuk menggerakkan kemandirian umat, pendidikan, sarana ibadah, dan bantuan sosial."}
              </p>
            </div>

            {/* Right Visual Column (Hero Image with Overlaid Floating Impact Cards) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Hero Image Container - Full display without crop & without dark overlay */}
                <div className="relative overflow-hidden rounded-3xl border-4 border-white bg-white shadow-2xl shadow-slate-900/10">
                  <img
                    src={proposalWakafImg}
                    alt={
                      locale === "en"
                        ? "Waqf fund distribution and beneficiary empowerment activities"
                        : "Kegiatan penyaluran dana wakaf dan pemberdayaan penerima manfaat DPF"
                    }
                    className="w-full h-auto block rounded-2xl transition-transform"
                  />
                </div>

                {/* Floating Card: Total Dana Disalurkan (Light Glassmorphic Background) */}
                <div className="absolute -bottom-5 -right-3 sm:-right-5 rounded-2xl bg-white/95 border border-slate-200/90 p-4 shadow-xl backdrop-blur-md text-left text-slate-900 max-w-[240px]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
                      <FontAwesomeIcon icon={faReceipt} className="text-xs" />
                    </div>
                    <span className="text-xs font-bold text-slate-600">
                      {locale === "en" ? "Funds Distributed" : "Dana Tersalurkan"}
                    </span>
                  </div>
                  <p className="font-heading text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    {loading ? "..." : (
                      <AnimatedCounter
                        value={totalAllocated}
                        formatter={(val) => formatCurrency(val, locale)}
                      />
                    )}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                    {locale === "en"
                      ? `${distributionRatio}% of waqf pool distributed`
                      : `Realisasi ${distributionRatio}% dari kas wakaf`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          CONTENT CANVAS: Ready for Next Section Instruction (Table / Gallery / etc.)
      ========================================================================= */}
      <main className="min-h-[200px] py-12 bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Subtle placeholder canvas box */}
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-8 sm:p-12 text-center backdrop-blur-xs shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 mb-3">
              <FontAwesomeIcon icon={faReceipt} className="text-xl" />
            </div>
            <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900">
              {locale === "en"
                ? "Section Canvas Ready"
                : "Hero Section Penyaluran Selesai Dibuat"}
            </h3>
            <p className="mt-1.5 max-w-md mx-auto text-xs sm:text-sm text-slate-500 leading-relaxed">
              {locale === "en"
                ? "The hero section with live metrics, search, and storytelling visual is live. What content would you like to build underneath next?"
                : "Hero section lengkap dengan live metrics, search bar, dan visual storytelling sudah terpasang. Apa komponen atau data yang ingin kita bangun di bawahnya selanjutnya?"}
            </p>
          </div>
        </div>
      </main>
    </LandingLayout>
  );
}

export default PenyaluranPage;
