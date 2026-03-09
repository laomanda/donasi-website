import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";

interface AdminTaskHeaderProps {
  onAddClick: () => void;
}

export default function AdminTaskHeader({ onAddClick }: AdminTaskHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-[32px] bg-emerald-600 shadow-xl transition-all duration-500">
      <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10" />
      <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10 p-6 sm:p-8 md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white ring-1 ring-white/30 backdrop-blur-sm sm:text-[11px]">
                <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                Manajemen Konten
              </span>
              <h1 className="mt-3 font-heading text-2xl font-bold text-white sm:text-3xl md:text-5xl text-shadow-sm">
                Tugas Editor
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-medium text-white/90 sm:text-lg">
                Kelola penugasan konten, pantau progres editor, dan pastikan target publikasi tercapai tepat waktu.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onAddClick}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-emerald-700 shadow-lg transition-all hover:bg-emerald-50 active:scale-95 sm:w-auto sm:py-4"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition group-hover:bg-emerald-200">
                <FontAwesomeIcon icon={faCirclePlus} className="text-xs" />
              </div>
              Buat Tugas Baru
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
