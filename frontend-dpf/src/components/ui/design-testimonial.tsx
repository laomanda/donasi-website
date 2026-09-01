import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/components/landing/LandingUI";
import { useLang } from "@/lib/i18n";

export interface AllocationItem {
  id: number;
  program_id?: number | null;
  amount: string | number;
  description: string;
  allocated_at?: string | null;
  created_at?: string;
  program?: {
    id: number;
    title: string;
    category?: string | null;
    slug?: string;
  } | null;
}

interface DistributionShowcaseProps {
  items: AllocationItem[];
  loading?: boolean;
}

export function DistributionShowcase({
  items,
  loading,
}: DistributionShowcaseProps) {
  const { locale } = useLang();
  const [activeIndex, setActiveIndex] = useState(0);

  // Safe fallback if items is empty
  const displayItems: AllocationItem[] =
    items.length > 0
      ? items
      : [
          {
            id: 1,
            amount: 2000000,
            description: "Penyaluran dana program bantuan pemberdayaan umat",
            allocated_at: "2026-08-04",
            program: { id: 1, title: "Wakaf Produktif" },
          },
        ];

  const total = displayItems.length;

  const goNext = () => setActiveIndex((prev) => (prev + 1) % total);
  const goPrev = () => setActiveIndex((prev) => (prev - 1 + total) % total);

  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(goNext, 6500);
    return () => clearInterval(timer);
  }, [total]);

  // Keep active index in range if item count changes
  useEffect(() => {
    if (activeIndex >= total) {
      setActiveIndex(0);
    }
  }, [total, activeIndex]);

  const current = displayItems[activeIndex] || displayItems[0];

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="w-full py-16 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400 font-medium text-sm">
          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span>
            {locale === "en"
              ? "Loading distributions..."
              : "Memuat data penyaluran..."}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full py-4 sm:py-6">
      <div className="relative w-full min-h-[430px] sm:min-h-[450px] lg:min-h-[460px] overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-10 lg:p-12 shadow-xl shadow-slate-900/[0.03] flex flex-col justify-between">
        <div className="relative flex flex-1 gap-6 lg:gap-10">
          {/* Left Column: Subtle Vertical Step Tracker (Desktop only) */}
          <div className="hidden sm:flex flex-col items-center justify-between pr-6 border-r border-slate-100 shrink-0 select-none py-1">
            <span
              className="text-[10px] font-bold tracking-widest text-slate-400 uppercase"
              style={{ writingMode: "vertical-rl" }}
            >
              {locale === "en" ? "Distribution" : "Penyaluran"}
            </span>

            {/* Vertical Progress Bar */}
            <div className="relative h-28 w-1 bg-slate-100 rounded-full my-auto overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 w-full bg-primary-600 rounded-full"
                animate={{
                  height: `${((activeIndex + 1) / total) * 100}%`,
                }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
            </div>

            <span className="text-[11px] font-mono font-bold text-slate-400">
              {String(activeIndex + 1).padStart(2, "0")}
            </span>
          </div>

          {/* Center Column: Main Content */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            {/* Header: Clean Program Title & Counter */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-primary-50 text-primary-600 border border-primary-100 shrink-0 mt-0.5">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-primary-600 leading-none mb-1">
                    {locale === "en" ? "Waqf Program" : "Program Penyaluran"}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug break-words">
                    {current.program?.title ||
                      (locale === "en" ? "General Waqf" : "Wakaf Umum")}
                  </h4>
                </div>
              </div>
            </div>

            {/* Narrative / Description (Height-stable & spacious for long text) */}
            <div className="relative my-auto py-4 sm:py-6 min-h-[130px] sm:min-h-[160px] flex items-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={current.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="font-heading text-lg sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-snug sm:leading-relaxed tracking-tight text-left break-words w-full"
                >
                  "{current.description}"
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Footer Row: Nominal, Tanggal, & Navigasi */}
            <div className="pt-4 sm:pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 sm:gap-5 mt-auto">
              {/* Meta: Nominal & Tanggal */}
              <div className="flex flex-wrap items-center gap-5 sm:gap-10 text-left">
                {/* Nominal */}
                <div>
                  <span className="block text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                    {locale === "en" ? "Amount Distributed" : "Dana Disalurkan"}
                  </span>
                  <p className="font-heading text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                    {formatCurrency(Number(current.amount), locale)}
                  </p>
                </div>

                {/* Vertical Divider on tablet/desktop */}
                <div className="hidden sm:block h-8 w-px bg-slate-200/70" />

                {/* Tanggal */}
                <div>
                  <span className="block text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                    {locale === "en" ? "Realization Date" : "Tanggal Penyaluran"}
                  </span>
                  <p className="text-xs sm:text-base font-bold text-slate-700">
                    {formatDate(current.allocated_at || current.created_at)}
                  </p>
                </div>
              </div>

              {/* Prev & Next Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous"
                  className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition flex items-center justify-center text-slate-700 shadow-xs cursor-pointer"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next"
                  className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition flex items-center justify-center text-slate-700 shadow-xs cursor-pointer"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DistributionShowcase;
