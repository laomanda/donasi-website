import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";

interface UserStatusAksiSidebarProps {
  isActive: boolean;
  setIsActive: (val: boolean) => void;
  loading: boolean;
  saving: boolean;
  onSubmit: () => void;
  canSubmit: boolean;
}

export function UserStatusAksiSidebar({
  isActive,
  setIsActive,
  loading,
  saving,
  onSubmit,
  canSubmit,
}: UserStatusAksiSidebarProps) {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8 sticky top-6">
      <h3 className="font-heading text-lg font-bold text-slate-900 mb-6">Status & Aksi</h3>

      <button
        type="button"
        onClick={() => setIsActive(!isActive)}
        disabled={loading || saving}
        className={`w-full flex items-center justify-between rounded-2xl border p-4 transition-all ${isActive
          ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-500/20"
          : "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30 ring-2 ring-red-500/20"
          }`}
      >
        <span className="font-bold text-sm">Status Akun</span>
        <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-1 rounded-lg">
          {isActive ? "Aktif" : "Nonaktif"}
        </span>
      </button>

      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="group w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-700 hover:shadow-emerald-600/40 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:translate-y-0"
        >
          {saving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Menyimpan...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faFloppyDisk} className="transition group-hover:scale-110" />
              Simpan Perubahan
            </>
          )}
        </button>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Catatan Sistem</p>
        <ul className="space-y-3">
          <li className="flex gap-3 text-xs font-medium text-slate-600 leading-relaxed">
            <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            Pengguna yang dinonaktifkan tidak akan dapat masuk ke sistem.
          </li>
          <li className="flex gap-3 text-xs font-medium text-slate-600 leading-relaxed">
            <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            Peran menentukan akses ke menu dan fitur administrasi.
          </li>
        </ul>
      </div>
    </div>
  );
}
