import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faImages } from "@fortawesome/free-solid-svg-icons";
import { imagePlaceholder } from "@/lib/placeholder";
import {
  formatGalleryDpfDate,
  getGalleryDpfStatusLabel,
  getGalleryDpfStatusTone,
  resolveGalleryDpfUrl,
  type GalleryDpf,
} from "../GalleryDpfTypes";

type Props = {
  items: GalleryDpf[];
  loading: boolean;
  onEdit: (id: number) => void;
};

export default function EditorGalleryDpfTable({
  items,
  loading,
  onEdit,
}: Props) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <table className="min-w-full table-fixed text-left">
          <thead className="border-b border-slate-200 bg-slate-50/80">
            <tr>
              <th className="w-28 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Gambar
              </th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Caption
              </th>
              <th className="w-32 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Status
              </th>
              <th className="w-40 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Diperbarui
              </th>
              <th className="w-24 px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-6 py-5">
                    <div className="h-14 w-20 rounded-xl bg-slate-100" />
                  </td>
                  <td className="px-6 py-5">
                    <div className="h-4 w-48 rounded bg-slate-100" />
                  </td>
                  <td className="px-6 py-5">
                    <div className="h-6 w-20 rounded-full bg-slate-100" />
                  </td>
                  <td className="px-6 py-5">
                    <div className="h-4 w-24 rounded bg-slate-100" />
                  </td>
                  <td className="px-6 py-5">
                    <div className="ml-auto h-8 w-10 rounded-xl bg-slate-100" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-sm font-semibold text-slate-500">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <FontAwesomeIcon icon={faImages} className="text-xl" />
                  </div>
                  <p className="mt-3">Belum ada dokumentasi aktivitas DPF.</p>
                </td>
              </tr>
            ) : (
              items.map((item) => {
                return (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-slate-50/80"
                  >
                    <td className="px-6 py-5">
                      <div className="h-14 w-20 overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200">
                        <img
                          src={resolveGalleryDpfUrl(item.image)}
                          alt="Aktivitas DPF"
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.src = imagePlaceholder;
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-5 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="inline-flex shrink-0 items-center rounded-md bg-primary-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                          ID
                        </span>
                        <p className="line-clamp-2 text-sm font-bold text-slate-900 leading-snug">
                          {item.caption_id || "-"}
                        </p>
                      </div>
                      {item.caption_en && (
                        <div className="flex items-start gap-2">
                          <span className="inline-flex shrink-0 items-center rounded-md bg-brandGreen-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                            EN
                          </span>
                          <p className="line-clamp-2 text-sm font-bold text-slate-900 leading-snug">
                            {item.caption_en}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ${getGalleryDpfStatusTone(
                          item.status
                        )}`}
                      >
                        {getGalleryDpfStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-xs font-semibold text-slate-600">
                      {formatGalleryDpfDate(item.updated_at ?? item.created_at)}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => onEdit(item.id)}
                          aria-label="Ubah aktivitas"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-brandGreen-600"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="divide-y divide-slate-100 md:hidden">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex gap-4 p-4 animate-pulse">
              <div className="h-20 w-28 rounded-xl bg-slate-100" />
              <div className="flex-1 space-y-2 py-2">
                <div className="h-4 w-3/4 rounded bg-slate-100" />
                <div className="h-3 w-1/2 rounded bg-slate-100" />
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm font-semibold text-slate-500">
            Belum ada dokumentasi aktivitas DPF.
          </div>
        ) : (
          items.map((item) => {
            return (
              <div
                key={item.id}
                className="p-4 transition-colors hover:bg-slate-50/80"
              >
                <div className="flex gap-3 items-start">
                  <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200">
                    <img
                      src={resolveGalleryDpfUrl(item.image)}
                      alt="Aktivitas DPF"
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.src = imagePlaceholder;
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-start gap-1.5">
                          <span className="inline-flex shrink-0 items-center rounded bg-primary-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                            ID
                          </span>
                          <p className="line-clamp-2 text-sm font-bold text-slate-900 leading-snug">
                            {item.caption_id}
                          </p>
                        </div>
                        {item.caption_en && (
                          <div className="flex items-start gap-1.5">
                            <span className="inline-flex shrink-0 items-center rounded bg-brandGreen-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                              EN
                            </span>
                            <p className="line-clamp-2 text-sm font-bold text-slate-900 leading-snug">
                              {item.caption_en}
                            </p>
                          </div>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold uppercase ring-1 ${getGalleryDpfStatusTone(
                          item.status
                        )}`}
                      >
                        {getGalleryDpfStatusLabel(item.status)}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {formatGalleryDpfDate(item.updated_at ?? item.created_at)}
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(item.id)}
                          aria-label="Ubah aktivitas"
                          className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-brandGreen-50 hover:text-brandGreen-600"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
