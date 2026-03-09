import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import { type EditorTaskItem, statusOptions } from "./EditorTasksTypes";
import {
    formatDateTime,
    getTaskTone,
    formatTaskStatus,
    formatTaskPriority,
    getPriorityTone,
    getMetaTone,
    getStatusSelectTone,
    isForwardStatus,
} from "./EditorTasksUtils";

type Props = {
    item: EditorTaskItem;
    busy: boolean;
    onStatusChange: (status: string) => void;
};

export default function EditorTaskCard({ item, busy, onStatusChange }: Props) {
    const [showDetail, setShowDetail] = useState(false);
    const status = String(item.status ?? "open");
    const statusTone = getTaskTone(status);
    const statusLabel = formatTaskStatus(status);
    const priorityLabel = formatTaskPriority(item.priority);
    const dueLabel = formatDateTime(item.due_at ?? null);
    const attachments = item.attachments ?? [];
    const creatorName = item.creator?.name ?? null;
    const assigneeName = item.assignee?.name ?? "Semua Editor";
    const priorityTone = getPriorityTone(item.priority);
    const selectTone = getStatusSelectTone(status);
    const metaBase = "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ring-1";
    const isCancelled = status === "cancelled";
    
    const allowedStatusOptions = isCancelled
        ? statusOptions.filter((option) => option.value === "cancelled")
        : statusOptions.filter((option) => option.value !== "cancelled" && isForwardStatus(status, option.value));

    return (
        <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 transition hover:shadow-md">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="break-words text-base font-semibold leading-snug text-slate-900 sm:text-lg">
                            {item.title ?? "Tugas tanpa judul"}
                        </p>
                        <span
                            className={[
                                "inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[10px] font-bold text-white ring-1",
                                statusTone,
                            ].join(" ")}
                        >
                            {statusLabel}
                        </span>
                    </div>
                    {item.description ? (
                        <p className="text-sm font-medium text-slate-600 line-clamp-2">{item.description}</p>
                    ) : null}
                    {isCancelled && item.cancel_reason ? (
                        <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                            Alasan dibatalkan: {item.cancel_reason}
                        </div>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className={[metaBase, priorityTone].join(" ")}>
                            {priorityLabel}
                        </span>
                        <span className={[metaBase, getMetaTone("due")].join(" ")}>
                            {dueLabel}
                        </span>
                        {creatorName ? (
                            <span className={[metaBase, getMetaTone("from")].join(" ")}>
                                {creatorName}
                            </span>
                        ) : null}
                        {attachments.length > 0 ? (
                            <span className={[metaBase, getMetaTone("attachments")].join(" ")}>
                                <FontAwesomeIcon icon={faPaperclip} className="mr-1.5 opacity-60" />
                                {attachments.length}
                            </span>
                        ) : null}
                    </div>
                </div>

                <div className="flex shrink-0 flex-row gap-2 sm:w-48 sm:flex-col sm:items-stretch">
                    <button
                        type="button"
                        onClick={() => setShowDetail((value) => !value)}
                        className="inline-flex grow items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold text-slate-700 shadow-sm transition hover:bg-brandGreen-500 hover:text-white sm:grow-0"
                    >
                        {showDetail ? "Tutup" : "Detail"}
                    </button>
                    <div className="w-full min-w-[120px] rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 sm:py-2">
                        <p className="hidden text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 sm:block">Status</p>
                        <select
                            value={status}
                            onChange={(event) => onStatusChange(event.target.value)}
                            disabled={busy || isCancelled}
                            aria-label="Status tugas"
                            className={[
                                "w-full rounded-xl border bg-white px-2 py-1.5 text-xs font-bold shadow-sm transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 sm:mt-2 sm:px-3 sm:py-2",
                                selectTone,
                            ].join(" ")}
                        >
                            {allowedStatusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {showDetail ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">ID Tugas</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">#{item.id}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Dibuat</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{formatDateTime(item.created_at ?? null)}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Ditujukan</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{assigneeName}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Status</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{statusLabel}</p>
                        </div>
                        {isCancelled && item.cancel_reason ? (
                            <div className="sm:col-span-2">
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Alasan pembatalan</p>
                                <p className="mt-1 text-sm font-semibold text-slate-900">{item.cancel_reason}</p>
                            </div>
                        ) : null}
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Prioritas</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{priorityLabel}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Tenggat</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{dueLabel}</p>
                        </div>
                        {creatorName ? (
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Dari</p>
                                <p className="mt-1 text-sm font-semibold text-slate-900">{creatorName}</p>
                            </div>
                        ) : null}
                    </div>

                    {attachments.length > 0 ? (
                        <div className="mt-4">
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Lampiran</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
                                <FontAwesomeIcon icon={faPaperclip} className="text-slate-400" />
                                {attachments.map((attachment) => (
                                    <a
                                        key={attachment.id}
                                        href={attachment.url ?? "#"}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="max-w-[220px] truncate rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        {attachment.original_name ?? "Lampiran"}
                                    </a>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
