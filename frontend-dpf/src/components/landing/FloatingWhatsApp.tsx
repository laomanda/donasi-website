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
      className="fixed bottom-6 right-6 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition-colors hover:bg-emerald-600"
      aria-label={t("whatsapp.cta", "Hubungi via WhatsApp")}
    >
      <FontAwesomeIcon icon={faWhatsapp} className="text-3xl" />
    </a>
  );
}
