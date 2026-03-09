import type { Consultation, ConsultationStatus } from "@/types/consultation";

interface AdminConsultationListProps {
  items: Consultation[];
  loading: boolean;
  selection: {
    isSelected: (id: number) => boolean;
    toggleAll: (ids: number[]) => void;
    toggle: (id: number) => void;
  };
  pageIds: number[];
  getStatusTone: (status: ConsultationStatus) => string;
  getStatusLabel: (status: ConsultationStatus) => string;
  formatDateTime: (value?: string | null) => string;
  onOpenDetail: (id: number) => void;
}

export default function AdminConsultationList({
  items,
  loading,
  selection,
  pageIds,
  getStatusTone,
  getStatusLabel,
  formatDateTime,
  onOpenDetail,
}: AdminConsultationListProps) {
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selection.isSelected(id));

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-100">
      {/* Desktop Table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full table-fixed">
          <thead className="bg-slate-50">
            <tr>
              <th className="w-[6%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => selection.toggleAll(pageIds)}
                  aria-label="Pilih semua di halaman"
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
              </th>
              <th className="w-[24%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Pemohon
              </th>
              <th className="w-[42%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Topik
              </th>
              <th className="w-[14%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Status
              </th>
              <th className="w-[14%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Waktu
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 7 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-6 py-5">
                    <div className="h-4 w-4 rounded bg-slate-100" />
                  </td>
                  <td className="px-6 py-5">
                    <div className="h-4 w-32 rounded bg-slate-100" />
                    <div className="mt-2 h-3 w-24 rounded bg-slate-100" />
                  </td>
                  <td className="px-6 py-5">
                    <div className="h-4 w-56 rounded bg-slate-100" />
                  </td>
                  <td className="px-6 py-5">
                    <div className="h-6 w-24 rounded-full bg-slate-100" />
                  </td>
                  <td className="px-6 py-5">
                    <div className="h-4 w-28 rounded bg-slate-100" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                  Belum ada konsultasi.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const statusValue = String(item.status ?? "").trim().toLowerCase();
                let barColor = "border-l-slate-200";
                if (statusValue === "dibalas") barColor = "border-l-emerald-500";
                else if (statusValue === "baru") barColor = "border-l-amber-500";
                else if (statusValue === "ditutup") barColor = "border-l-slate-500";

                return (
                  <tr
                    key={item.id}
                    className={`cursor-pointer transition hover:bg-slate-50 border-l-4 ${barColor}`}
                    onClick={() => onOpenDetail(item.id)}
                  >
                    <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selection.isSelected(item.id)}
                        onChange={() => selection.toggle(item.id)}
                        aria-label={`Pilih konsultasi ${item.name}`}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <p className="line-clamp-1 text-sm font-bold text-slate-900">{item.name}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {item.phone || item.email || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="line-clamp-1 text-sm font-semibold text-slate-900">{item.topic}</p>
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">{item.message}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${getStatusTone(String(item.status ?? ""))}`}>
                        {getStatusLabel(String(item.status ?? ""))}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-600">
                      {formatDateTime(item.created_at)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="divide-y divide-slate-100 md:hidden">
        {loading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="p-5 animate-pulse">
              <div className="h-4 w-2/3 rounded bg-slate-100" />
              <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
              <div className="mt-4 h-6 w-24 rounded-full bg-slate-100" />
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-sm font-semibold text-slate-500">Belum ada konsultasi.</div>
        ) : (
          items.map((item) => {
            const statusValue = String(item.status ?? "").trim().toLowerCase();
            let barColor = "border-l-slate-200";
            if (statusValue === "dibalas") barColor = "border-l-emerald-500";
            else if (statusValue === "baru") barColor = "border-l-amber-500";
            else if (statusValue === "ditutup") barColor = "border-l-slate-500";

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onOpenDetail(item.id)}
                className={`w-full p-5 text-left transition hover:bg-slate-50 border-l-4 ${barColor}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-bold text-slate-900">{item.name}</p>
                    <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">{item.topic}</p>
                  </div>
                  <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-bold ${getStatusTone(String(item.status ?? ""))}`}>
                    {getStatusLabel(String(item.status ?? ""))}
                  </span>
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-500">{formatDateTime(item.created_at)}</p>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
