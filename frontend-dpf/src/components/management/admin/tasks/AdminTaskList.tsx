import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faTrash,
  faListCheck,
  faCalendarDays,
  faUserCircle,
  faPaperclip,
  faFlag,
} from "@fortawesome/free-solid-svg-icons";
import {
  formatDateTime,
  formatPriority,
  formatStatus,
  getStatusTone,
  getStatusBorder,
  getPriorityTone,
  isDeleteLocked,
} from "@/utils/management/adminTaskUtils";

interface AdminTaskListProps {
  items: any[];
  loading: boolean;
  onDelete: (id: number) => Promise<void>;
  onCancel: (id: number, reason: string) => Promise<void>;
  selection: any;
  pageIds: number[];
}

export default function AdminTaskList({
  items,
  loading,
  onDelete,
  onCancel,
  selection,
  pageIds,
}: AdminTaskListProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  const handleCancel = async (id: number) => {
    if (!cancelReason.trim()) return;
    setProcessingId(id);
    await onCancel(id, cancelReason);
    setProcessingId(null);
    setConfirmCancelId(null);
    setCancelReason("");
  };

  const handleDelete = async (id: number) => {
    setProcessingId(id);
    await onDelete(id);
    setProcessingId(null);
    setConfirmDeleteId(null);
  };

  if (loading && items.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm animate-pulse">
            <div className="h-6 w-1/3 bg-slate-100 rounded-full mb-4" />
            <div className="h-4 w-2/3 bg-slate-100 rounded-full mb-2" />
            <div className="h-4 w-1/2 bg-slate-100 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
        <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <FontAwesomeIcon icon={faListCheck} className="text-2xl" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Belum ada tugas</h3>
        <p className="text-slate-500 mt-1 max-w-sm">
          Buat tugas baru untuk mulai menugaskan pekerjaan kepada editor.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex items-center gap-6 border-b border-slate-100 bg-slate-50/50 p-4 rounded-t-[32px] md:px-8">
        <input
          type="checkbox"
          checked={pageIds.length > 0 && pageIds.every((id) => selection.isSelected(id))}
          onChange={() => selection.toggleAll(pageIds)}
          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          Pilih Semua (Halaman Ini)
        </span>
      </div>

      {items.map((task) => {
        const isSelected = selection.isSelected(task.id);
        const deleteLocked = isDeleteLocked(task.status);
        const statusValue = String(task.status ?? "").toLowerCase();
        const cancelLocked = statusValue === "cancelled" || statusValue === "done";

        return (
          <div
            key={task.id}
            className={`group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 sm:p-6 shadow-sm transition-all duration-300 border-l-[6px] ${getStatusBorder(
              task.status
            )}`}
            onClick={() => selection.toggle(task.id)}
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex gap-4 items-start flex-1 min-w-0">
                {/* Select Checkbox */}
                <div className="mt-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => selection.toggle(task.id)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-4 flex-1 min-w-0">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${getStatusTone(
                          task.status
                        )}`}
                      >
                        <div
                          className={`h-1.5 w-1.5 rounded-full ${
                            task.status === "in_progress" ? "animate-pulse bg-white" : "bg-white/70"
                          }`}
                        />
                        {formatStatus(task.status)}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${getPriorityTone(
                          task.priority
                        )}`}
                      >
                        <FontAwesomeIcon icon={faFlag} className="text-[8px]" />
                        {formatPriority(task.priority)}
                      </span>
                    </div>
                    <h3 className="break-all font-heading text-lg sm:text-xl font-bold text-slate-900 transition leading-tight">
                      {task.title ?? "Tugas tanpa judul"}
                    </h3>
                    {task.description && (
                      <p className="mt-2 text-sm text-slate-600 leading-relaxed font-medium line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {statusValue === "cancelled" && task.cancel_reason && (
                    <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 flex items-start gap-3">
                      <FontAwesomeIcon icon={faBan} className="mt-0.5 text-rose-500" />
                      <div>
                        <p className="text-xs font-bold text-rose-700 uppercase">
                          Alasan Pembatalan
                        </p>
                        <p className="text-sm text-rose-800 mt-0.5 font-medium">
                          {task.cancel_reason}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-[10px] sm:text-xs font-bold text-slate-500 border-t border-slate-100 pt-4 mt-2">
                    <div className="flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faCalendarDays} className="text-emerald-500" />
                      <span>
                        Tenggat: <span className="text-slate-800">{formatDateTime(task.due_at)}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faUserCircle} className="text-blue-500" />
                      <span>
                        Editor:{" "}
                        <span className="text-slate-800">
                          {task.assignee?.name ?? "Semua Editor"}
                        </span>
                      </span>
                    </div>
                    {task.creator?.name && (
                      <div className="flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faUserCircle} className="text-indigo-500" />
                        <span>
                          Oleh: <span className="text-slate-800">{task.creator.name}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {task.attachments && task.attachments.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {task.attachments.map((attachment: any) => (
                        <a
                          key={attachment.id}
                          href={attachment.url ?? "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 text-[10px] font-bold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                        >
                          <FontAwesomeIcon icon={faPaperclip} />
                          {attachment.original_name ?? "Lampiran"}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0 w-full md:w-auto justify-end" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmDeleteId(null);
                    setConfirmCancelId((current) => (current === task.id ? null : task.id));
                    setCancelReason("");
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={processingId === task.id || cancelLocked}
                  title={cancelLocked ? "Tidak bisa dibatalkan ulang." : "Batalkan tugas"}
                >
                  <FontAwesomeIcon icon={faBan} />
                  Batalkan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmCancelId(null);
                    setConfirmDeleteId((current) => (current === task.id ? null : task.id));
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={processingId === task.id || deleteLocked}
                  title={deleteLocked ? "Tugas aktif tidak bisa dihapus." : "Hapus tugas"}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>

            {confirmCancelId === task.id && (
              <div className="mt-6 rounded-2xl bg-rose-50 p-6 border border-rose-100 animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <h4 className="font-bold text-rose-800 flex items-center gap-2">
                  <FontAwesomeIcon icon={faBan} />
                  Konfirmasi Pembatalan
                </h4>
                <p className="mt-1 text-sm text-rose-700 font-medium">
                  Mohon berikan alasan pembatalan untuk memberitahu editor.
                </p>
                <div className="mt-4 space-y-3">
                  <textarea
                    value={cancelReason}
                    onChange={(event) => setCancelReason(event.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-200/50"
                    placeholder="Contoh: Salah penugasan, revisi brief..."
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setConfirmCancelId(null)}
                      className="rounded-xl px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => handleCancel(task.id)}
                      className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition"
                      disabled={processingId === task.id || !cancelReason.trim()}
                    >
                      {processingId === task.id ? "Memproses..." : "Ya, Batalkan Tugas"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {confirmDeleteId === task.id && (
              <div className="mt-6 rounded-2xl bg-slate-50 p-6 border border-slate-100 animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                  <FontAwesomeIcon icon={faTrash} className="text-slate-400" />
                  Konfirmasi Penghapusan
                </h4>
                <p className="mt-1 text-sm text-slate-600 font-medium">
                  Tugas ini akan dihapus permanen dan tidak dapat dikembalikan.
                </p>
                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-lg hover:bg-black transition"
                    disabled={processingId === task.id}
                  >
                    {processingId === task.id ? "Memproses..." : "Ya, Hapus Permanen"}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
