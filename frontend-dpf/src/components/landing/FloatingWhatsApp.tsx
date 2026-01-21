import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { useLang } from "../../lib/i18n";
import { landingDict, translate } from "../../i18n/landing";

type FloatingWhatsAppProps = {
  phoneE164: string; // contoh: "6281234567890"
  message?: string;
};

export function FloatingWhatsApp({
  phoneE164,
  message = "Halo DPF, saya ingin bertanya lebih lanjut mengenai program donasi.",
}: FloatingWhatsAppProps) {
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(landingDict, locale, key, fallback);

  const href = `https://wa.me/${phoneE164}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="floating-wa group fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center justify-center outline-none focus:outline-none"
      aria-label={t("whatsapp.cta", "Hubungi via WhatsApp")}
    >
      {/* Container Tombol */}
      <div className="relative flex h-12 sm:h-14 items-center gap-2.5 sm:gap-3 rounded-full bg-emerald-500 pl-1.5 pr-4 sm:pr-6 shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)] transition-all duration-300 hover:bg-emerald-600 hover:shadow-[0_10px_25px_-5px_rgba(16,185,129,0.6)] hover:-translate-y-1">

        {/* Wrapper Icon dengan bg putih */}
        <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-40 duration-1000 group-hover:animate-none"></span>
          <FontAwesomeIcon icon={faWhatsapp} className="relative z-10 text-xl sm:text-2xl" />
        </div>

        {/* Text Switcher Container */}
        <div className="relative z-20 hidden min-[360px]:flex flex-col overflow-hidden text-xs sm:text-sm font-bold text-white h-4 sm:h-5 w-auto min-w-[120px]">
          <span className="absolute inset-0 flex items-center justify-start transition-transform duration-300 ease-out group-hover:-translate-y-6 sm:group-hover:-translate-y-8">
            {t("whatsapp.label")}
          </span>
          <span className="absolute inset-0 flex items-center justify-start translate-y-6 sm:translate-y-8 transition-transform duration-300 ease-out group-hover:translate-y-0">
            {t("whatsapp.cta", "Chat WhatsApp")}
          </span>
        </div>

      </div>
    </a>
  );
}
