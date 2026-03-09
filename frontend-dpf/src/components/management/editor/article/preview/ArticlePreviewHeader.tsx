import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCircleInfo, faEye } from "@fortawesome/free-solid-svg-icons";

type Props = {
  onBack: () => void;
  backLabel: string;
  previewLabel: string;
  unsavedLabel: string;
};

export default function ArticlePreviewHeader({ onBack, backLabel, previewLabel, unsavedLabel }: Props) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        {backLabel}
      </button>
      <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
        <FontAwesomeIcon icon={faEye} className="text-slate-500" />
        {previewLabel}
      </span>
      <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
        <FontAwesomeIcon icon={faCircleInfo} />
        {unsavedLabel}
      </span>
    </div>
  );
}
