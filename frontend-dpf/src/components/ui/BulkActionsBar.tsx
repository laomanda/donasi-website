import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";

export function BulkActionsBar({
  count,
  itemLabel,
  onClear,
  onSelectAllPage,
  onDeleteSelected,
  disabled,
}: {
  count: number;
  itemLabel: string;
  onClear: () => void;
  onSelectAllPage: () => void;
  onDeleteSelected: () => Promise<void> | void;
  disabled?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);

  if (count <= 0) return null;

  return (
    <div className="rounded-[28px] border border-primary-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900">
            {count} {itemLabel} dipilih
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-600">
            Kamu bisa hapus banyak data tanpa pindah halaman.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSelectAllPage}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            disabled={disabled}
          >
            Pilih semua (halaman)
          </button>

          <button
            type="button"
            onClick={() => {
              setConfirming(false);
              onClear();
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            disabled={disabled}
          >
            <FontAwesomeIcon icon={faXmark} />
            Batalkan
          </button>

          {!confirming ? (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-700 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              disabled={disabled}
            >
              <FontAwesomeIcon icon={faTrash} />
              Hapus dipilih
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void onDeleteSelected()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={disabled}
            >
              <FontAwesomeIcon icon={faTrash} />
              Konfirmasi hapus
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

