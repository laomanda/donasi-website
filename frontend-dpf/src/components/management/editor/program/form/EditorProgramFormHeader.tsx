import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { SectionCard } from "../EditorProgramUI";
import type { FormMode } from "../EditorProgramTypes";

type Props = {
    mode: FormMode;
    saving: boolean;
    uploading: boolean;
    deleting: boolean;
    canSubmit: boolean;
    onSubmit: () => void;
};

export default function EditorProgramFormHeader({
    mode,
    saving,
    uploading,
    deleting,
    canSubmit,
    onSubmit,
}: Props) {
    const navigate = useNavigate();
    const title = mode === "create" ? "Buat Program" : "Ubah Program";

    return (
        <SectionCard borderL="border-l-brandGreen-400">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-700">
                        <span className="h-2 w-2 rounded-full bg-brandGreen-500" />
                        Program
                    </span>
                    <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">{title}</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600">
                        {mode === "create"
                            ? "Susun informasi program dengan deskripsi yang jelas dan target yang terukur."
                            : "Perbarui detail program agar tetap rapi dan akurat."}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 md:flex md:flex-wrap md:items-center">
                    <button
                        type="button"
                        onClick={() => navigate("/editor/programs")}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                        disabled={saving || uploading || deleting}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Kembali
                    </button>

                    <button
                        type="button"
                        onClick={onSubmit}
                        className="inline-flex items-center justify-center rounded-2xl bg-brandGreen-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-700 disabled:cursor-not-allowed disabled:opacity-70"
                        disabled={!canSubmit}
                    >
                        {saving ? "Menyimpan..." : "Simpan"}
                    </button>
                </div>
            </div>
        </SectionCard>
    );
}
