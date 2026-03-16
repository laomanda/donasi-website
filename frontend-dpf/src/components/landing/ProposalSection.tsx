import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandHoldingHeart } from "@fortawesome/free-solid-svg-icons";
import { useLang } from "@/lib/i18n";
import { proposalWakaf } from "@/assets/brand";

export function ProposalSection() {
  const { locale } = useLang();
  
  return (
    <section className="bg-slate-50 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#2F7D4E] to-[#E87C1E] px-6 py-10 shadow-2xl sm:px-12 sm:py-16">
          {/* Background decoration */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          </div>

          <div className="relative flex flex-col items-center gap-10 lg:flex-row lg:justify-between lg:gap-16">
            {/* Text Content */}
            <div className="flex-1 text-center lg:text-left text-white space-y-6">
              <div>
                <span className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                  {locale === "id" ? "Program Wakaf" : "Waqf Program"}
                </span>
                <h2 className="mt-4 font-heading text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                  {locale === "id" 
                    ? "Pelajari Lebih Lanjut Tentang Program Wakaf Kami" 
                    : "Learn More About Our Waqf Programs"}
                </h2>
                <p className="mt-4 text-lg text-white/90 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  {locale === "id"
                    ? "Unduh materi lengkap mengenai program-program unggulan dan transparansi penggunaan dana wakaf."
                    : "Download complete materials regarding our flagship programs and waqf fund transparency."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/donate#donate-form-section"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 bg-white/10 px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/20 hover:border-white/50"
                >
                  <FontAwesomeIcon icon={faHandHoldingHeart} className="text-lg" />
                  {locale === "id" ? "Donasi Sekarang" : "Donate Now"}
                </Link>
              </div>
            </div>

            {/* Image Preview */}
            <div className="relative w-full max-w-sm flex-none lg:w-1/3">
              <div className="relative aspect-[3/4] w-full rotate-3 transform rounded-2xl bg-white p-2 shadow-2xl transition-transform duration-500 hover:rotate-0 hover:scale-105">
                <img
                  src={proposalWakaf}
                  alt="Proposal Wakaf Preview"
                  className="h-full w-full rounded-xl object-cover bg-slate-50"
                />
                
                {/* Floating Badge */}
                 <div className="absolute -right-4 -top-4 rounded-full bg-[#2F7D4E] p-4 text-white shadow-xl">
                    <FontAwesomeIcon icon={faHandHoldingHeart} className="h-6 w-6" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
