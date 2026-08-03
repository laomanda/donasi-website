import { Fragment } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
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
  onDelete: (item: GalleryDpf) => void;
  confirmDeleteId: number | null;
  setConfirmDeleteId: (id: number | null) => void;
  deletingId: number | null;
};

export default function EditorGalleryDpfTable({ items, loading, onEdit, onDelete, confirmDeleteId, setConfirmDeleteId, deletingId }: Props) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="hidden md:block">
        <table className="min-w-full table-fixed text-left">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="w-28 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Gambar</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Caption</th>
              <th className="w-32 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Status</th>
              <th className="w-36 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Diperbarui</th>
              <th className="w-28 px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? Array.from({ length: 4 }).map((_, index) => (
              <tr key={index} className="animate-pulse">
                <td className="px-6 py-5"><div className="h-14 w-20 rounded-xl bg-slate-100" /></td>
                <td className="px-6 py-5"><div className="h-4 w-48 rounded bg-slate-100" /></td>
                <td className="px-6 py-5"><div className="h-6 w-20 rounded-full bg-slate-100" /></td>
                <td className="px-6 py-5"><div className="h-4 w-24 rounded bg-slate-100" /></td>
                <td className="px-6 py-5"><div className="ml-auto h-8 w-16 rounded-xl bg-slate-100" /></td>
              </tr>
            )) : items.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-sm font-semibold text-slate-500">Belum ada aktivitas DPF.</td></tr>
            ) : items.map((item) => (
              <Fragment key={item.id}>
                <tr className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-5">
                    <div className="h-14 w-20 overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200">
                      <img src={resolveGalleryDpfUrl(item.image)} alt="Aktivitas DPF" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.src = imagePlaceholder; }} />
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-slate-900">{item.caption_id}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">{item.caption_en}</p>
                  </td>
                  <td className="px-6 py-5"><span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ${getGalleryDpfStatusTone(item.status)}`}>{getGalleryDpfStatusLabel(item.status)}</span></td>
                  <td className="px-6 py-5 text-sm font-semibold text-slate-600">{formatGalleryDpfDate(item.updated_at ?? item.created_at)}</td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" onClick={() => onEdit(item.id)} aria-label="Ubah aktivitas" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-brandGreen-600"><FontAwesomeIcon icon={faPenToSquare} /></button>
                      <button type="button" onClick={() => setConfirmDeleteId(confirmDeleteId === item.id ? null : item.id)} aria-label="Hapus aktivitas" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-100 bg-white text-rose-500 shadow-sm transition hover:bg-rose-50"><FontAwesomeIcon icon={faTrash} /></button>
                    </div>
                  </td>
                </tr>
                {confirmDeleteId === item.id && <tr><td colSpan={5} className="bg-rose-50/50 px-6 py-4"><div className="flex items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-white p-4 shadow-sm"><div><p className="text-sm font-bold text-slate-900">Hapus aktivitas ini?</p><p className="text-xs font-medium text-slate-500">Gambar akan dihapus dari storage. Tindakan ini tidak dapat dibatalkan.</p></div><div className="flex gap-2"><button type="button" onClick={() => setConfirmDeleteId(null)} className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100">Batal</button><button type="button" onClick={() => onDelete(item)} disabled={deletingId === item.id} className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50">{deletingId === item.id ? "Menghapus..." : "Ya, Hapus"}</button></div></div></td></tr>}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 md:hidden">
        {loading ? Array.from({ length: 3 }).map((_, index) => <div key={index} className="flex gap-4 p-4 animate-pulse"><div className="h-20 w-28 rounded-xl bg-slate-100" /><div className="flex-1 space-y-2 py-2"><div className="h-4 w-3/4 rounded bg-slate-100" /><div className="h-3 w-1/2 rounded bg-slate-100" /></div></div>) : items.length === 0 ? <div className="p-8 text-center text-sm font-semibold text-slate-500">Belum ada aktivitas DPF.</div> : items.map((item) => <div key={item.id} className="p-4"><div className="flex gap-4"><div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200"><img src={resolveGalleryDpfUrl(item.image)} alt="Aktivitas DPF" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.src = imagePlaceholder; }} /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><p className="line-clamp-1 text-sm font-bold text-slate-900">{item.caption_id}</p><p className="mt-1 line-clamp-1 text-xs font-medium text-slate-500">{item.caption_en}</p></div><span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold uppercase ring-1 ${getGalleryDpfStatusTone(item.status)}`}>{getGalleryDpfStatusLabel(item.status)}</span></div><div className="mt-4 flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{formatGalleryDpfDate(item.updated_at ?? item.created_at)}</span><div className="flex gap-2"><button type="button" onClick={() => onEdit(item.id)} aria-label="Ubah aktivitas" className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-brandGreen-50 hover:text-brandGreen-600"><FontAwesomeIcon icon={faPenToSquare} /></button><button type="button" onClick={() => setConfirmDeleteId(confirmDeleteId === item.id ? null : item.id)} aria-label="Hapus aktivitas" className="rounded-lg bg-rose-50 p-2 text-rose-500 hover:bg-rose-100"><FontAwesomeIcon icon={faTrash} /></button></div></div></div></div>{confirmDeleteId === item.id && <div className="mt-4 space-y-3 rounded-xl border border-rose-200 bg-rose-50 p-4"><p className="text-xs font-bold text-rose-800">Gambar akan dihapus permanen.</p><div className="flex gap-2"><button type="button" onClick={() => onDelete(item)} disabled={deletingId === item.id} className="flex-1 rounded-lg bg-rose-600 py-2 text-xs font-bold text-white disabled:opacity-50">{deletingId === item.id ? "..." : "Ya, Hapus"}</button><button type="button" onClick={() => setConfirmDeleteId(null)} className="flex-1 rounded-lg border border-rose-200 bg-white py-2 text-xs font-bold text-slate-600">Batal</button></div></div>}</div>)}
      </div>
    </div>
  );
}
