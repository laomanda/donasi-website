import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuoteLeft, faStar, faUser, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { nurImg, susianiImg } from "@/assets/brand";
import { useLang } from "@/lib/i18n";

/* ─── Data ─── */

const TESTIMONIALS = [
  {
    id: 1,
    name: "Pak Nur",
    role: "Mitra Wakaf",
    image: nurImg,
    text: {
      id: "Alhamdulillah prosesnya berjalan lancar. Berkat dukungan dan doa dari Djalaluddin Pane Foundation, usaha kami bisa terus berjalan, berkembang, dan penuh keberkahan.",
      en: "Alhamdulillah, the process went smoothly. Thanks to the support and prayers from Djalaluddin Pane Foundation, our business can keep running, growing, and full of blessings.",
    },
  },
  {
    id: 2,
    name: "Ibu Susiani",
    role: "Mitra Wakaf",
    image: susianiImg,
    text: {
      id: "Alhamdulillah penjualan terus meningkat setelah Lebaran. Usaha kembali berjalan dengan baik, bahkan setiap hari semakin ramai. Terima kasih atas dukungan dan doa yang sangat berarti.",
      en: "Alhamdulillah, sales keep increasing after Eid. The business is running well again — in fact, it gets busier every day. Thank you for the support and prayers that mean so much.",
    },
  },
];

/* ─── Component ─── */

export function TestimonialsSection() {
  const { locale } = useLang();
  const pick = (obj: { id: string; en: string }) =>
    locale === "en" ? obj.en : obj.id;

  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);

  const goNext = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      setActive((prev) => (prev + 1) % TESTIMONIALS.length);
      setFading(false);
    }, 400); // fade-out duration
  }, []);

  // Auto-loop every 5 seconds
  useEffect(() => {
    const timer = setInterval(goNext, 5000);
    return () => clearInterval(timer);
  }, [goNext]);

  const current = TESTIMONIALS[active];

  return (
    <section className="relative overflow-hidden bg-slate-50 py-24 sm:py-32">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <div className="mx-auto max-w-2xl text-center mb-16 sm:mb-20">
          <h2 className="mt-5 font-heading text-3xl font-bold tracking-tight text-brandGreen-700 sm:text-4xl lg:text-[2.75rem] text-balance">
            {locale === "id"
              ? "Kepercayaan Anda, Amanah Kami"
              : "Your Trust, Our Sacred Responsibility"}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-500 sm:text-lg">
            {locale === "id"
              ? "Ratusan mitra dan donatur telah mempercayakan ZISWAF mereka melalui Djalaluddin Pane Foundation."
              : "Hundreds of partners and donors have entrusted their ZISWAF through Djalaluddin Pane Foundation."}
          </p>
        </div>

        {/* ── Two-Column Layout ── */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left: Image (Synchronized with rotation) */}
          <div className="relative">
            {/* Ambient Glows */}
            <div className="absolute -inset-4 z-0 animate-pulse rounded-[3rem] bg-brandGreen-500/20 blur-2xl" />
            <div className="absolute -bottom-10 -right-10 z-0 h-40 w-40 rounded-full bg-primary-500/20 blur-2xl" />

            {/* Main Image Container */}
            <div className="group relative z-10 overflow-hidden rounded-[2.5rem] bg-white p-2 sm:p-3 shadow-2xl shadow-slate-200/50 ring-1 ring-slate-100">
              <div className="relative overflow-hidden rounded-[2rem] bg-slate-50">
                <div
                  className={`transition-all duration-500 ease-in-out ${
                    fading ? "scale-95 opacity-0" : "scale-100 opacity-100"
                  }`}
                >
                  <img
                    src={current.image}
                    alt={locale === "id" ? `Testimoni ${current.name}` : `${current.name} testimonial`}
                    className="h-[400px] w-full object-contain sm:h-[480px] lg:h-[520px]"
                    loading="lazy"
                  />
                  
                  {/* Subtle Gradient Overlay for Depth */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              </div>

              {/* Floating Verified Badge (Glassmorphism) */}
              <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 flex items-center gap-2 rounded-2xl bg-white/80 p-3 pr-5 text-sm font-semibold shadow-lg backdrop-blur-md ring-1 ring-white/50 transition-transform hover:-translate-y-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brandGreen-50 text-brandGreen-600">
                  <FontAwesomeIcon icon={faCheckCircle} />
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-800 leading-tight">
                    {locale === "id" ? "Kisah Nyata" : "Verified Story"}
                  </span>
                  <span className="text-[10px] font-bold text-brandGreen-600 uppercase tracking-widest">
                    {locale === "id" ? "Terverifikasi" : "Authentic"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Auto-rotating testimonial text */}
          <div className="flex flex-col justify-center">
            <div
              className={`transition-all duration-400 ${
                fading ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
              }`}
            >
              {/* Stars */}
              <div className="flex items-center gap-1 text-primary-400 mb-6">
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon key={i} icon={faStar} className="text-sm" />
                ))}
              </div>

              {/* Quote */}
              <div className="relative">
                <FontAwesomeIcon
                  icon={faQuoteLeft}
                  className="absolute -left-2 -top-6 text-5xl text-brandGreen-100/80"
                />
                <blockquote className="relative z-10 text-xl font-medium leading-relaxed text-slate-700 sm:text-2xl text-pretty">
                  "{pick(current.text)}"
                </blockquote>
              </div>

              {/* Author */}
              <div className="mt-10 flex items-center gap-4 border-t border-slate-100 pt-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brandGreen-600 text-white shadow-md ring-2 ring-brandGreen-100">
                  <FontAwesomeIcon icon={faUser} className="text-sm" />
                </div>
                <div>
                  <p className="font-heading text-lg font-bold text-slate-900">
                    {current.name}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary-500">
                    {current.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Dots indicator */}
            <div className="mt-8 flex items-center gap-2">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setFading(true);
                    setTimeout(() => {
                      setActive(idx);
                      setFading(false);
                    }, 400);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === active
                      ? "w-8 bg-brandGreen-600"
                      : "w-2 bg-slate-200 hover:bg-slate-300"
                  }`}
                  aria-label={`Testimonial ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
