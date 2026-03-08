import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

interface UserFormHeaderProps {
  mode: "create" | "edit";
}

export function UserFormHeader({ mode }: UserFormHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-emerald-600 shadow-xl">
      <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10" />
      <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl" />

      <div className="relative z-10 p-8 md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white ring-1 ring-white/20">
                <span className="h-2 w-2 rounded-full bg-emerald-200 shadow-[0_0_8px_rgba(167,243,208,0.6)]" />
                {mode === "create" ? "Registrasi Baru" : "Pembaruan Data"}
              </span>
              <h1 className="mt-3 font-heading text-3xl font-bold text-white md:text-5xl text-shadow-sm">
                {mode === "create" ? "Tambah Pengguna" : "Ubah Pengguna"}
              </h1>
              <p className="mt-2 max-w-2xl text-lg font-medium text-emerald-100/90">
                {mode === "create"
                  ? "Lengkapi formulir di bawah ini untuk mendaftarkan pengguna baru ke dalam sistem."
                  : "Perbarui informasi profil, hak akses peran, dan status akun pengguna."}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/superadmin/users")}
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Kembali
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
