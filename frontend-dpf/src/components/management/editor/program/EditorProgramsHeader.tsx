import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { SectionCard } from "./EditorProgramUI";

export default function EditorProgramsHeader() {
    const navigate = useNavigate();
    return (
        <SectionCard borderL="border-l-brandGreen-400">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-700">
                        <span className="h-2 w-2 rounded-full bg-brandGreen-500" />
                        Konten
                    </span>
                    <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">Program</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600">
                        Kelola program: draft, aktif, selesai, dan arsip.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/editor/programs/create")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brandGreen-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-700"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    Buat Program
                </button>
            </div>
        </SectionCard>
    );
}
