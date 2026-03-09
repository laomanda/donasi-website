import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare, faComments } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

interface AdminUrgentConsultationsProps {
  loading: boolean;
  consultations: any[];
  formatDateTime: (value: string | null | undefined) => string;
}

export function AdminUrgentConsultations({ loading, consultations, formatDateTime }: AdminUrgentConsultationsProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-[28px] border border-violet-100 bg-violet-50/50 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">Layanan Umat</p>
          <h2 className="font-heading text-lg font-bold text-slate-900">Antrean Konsultasi</h2>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
          <FontAwesomeIcon icon={faComments} />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-16 rounded-2xl bg-white/60 animate-pulse" />
          ))
        ) : consultations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-violet-200 bg-white/40 p-4 text-center text-sm font-medium text-violet-700">
            Tidak ada pesan belum dibalas.
          </div>
        ) : (
          consultations.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(`/admin/consultations/${item.id}`)}
              className="flex w-full items-start gap-3 rounded-2xl border border-violet-100 border-l-4 border-l-violet-600 bg-white p-3 text-left shadow-sm transition hover:border-violet-300 hover:shadow-md"
            >
              <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-rose-500 ring-2 ring-rose-100" title="Belum dibalas" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-bold text-slate-900">{item.name}</p>
                <p className="line-clamp-1 text-xs text-slate-500">
                  Topik: {item.topic}
                </p>
                <p className="mt-1 text-[10px] font-bold text-violet-600">
                  {formatDateTime(item.created_at)}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
      <button
        type="button"
        onClick={() => navigate("/admin/consultations")}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-violet-600 hover:text-white"
      >
        Lihat Semua
        <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" />
      </button>
    </div>
  );
}

export default AdminUrgentConsultations;
