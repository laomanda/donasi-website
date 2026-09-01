import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faReceipt,
  faArrowLeft,
  faBuildingColumns,
  faCalendarCheck,
  faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import { LandingLayout } from "@/layouts/LandingLayout";
import { PageHero } from "@/components/PageHero";
import { useLang } from "@/lib/i18n";
import http from "@/lib/http";
import {
  type HomePayload,
  formatCurrency,
  AnimatedCounter,
} from "@/components/landing/LandingUI";

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
      .catch((err) => console.error("Error loading home stats:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalAllocated = Number(data?.stats?.amount_allocated ?? 0);
  const totalAllocations = data?.stats?.total_allocations ?? 0;
  const programAllocations = data?.stats?.program_allocations ?? [];

  return (
    <LandingLayout whatsappPhone="6285195542022" footerWaveBgClassName="bg-slate-50">
      {/* Hero Section */}
      <PageHero
        badge={locale === "en" ? "Realization & Distribution" : "Realisasi & Penyaluran"}
        title={
          <>
            {locale === "en" ? "Waqf Fund" : "Penyaluran"}{" "}
            <span className="text-primary-600">
              {locale === "en" ? "Distribution" : "Dana Wakaf"}
            </span>
          </>
        }
        subtitle={
          locale === "en"
            ? "Comprehensive report on waqf fund realization, distribution milestones, and impactful programs managed by Djalaludin Pane Foundation."
            : "Laporan komprehensif realisasi dan riwayat penyaluran dana wakaf kepada penerima manfaat serta program-program produktif yang dikelola oleh Djalaludin Pane Foundation."
        }
        breadcrumb={[
          { label: locale === "en" ? "Transparency" : "Transparansi", href: "/transparansi" },
          { label: locale === "en" ? "Distribution" : "Penyaluran" },
        ]}
      />

      {/* Main Content Area */}
      <section className="relative -mt-8 pb-20 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {/* Total Penyaluran */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {locale === "en" ? "Total Distributed" : "Total Dana Disalurkan"}
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                  <FontAwesomeIcon icon={faReceipt} className="text-sm" />
                </div>
              </div>
              <p className="mt-4 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {loading ? "..." : (
                  <AnimatedCounter
                    value={totalAllocated}
                    formatter={(val) => formatCurrency(val, locale)}
                  />
                )}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {locale === "en" ? "Directly funded to target beneficiaries" : "Telah direalisasikan ke program produktif"}
              </p>
            </div>

            {/* Total Kegiatan Penyaluran */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {locale === "en" ? "Disbursement Activities" : "Kegiatan Penyaluran"}
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <FontAwesomeIcon icon={faCalendarCheck} className="text-sm" />
                </div>
              </div>
              <p className="mt-4 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {loading ? "..." : (
                  <AnimatedCounter value={totalAllocations} />
                )}{" "}
                <span className="text-lg font-medium text-slate-500">
                  {locale === "en" ? "times" : "kali"}
                </span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {locale === "en" ? "Verified disbursement events" : "Tercatat dan terverifikasi di sistem"}
              </p>
            </div>

            {/* Program Terlibat */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {locale === "en" ? "Funded Programs" : "Program Terfasilitasi"}
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <FontAwesomeIcon icon={faBuildingColumns} className="text-sm" />
                </div>
              </div>
              <p className="mt-4 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {loading ? "..." : (
                  <AnimatedCounter
                    value={programAllocations.filter((p) => Number(p.allocated_amount) > 0).length}
                  />
                )}{" "}
                <span className="text-lg font-medium text-slate-500">
                  {locale === "en" ? "programs" : "program"}
                </span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {locale === "en" ? "Productive and social programs" : "Program wakaf produktif & sosial"}
              </p>
            </div>
          </div>

          {/* Canvas Notice / Placeholder for Next Steps */}
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 sm:p-12 text-center backdrop-blur-sm shadow-xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 mb-4">
              <FontAwesomeIcon icon={faReceipt} className="text-2xl" />
            </div>
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">
              {locale === "en"
                ? "Distribution Details Page Ready"
                : "Halaman Detail Penyaluran Siap Disesuaikan"}
            </h3>
            <p className="mt-2 max-w-xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
              {locale === "en"
                ? "This page is set up and linked to the distribution metrics card. Ready to be populated with detailed reports, timelines, beneficiary galleries, or tables according to your instructions."
                : "Halaman ini sudah terhubung dengan card Dana Disalurkan. Struktur halaman siap dikembangkan lebih lanjut dengan rincian kegiatan, tabel realisasi, timeline, atau dokumentasi penerima manfaat sesuai instruksi Anda berikutnya."}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/transparansi"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                <span>{locale === "en" ? "Back to Transparency" : "Kembali ke Transparansi"}</span>
              </Link>
              <Link
                to="/program"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-primary-700 shadow-sm transition"
              >
                <span>{locale === "en" ? "Explore Programs" : "Lihat Program Wakaf"}</span>
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}

export default PenyaluranPage;
