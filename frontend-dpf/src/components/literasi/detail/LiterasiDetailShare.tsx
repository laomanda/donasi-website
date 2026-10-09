import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareNodes, faLink, faCheck } from "@fortawesome/free-solid-svg-icons";
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
  const isCopied = Boolean(shareStatus);

  return (
    <div className="mt-10 border-t border-slate-100 pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {locale === "en" ? "Share" : "Bagikan"}
          </p>
          <p className="mt-0.5 text-xs sm:text-sm font-semibold text-slate-600">
            {locale === "en" ? "Share this useful information." : "Sebarkan informasi bermanfaat ini."}
          </p>
        </div>

        {/* Tombol aksi berbagi selalu sejajar (1 baris rapi di semua ukuran layar) */}
        <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto flex-nowrap shrink-0">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl bg-primary-500 px-3.5 py-2.5 sm:px-4 text-xs sm:text-sm font-bold text-white shadow-xs transition-colors hover:bg-primary-600 shrink-0 whitespace-nowrap"
          >
            <FontAwesomeIcon icon={faShareNodes} />
            <span>{locale === "en" ? "Share" : "Bagikan"}</span>
          </button>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl bg-brandGreen-500 px-3.5 py-2.5 sm:px-4 text-xs sm:text-sm font-bold text-white shadow-xs transition-colors hover:bg-brandGreen-600 shrink-0 whitespace-nowrap"
          >
            <FontAwesomeIcon icon={faWhatsapp} />
            <span>WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={copyToClipboard}
            className={`inline-flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl border px-3.5 py-2.5 sm:px-4 text-xs sm:text-sm font-bold shadow-xs transition-colors shrink-0 whitespace-nowrap ${
              isCopied
                ? "border-brandGreen-500 bg-brandGreen-50 text-brandGreen-700"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <FontAwesomeIcon icon={isCopied ? faCheck : faLink} />
            <span>
              {isCopied
                ? (locale === "en" ? "Copied!" : "Tersalin!")
                : (locale === "en" ? "Copy link" : "Salin tautan")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}


