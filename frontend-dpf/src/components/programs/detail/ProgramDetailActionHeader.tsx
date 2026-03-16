import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowLeft, 
  faShareNodes, 
  faCopy,
  faBookmark as faBookmarkSolid
} from "@fortawesome/free-solid-svg-icons";
import { faBookmark as faBookmarkRegular } from "@fortawesome/free-regular-svg-icons";
import { useSavedItems } from "@/lib/SavedItemsContext";

interface ProgramDetailActionHeaderProps {
  programId: number;
  locale: "id" | "en";
  shareStatus: string | null;
  onShare: () => void;
  onCopyLink: () => void;
}

export function ProgramDetailActionHeader({ 
  programId,
  locale, 
  shareStatus, 
  onShare, 
  onCopyLink 
}: ProgramDetailActionHeaderProps) {
  const navigate = useNavigate();
  const { toggleSave, isSaved } = useSavedItems();
  const saved = isSaved(programId, 'Program');

  return (
    <div className="mb-8 rounded-[24px] border border-slate-200 bg-white/90 px-4 py-4 shadow-sm sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            {locale === "en" ? "Back" : "Kembali"}
          </button>
          <span className="hidden h-4 w-px bg-slate-200 sm:inline-flex" />
          <Link to="/program" className="text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors">
            {locale === "en" ? "View other programs" : "Lihat program lain"}
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onShare}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <FontAwesomeIcon icon={faShareNodes} />
            <span className="hidden sm:inline">{locale === "en" ? "Share" : "Bagikan"}</span>
          </button>
          <button
            type="button"
            onClick={onCopyLink}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <FontAwesomeIcon icon={faCopy} />
            <span className="hidden sm:inline">{locale === "en" ? "Copy" : "Salin"}</span>
          </button>
          <button
            type="button"
            onClick={() => toggleSave(programId, 'Program')}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition active:scale-95 ${
              saved 
                ? "bg-primary-600 text-white border-primary-600 hover:bg-primary-700" 
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <FontAwesomeIcon icon={saved ? faBookmarkSolid : faBookmarkRegular} />
            <span className="hidden sm:inline">{saved ? (locale === "en" ? "Saved" : "Tersimpan") : (locale === "en" ? "Save" : "Simpan")}</span>
          </button>
          {shareStatus ? (
            <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 ring-1 ring-primary-100">
              {shareStatus}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
