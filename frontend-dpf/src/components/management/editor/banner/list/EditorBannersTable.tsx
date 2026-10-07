import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { type Banner, resolveBannerUrl, formatBannerDate } from "../EditorBannerTypes";
import { imagePlaceholder } from "@/lib/placeholder";

type Props = {
  banners: Banner[];
  loading: boolean;
  onEdit: (id: number) => void;
  selectedIds?: Set<number>;
  allPageSelected?: boolean;
  onToggle?: (id: number) => void;
  onToggleAll?: () => void;
};

export default function EditorBannersTable({
  banners,
  loading,
  onEdit,
  selectedIds,
  allPageSelected,
  onToggle,
  onToggleAll,
}: Props) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Desktop View */}
      <div className="hidden md:block">
        <table className="min-w-full table-fixed text-left">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="w-12 px-6 py-4 text-center">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={onToggleAll}
                  aria-label="Pilih semua banner"
                  className="h-4 w-4 rounded border-slate-300 text-brandGreen-600 focus:ring-brandGreen-500 accent-brandGreen-600"
                />
              </th>
              <th className="w-24 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Urutan</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Banner</th>
              <th className="w-36 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Status</th>
              <th className="w-40 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Diperbarui</th>
              <th className="w-24 px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
               Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-5 text-center"><div className="mx-auto h-4 w-4 rounded bg-slate-100" /></td>
                  <td className="px-6 py-5"><div className="h-6 w-12 rounded bg-slate-100" /></td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-20 rounded-xl bg-slate-100" />
                      <div className="h-4 w-32 rounded bg-slate-100" />
                    </div>
                  </td>
                  <td className="px-6 py-5"><div className="h-6 w-20 rounded-full bg-slate-100" /></td>
                  <td className="px-6 py-5"><div className="h-4 w-24 rounded bg-slate-100" /></td>
                  <td className="px-6 py-5"><div className="ml-auto h-8 w-10 rounded-xl bg-slate-100" /></td>
                </tr>
              ))
            ) : banners.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm font-semibold text-slate-500">
                  Belum ada banner yang ditambahkan.
                </td>
              </tr>
            ) : (
              banners.map((banner) => (
                <tr key={banner.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds?.has(banner.id)}
                      onChange={() => onToggle?.(banner.id)}
                      aria-label={`Pilih banner #${banner.display_order}`}
                      className="h-4 w-4 rounded border-slate-300 text-brandGreen-600 focus:ring-brandGreen-500 accent-brandGreen-600"
                    />
                  </td>
                  <td className="px-6 py-5 font-mono font-bold text-slate-800 text-sm">
                    #{banner.display_order}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-24 overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200 shadow-sm">
                        <img
                          src={resolveBannerUrl(banner.image_path) ?? imagePlaceholder}
                          alt="Banner"
                          className="h-full w-full object-cover"
                          onError={(e) => (e.currentTarget.src = imagePlaceholder)}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm">Banner #{banner.display_order}</p>
                        <p className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">{banner.image_path}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {banner.status === "draft" ? (
                      <span className="inline-flex items-center rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-xs">
                        Draf
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-xs">
                        Dipublikasikan
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-sm font-semibold text-slate-600">
                    {formatBannerDate(banner.updated_at ?? banner.created_at)}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => onEdit(banner.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 hover:text-brandGreen-600 transition"
                      >
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden divide-y divide-slate-100">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 animate-pulse space-y-3">
              <div className="flex gap-4">
                <div className="h-16 w-28 rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 w-3/4 bg-slate-100 rounded" />
                  <div className="h-3 w-1/2 bg-slate-100 rounded" />
                </div>
              </div>
            </div>
          ))
        ) : banners.length === 0 ? (
          <div className="p-8 text-center text-sm font-semibold text-slate-500">
            Belum ada banner.
          </div>
        ) : (
          banners.map((banner) => (
            <div key={banner.id} className="p-4 bg-white hover:bg-slate-50">
              <div className="flex items-start gap-3">
                <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds?.has(banner.id)}
                    onChange={() => onToggle?.(banner.id)}
                    aria-label={`Pilih banner #${banner.display_order}`}
                    className="h-4 w-4 rounded border-slate-300 text-brandGreen-600 focus:ring-brandGreen-500 accent-brandGreen-600"
                  />
                </div>
                <div className="h-20 w-32 overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200 shadow-sm shrink-0">
                   <img
                      src={resolveBannerUrl(banner.image_path) ?? imagePlaceholder}
                      alt="Banner"
                      className="h-full w-full object-cover"
                      onError={(e) => (e.currentTarget.src = imagePlaceholder)}
                    />
                </div>
                <div className="min-w-0 flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-slate-900 line-clamp-1">Banner #{banner.display_order}</p>
                      {banner.status === "draft" ? (
                        <span className="inline-flex items-center rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                          Draf
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                          Dipublikasikan
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">Urutan: #{banner.display_order}</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {formatBannerDate(banner.updated_at ?? banner.created_at)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(banner.id)}
                        className="p-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-brandGreen-50 hover:text-brandGreen-600 transition"
                      >
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
