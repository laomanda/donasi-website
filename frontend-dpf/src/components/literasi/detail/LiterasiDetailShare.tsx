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
          <p className="text-xs font-semibold text-slate-500">{locale === "en" ? "Share" : "Bagikan"}</p>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            {locale === "en" ? "Share this useful information." : "Sebarkan informasi bermanfaat ini."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
          >
            <FontAwesomeIcon icon={faShareNodes} />
            {locale === "en" ? "Share" : "Bagikan"}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-brandGreen-200 bg-brandGreen-50 px-4 py-2.5 text-sm font-semibold text-brandGreen-700 transition hover:bg-brandGreen-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandGreen-200"
          >
            <FontAwesomeIcon icon={faWhatsapp} />
            WhatsApp
          </a>
          <button
            type="button"
            onClick={copyToClipboard}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary-200 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
          >
            <FontAwesomeIcon icon={faLink} />
            {locale === "en" ? "Copy link" : "Salin tautan"}
          </button>
          {shareStatus ? (
            <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700 ring-1 ring-primary-100">
              {shareStatus}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
