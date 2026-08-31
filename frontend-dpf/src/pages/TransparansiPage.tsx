import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuildingColumns,
  faHandHoldingHeart,
  faReceipt,
  faCircleCheck,
  faHandshakeAngle,
  faArrowRight,
  faScaleBalanced,
} from "@fortawesome/free-solid-svg-icons";
import http from "@/lib/http";
import { useLang } from "@/lib/i18n";
import { landingDict } from "@/components/landing/LandingI18n";
import { translate } from "@/lib/i18n-utils";
import { LandingLayout } from "@/layouts/LandingLayout";
import { type HomePayload, formatCurrency, AnimatedCounter } from "@/components/landing/LandingUI";
import { TransparencySection } from "@/components/landing/TransparencySection";
import heroTransparantImg from "@/assets/brand/hero-transparant.webp";

export function TransparansiPage() {
  const [data, setData] = useState<HomePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(landingDict, locale, key, fallback);

  // Parallax Scroll Tracking
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 800], [0, 200]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    let mounted = true;
    http
      .get<HomePayload>("/home")
      .then((res) => {
        if (!mounted) return;
        setData(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const totalCollected = Number(data?.stats?.amount_collected ?? 0);
  const totalAllocated = Number(data?.stats?.amount_allocated ?? 0);
  const totalDonations = data?.stats?.total_donations ?? 0;
  const totalAllocations = data?.stats?.total_allocations ?? 0;

  return (
    <LandingLayout whatsappPhone="6285195542022" footerWaveBgClassName="bg-slate-50">
      {/* Full-Screen Hero Section with Parallax */}
      <section id="hero" className="relative -mt-24 h-screen min-h-screen flex flex-col justify-center overflow-hidden bg-slate-950 text-white">
        {/* Parallax Background Photo & Clean Dark Overlay */}
        <motion.div
          className="absolute inset-0 z-0 h-[125%] -top-[12%] w-full"
          style={{ y: isMobile ? 0 : yParallax }}
        >
          <img
            src={heroTransparantImg}
            alt="Transparansi Wakaf DPF"
            className="h-full w-full object-cover object-center"
          />
          {/* Clean Flat Dark Overlay */}
          <div className="absolute inset-0 bg-black/60" />
        </motion.div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 text-center pt-24 pb-8 my-auto">
          {/* Heading */}
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight drop-shadow-md">
            {locale === "en"
              ? "Waqf Collection & Distribution Transparency"
              : "Transparansi Penghimpunan & Penyaluran Wakaf"}
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-200 leading-relaxed font-normal drop-shadow-sm">
            {locale === "en"
              ? "Djalaludin Pane Foundation (DPF) is committed to real-time transparency, accountability, and productive waqf governance. Monitor all funds collected and distributed to programs."
              : "Djalaludin Pane Foundation (DPF) berkomitmen mewujudkan keterbukaan dan tata kelola wakaf yang amanah, akuntabel, dan produktif. Pantau seluruh alur dana dari wakif hingga penyaluran ke program."}
          </p>

          {/* Harmonious Quick Metrics Strip */}
          <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto text-left">
            {/* Card 1: Dana Dihimpun */}
            <div className="group rounded-2xl bg-slate-900/70 border border-white/10 p-4 sm:p-4.5 backdrop-blur-md shadow-xl transition hover:border-brandGreen-500/40 hover:bg-slate-900/85">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brandGreen-500/15 text-brandGreen-400 border border-brandGreen-500/20 group-hover:scale-105 transition">
                  <FontAwesomeIcon icon={faHandHoldingHeart} className="text-sm" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-medium text-slate-300 block truncate">
                    {locale === "en" ? "Total Collected" : "Dana Dihimpun"}
                  </span>
                  <p className="font-heading text-sm sm:text-base lg:text-lg font-bold text-white tracking-tight truncate">
                    {loading ? "..." : (
                      <AnimatedCounter
                        value={totalCollected}
                        formatter={(val) => formatCurrency(val, locale as any)}
                      />
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Dana Disalurkan */}
            <div className="group rounded-2xl bg-slate-900/70 border border-white/10 p-4 sm:p-4.5 backdrop-blur-md shadow-xl transition hover:border-sky-500/40 hover:bg-slate-900/85">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/20 group-hover:scale-105 transition">
                  <FontAwesomeIcon icon={faReceipt} className="text-sm" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-medium text-slate-300 block truncate">
                    {locale === "en" ? "Total Distributed" : "Dana Disalurkan"}
                  </span>
                  <p className="font-heading text-sm sm:text-base lg:text-lg font-bold text-white tracking-tight truncate">
                    {loading ? "..." : (
                      <AnimatedCounter
                        value={totalAllocated}
                        formatter={(val) => formatCurrency(val, locale as any)}
                      />
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Donasi Terverifikasi */}
            <div className="group rounded-2xl bg-slate-900/70 border border-white/10 p-4 sm:p-4.5 backdrop-blur-md shadow-xl transition hover:border-teal-500/40 hover:bg-slate-900/85">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/15 text-teal-300 border border-teal-500/20 group-hover:scale-105 transition">
                  <FontAwesomeIcon icon={faCircleCheck} className="text-sm" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-medium text-slate-300 block truncate">
                    {locale === "en" ? "Donations Verified" : "Donasi Terverifikasi"}
                  </span>
                  <p className="font-heading text-sm sm:text-base lg:text-lg font-bold text-white tracking-tight truncate">
                    {loading ? "..." : (
                      <AnimatedCounter
                        value={totalDonations}
                        suffix={locale === "en" ? " Transactions" : " Transaksi"}
                      />
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 4: Penyaluran Program */}
            <div className="group rounded-2xl bg-slate-900/70 border border-white/10 p-4 sm:p-4.5 backdrop-blur-md shadow-xl transition hover:border-amber-500/40 hover:bg-slate-900/85">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/20 group-hover:scale-105 transition">
                  <FontAwesomeIcon icon={faHandshakeAngle} className="text-sm" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-medium text-slate-300 block truncate">
                    {locale === "en" ? "Allocations Executed" : "Penyaluran Program"}
                  </span>
                  <p className="font-heading text-sm sm:text-base lg:text-lg font-bold text-white tracking-tight truncate">
                    {loading ? "..." : (
                      <AnimatedCounter
                        value={totalAllocations}
                        suffix={locale === "en" ? " Activities" : " Kegiatan"}
                      />
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Transparency Section */}
      <TransparencySection stats={data?.stats} locale={locale as any} t={t} />

      {/* Governance & Pillars Section */}
      <section className="bg-slate-50 pb-20 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900">
              {locale === "en" ? "Governance & Accountability Standards" : "Standar Tata Kelola & Akuntabilitas"}
            </h2>
            <p className="text-base text-slate-600">
              {locale === "en"
                ? "Every rupiah is accounted for through strict nazhir principles, financial auditing, and transparent reporting."
                : "Setiap amanah wakaf dikelola dengan prinsip tata kelola nazhir profesional yang transparan, akuntabel, dan berdampak."}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brandGreen-50 text-brandGreen-700">
                <FontAwesomeIcon icon={faScaleBalanced} className="text-xl" />
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-900">
                {locale === "en" ? "Sharia Compliant" : "Kepatuhan Syariah & Regulasi"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {locale === "en"
                  ? "DPF operates under the guidance of Islamic waqf jurisprudence and official regulations of the Indonesian Waqf Board (BWI)."
                  : "Pengelolaan wakaf diawasi langsung dan patuh pada pedoman Badan Wakaf Indonesia (BWI) dan Kementerian Agama RI."}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                <FontAwesomeIcon icon={faReceipt} className="text-xl" />
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-900">
                {locale === "en" ? "Verified Field Proof" : "Dokumentasi & Bukti Riil"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {locale === "en"
                  ? "Every allocation requires photo proof, recipient receipts, and documentation accessible to stakeholders."
                  : "Setiap penyaluran dilengkapi foto dokumentasi lapangan, kwitansi, dan pertanggung jawaban yang terekam di sistem."}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs space-y-4 sm:col-span-2 lg:col-span-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
                <FontAwesomeIcon icon={faBuildingColumns} className="text-xl" />
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-900">
                {locale === "en" ? "Productive Empowerment" : "Pemberdayaan Berkelanjutan"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {locale === "en"
                  ? "Focus on high-impact productive waqf models in education, MSME livestock, and community infrastructure."
                  : "Fokus pada program wakaf produktif di bidang peternakan, pendidikan, air bersih, dan fasilitas ibadah di pelosok."}
              </p>
            </div>
          </div>

          {/* CTA Box */}
          <div className="rounded-3xl bg-gradient-to-r from-brandGreen-800 to-brandGreen-700 p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="font-heading text-2xl sm:text-3xl font-bold">
                {locale === "en" ? "Ready to plant your eternal legacy?" : "Mari Salurkan Wakaf Terbaik Anda"}
              </h3>
              <p className="text-sm text-brandGreen-100 max-w-xl">
                {locale === "en"
                  ? "Choose from our verified productive waqf programs and receive automated transparent impact reports."
                  : "Pilih program wakaf produktif pilihan Anda dan dapatkan laporan penyaluran yang transparan dan akuntabel."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/donate"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-brandGreen-800 shadow-md transition hover:bg-slate-100 hover:shadow-lg active:scale-95"
              >
                <FontAwesomeIcon icon={faHandHoldingHeart} />
                <span>{locale === "en" ? "Donate Waqf Now" : "Salurkan Wakaf"}</span>
              </Link>
              <Link
                to="/program"
                className="inline-flex items-center gap-2 rounded-full bg-brandGreen-700/60 border border-brandGreen-400/40 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-brandGreen-700 active:scale-95"
              >
                <span>{locale === "en" ? "View Programs" : "Lihat Program"}</span>
                <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}

export default TransparansiPage;
