import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFloppyDisk,
  faCircleInfo,
  faHeadset,
} from "@fortawesome/free-solid-svg-icons";
import type { ConsultationStatus } from "@/types/consultation";

interface AdminConsultationStatusControlProps {
  status: ConsultationStatus;
  setStatus: (v: ConsultationStatus) => void;
  adminNotes: string;
  setAdminNotes: (v: string) => void;
  isSaving: boolean;
  onSave: () => void;
  isLocked: boolean;
  canSave: boolean;
}

export default function AdminConsultationStatusControl({
  status,
  setStatus,
  adminNotes,
  setAdminNotes,
  isSaving,
  onSave,
  isLocked,
  canSave,
}: AdminConsultationStatusControlProps) {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-700/20">
          <FontAwesomeIcon icon={faHeadset} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Panel Kontrol</p>
          <h2 className="mt-1 font-heading text-lg font-bold text-slate-900">Status & Catatan</h2>
        </div>
      </div>

      <div className="mt-8 grid gap-5">
        <div className="space-y-2">
          <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status Konsultasi</label>
          <div className="relative group">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ConsultationStatus)}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50"
              disabled={!canSave || isLocked}
            >
              <option value="baru">Baru</option>
              <option value="dibalas">Dibalas</option>
              <option value="ditutup">Ditutup</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Catatan Internal</label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={5}
            placeholder="Tambahkan catatan internal mengenai konsultasi ini..."
            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50"
            disabled={!canSave || isLocked}
          />
        </div>

        <button
          type="button"
          onClick={onSave}
          className="group mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition-all hover:bg-emerald-800 hover:shadow-emerald-700/30 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none disabled:translate-y-0"
          disabled={!canSave || isLocked}
        >
          {isSaving ? (
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
            Status <strong>Ditutup</strong> akan mengunci data ini secara permanen.
          </p>
        </div>
      </div>
    </div>
  );
}
