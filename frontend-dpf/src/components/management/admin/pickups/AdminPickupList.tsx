import { } from "react";
import type { PickupRequest, PickupStatus } from "@/types/pickup";

interface AdminPickupListProps {
  items: PickupRequest[];
  loading: boolean;
  selection: {
    isSelected: (id: number) => boolean;
    toggleAll: (ids: number[]) => void;
    toggle: (id: number) => void;
  };
  pageIds: number[];
  getStatusTone: (status: PickupStatus) => string;
  getStatusLabel: (status: PickupStatus) => string;
  formatDateTime: (value?: string | null) => string;
  onOpenDetail: (id: number) => void;
}

export default function AdminPickupList({
  items,
  loading,
  selection,
  pageIds,
  getStatusTone,
  getStatusLabel,
  formatDateTime,
  onOpenDetail,
}: AdminPickupListProps) {
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
              <th className="w-[22%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Donatur
              </th>
              <th className="w-[28%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Lokasi
              </th>
              <th className="w-[18%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Jenis wakaf
              </th>
              <th className="w-[14%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Status
              </th>
              <th className="w-[12%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
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
                    <div className="h-4 w-48 rounded bg-slate-100" />
                  </td>
                  <td className="px-6 py-5">
                    <div className="h-4 w-32 rounded bg-slate-100" />
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
                <td colSpan={6} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                  Belum ada permintaan jemput.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const statusValue = String(item.status ?? "").trim().toLowerCase();
                let barColor = "border-l-slate-200";
                if (statusValue === "selesai") barColor = "border-l-emerald-500";
                else if (statusValue === "baru") barColor = "border-l-amber-500";
                else if (statusValue === "dijadwalkan") barColor = "border-l-blue-500";
                else if (statusValue === "dibatalkan") barColor = "border-l-rose-500";

                return (
                  <tr
                    key={item.id}
                    className="group cursor-pointer transition hover:bg-slate-50 border-l-4 border-l-transparent"
                    onClick={() => onOpenDetail(item.id)}
                    style={{ borderLeftColor: barColor.split('-').pop()?.replace('500', '#10b981') }} // Quick fix for tailwind dynamic classes if needed, but better to use classes
                  >
                    {/* Re-implementing classes properly */}
                    <td 
                      className={`px-6 py-5 border-l-4 ${barColor}`} 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selection.isSelected(item.id)}
                        onChange={() => selection.toggle(item.id)}
                        aria-label={`Pilih permintaan ${item.donor_name}`}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <p className="line-clamp-1 text-sm font-bold text-slate-900">{item.donor_name}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{item.donor_phone}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="line-clamp-1 text-sm font-semibold text-slate-900">{item.city}, {item.district}</p>
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">{item.address_full}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-slate-900">{item.zakat_type}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.estimation ? item.estimation : "-"}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${getStatusTone(item.status ?? "")}`}>
                        {getStatusLabel(item.status ?? "")}
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
          <div className="p-6 text-center text-sm font-semibold text-slate-500">Belum ada permintaan.</div>
        ) : (
          items.map((item) => {
            const statusValue = String(item.status ?? "").trim().toLowerCase();
            let barColor = "border-l-slate-200";
            if (statusValue === "selesai") barColor = "border-l-emerald-500";
            else if (statusValue === "baru") barColor = "border-l-amber-500";
            else if (statusValue === "dijadwalkan") barColor = "border-l-blue-500";
            else if (statusValue === "dibatalkan") barColor = "border-l-rose-500";

            return (
              <div
                key={item.id}
                className={`flex gap-3 p-5 transition hover:bg-slate-50 border-l-4 ${barColor}`}
                onClick={() => onOpenDetail(item.id)}
              >
                <div onClick={(e) => e.stopPropagation()} className="pt-0.5">
                   <input
                    type="checkbox"
                    checked={selection.isSelected(item.id)}
                    onChange={() => selection.toggle(item.id)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-sm font-bold text-slate-900">{item.donor_name}</p>
                      <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">{item.city}, {item.district}</p>
                    </div>
                    <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-bold ${getStatusTone(item.status ?? "")}`}>
                      {getStatusLabel(item.status ?? "")}
                    </span>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-slate-500">{formatDateTime(item.created_at)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
