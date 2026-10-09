import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareNodes, faLink } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

interface LiterasiDetailShareProps {
  shareText: string;
  handleShare: () => void;
  copyToClipboard: () => void;
  shareStatus: string | null;
  locale: "id" | "en";
}

export function LiterasiDetailShare({
  shareText,
  handleShare,
  copyToClipboard,
  shareStatus,
  locale
}: LiterasiDetailShareProps) {
  return (
    <div className="mt-10 border-t border-slate-100 pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {locale === "en" ? "Share" : "Bagikan"}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-600">
            {locale === "en" ? "Share this useful information." : "Sebarkan informasi bermanfaat ini."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition-colors hover:bg-primary-600"
          >
            <FontAwesomeIcon icon={faShareNodes} />
            {locale === "en" ? "Share" : "Bagikan"}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-brandGreen-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition-colors hover:bg-brandGreen-600"
          >
            <FontAwesomeIcon icon={faWhatsapp} />
            WhatsApp
          </a>
          <button
            type="button"
            onClick={copyToClipboard}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 shadow-xs transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <FontAwesomeIcon icon={faLink} />
            {locale === "en" ? "Copy link" : "Salin tautan"}
          </button>
          {shareStatus ? (
            <span className="inline-flex items-center rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">
              {shareStatus}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

