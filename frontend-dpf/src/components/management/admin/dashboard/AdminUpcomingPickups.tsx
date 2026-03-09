import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare, faTruckFast } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

interface AdminUpcomingPickupsProps {
  loading: boolean;
  pickups: any[];
}

export function AdminUpcomingPickups({ loading, pickups }: AdminUpcomingPickupsProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-[28px] border border-amber-100 bg-amber-50/50 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Logistik</p>
          <h2 className="font-heading text-lg font-bold text-slate-900">Agenda Jemputan</h2>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
          <FontAwesomeIcon icon={faTruckFast} />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-16 rounded-2xl bg-white/60 animate-pulse" />
          ))
        ) : pickups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-amber-200 bg-white/40 p-4 text-center text-sm font-medium text-amber-700">
            Tidak ada jadwal jemputan baru.
          </div>
        ) : (
          pickups.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate("/admin/pickup-requests")}
              className="flex w-full items-start gap-3 rounded-2xl border border-amber-100 border-l-4 border-l-amber-500 bg-white p-3 text-left shadow-sm transition hover:border-amber-300 hover:shadow-md"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <span className="text-xs font-bold">{item.district ? item.district.substring(0, 2).toUpperCase() : "??"}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-bold text-slate-900">{item.donor_name}</p>
                <p className="text-xs font-medium text-slate-500">
                  {item.district || "Area belum set"} • {item.preferred_time || "Waktu fleksibel"}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
      <button
        type="button"
        onClick={() => navigate("/admin/pickup-requests")}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-amber-500 hover:text-white"
      >
        Lihat Semua
        <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" />
      </button>
    </div>
  );
}

export default AdminUpcomingPickups;
