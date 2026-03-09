import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

type AdminAllocationCreateHeaderProps = {
  submitting: boolean;
};

export default function AdminAllocationCreateHeader({ submitting }: AdminAllocationCreateHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-slate-900 shadow-2xl">
      <div className="absolute inset-0 bg-brandGreen-600" />
      <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full" />
      <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full" />

      <div className="relative z-10 p-8 md:p-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <h1 className="font-heading text-3xl font-black tracking-tight text-white md:text-6xl text-shadow-sm">
              Buat Alokasi Baru
            </h1>
            <p className="max-w-2xl text-lg font-medium text-white">
              Alokasikan dana untuk Mitra dengan mudah dan transparan.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/allocations")}
            className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-8 py-5 text-sm font-bold text-emerald-600 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-black/10"
            disabled={submitting}
          >
            <FontAwesomeIcon
              icon={faArrowLeft}
              className="bg-emerald-200/20 p-1 rounded-full transition-transform group-hover:-translate-x-1"
            />
            Kembali ke Daftar
          </button>
        </div>
      </div>
    </div>
  );
}
