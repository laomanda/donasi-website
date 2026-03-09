import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

type Props = {
    page: number;
    lastPage: number;
    loading: boolean;
    onPageChange: (newPage: number) => void;
};

export default function EditorProgramsPagination({ page, lastPage, loading, onPageChange }: Props) {
    return (
        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold text-slate-500">Halaman {page} dari {lastPage}</p>
            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={loading || page <= 1}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                    Sebelumnya
                </button>
                <button
                    type="button"
                    onClick={() => onPageChange(Math.min(lastPage, page + 1))}
                    disabled={loading || page >= lastPage}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Berikutnya
                    <FontAwesomeIcon icon={faArrowRight} />
                </button>
            </div>
        </div>
    );
}
