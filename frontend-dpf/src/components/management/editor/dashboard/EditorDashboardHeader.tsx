import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen, faHeart } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

type Props = {
  displayName: string;
};

const getGreeting = (date: Date) => {
  const hour = date.getHours();
  if (hour >= 4 && hour < 11) return "Selamat Pagi";
  if (hour >= 11 && hour < 15) return "Selamat Siang";
  if (hour >= 15 && hour < 19) return "Selamat Sore";
  return "Selamat Malam";
};

export default function EditorDashboardHeader({ displayName }: Props) {
  const navigate = useNavigate();
  const today = useMemo(() => new Date(), []);

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
            <span className="h-2 w-2 rounded-full bg-brandGreen-400" />
            Ruang Kerja Editor
          </span>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {getGreeting(today)}, <span className="text-brandGreen-600">{displayName}</span>
          </h1>
          <p className="text-sm font-medium text-slate-600">
            Fokus pada tugas penting agar progres hari ini lebih jelas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:flex-nowrap">
          <button
            type="button"
            onClick={() => navigate("/editor/articles/create")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 sm:w-auto"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white text-slate-900">
              <FontAwesomeIcon icon={faBookOpen} size="xs" />
            </span>
            Buat Artikel
          </button>

          <button
            type="button"
            onClick={() => navigate("/editor/programs/create")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 sm:w-auto"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white text-emerald-700">
              <FontAwesomeIcon icon={faHeart} size="xs" />
            </span>
            Buat Program
          </button>
        </div>
      </header>
    </div>
  );
}
