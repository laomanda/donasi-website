import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardCheck, faReceipt } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

export function AdminDashboardHeader() {
  const navigate = useNavigate();

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
            <span className="h-2 w-2 rounded-full bg-brandGreen-400" />
            Dashboard Admin
          </span>
          <div className="space-y-2">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Ringkasan Operasional
            </h1>
            <p className="text-sm font-medium text-slate-600">
              Pantau donasi, layanan, dan tugas editor secara cepat dan terukur.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/admin/donations")}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <FontAwesomeIcon icon={faReceipt} />
              Kelola Donasi
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/donation-confirmations")}
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700"
            >
              <FontAwesomeIcon icon={faClipboardCheck} />
              Konfirmasi Donasi
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminDashboardHeader;
