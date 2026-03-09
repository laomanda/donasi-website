import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTruckRampBox,
  faFloppyDisk,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";

import type { PickupStatus } from "@/types/pickup";

interface AdminPickupStatusControlProps {
  status: PickupStatus;
  setStatus: (val: PickupStatus) => void;
  statusOptions: Array<{ value: string; label: string; disabled: boolean }>;
  assignedOfficer: string;
  setAssignedOfficer: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;
  canSave: boolean;
  isLockedStatus: boolean;
  canEditDetails: boolean;
  saving: boolean;
  onSave: () => void;
}

export default function AdminPickupStatusControl({
  status,
  setStatus,
  statusOptions,
  assignedOfficer,
  setAssignedOfficer,
  notes,
  setNotes,
  canSave,
  isLockedStatus,
  canEditDetails,
  saving,
  onSave,
}: AdminPickupStatusControlProps) {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-700/20">
          <FontAwesomeIcon icon={faTruckRampBox} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Panel Kontrol</p>
          <h2 className="mt-1 font-heading text-lg font-bold text-slate-900">Status & Petugas</h2>
        </div>
      </div>

      <div className="mt-8 grid gap-5">
        <div className="space-y-2">
          <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status Permintaan</label>
          <div className="relative group">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50"
              disabled={!canSave || isLockedStatus}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value} disabled={option.disabled}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Petugas Lapangan</label>
          <input
            value={assignedOfficer}
            onChange={(e) => setAssignedOfficer(e.target.value)}
            placeholder="Nama petugas (opsional)"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50"
            disabled={!canEditDetails}
          />
        </div>

        <div className="space-y-2">
          <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Catatan Internal</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Catatan admin..."
            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50"
            disabled={!canEditDetails}
          />
        </div>

        <button
          type="button"
          onClick={onSave}
          className="group mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition-all hover:bg-emerald-800 hover:shadow-emerald-700/30 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none disabled:translate-y-0"
          disabled={!canSave}
        >
          {saving ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <FontAwesomeIcon icon={faFloppyDisk} className="transition group-hover:scale-110" />
          )}
          Simpan Perubahan
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
        <div className="flex gap-3">
          <FontAwesomeIcon icon={faCircleInfo} className="mt-0.5 text-blue-500" />
          <p className="text-xs font-medium leading-relaxed text-blue-700">
            Status <strong>Selesai</strong> atau <strong>Dibatalkan</strong> akan mengunci data ini secara permanen.
          </p>
        </div>
      </div>
    </div>
  );
}
