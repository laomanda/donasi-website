import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

type AdminAllocationCreateHeaderProps = {
  submitting: boolean;
};

export default function AdminAllocationCreateHeader({ submitting }: AdminAllocationCreateHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith("/keuangan") ? "/keuangan" : "/admin";

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-slate-900 shadow-2xl">
      <div className="absolute inset-0 bg-emerald-700" />
      <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl filter" />
      <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl filter" />

      <div className="relative z-10 p-8 md:p-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <h1 className="font-heading text-3xl font-black tracking-tight text-white md:text-5xl">
              Buat Penyaluran Baru
            </h1>
            <p className="max-w-2xl text-base md:text-lg font-medium text-emerald-100/90">
              Salurkan dana donasi program secara langsung, transparan, dan akuntabel.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(`${basePath}/allocations`)}
            className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-slate-800 transition-all hover:bg-slate-50 hover:shadow-lg active:scale-[0.98] shadow-md shrink-0"
            disabled={submitting}
          >
            <FontAwesomeIcon
              icon={faArrowLeft}
              className="text-emerald-600 transition-transform group-hover:-translate-x-1"
            />
            Kembali ke Daftar
          </button>
        </div>
      </div>
    </div>
  );
}
