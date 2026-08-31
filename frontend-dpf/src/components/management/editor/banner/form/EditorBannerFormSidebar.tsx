import { type BannerFormState, type BannerStatus } from "../EditorBannerTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

type Props = {
  form: BannerFormState;
  onChange: (val: string) => void;
  onStatusChange: (status: BannerStatus) => void;
  onSuggest: () => void;
  suggestedOrder: number;
  loadingPeers: boolean;
  disabled: boolean;
  error?: string | null;
};

export default function EditorBannerFormSidebar({
  form,
  onChange,
  onStatusChange,
  onSuggest,
  suggestedOrder,
  loadingPeers,
  disabled,
  error,
}: Props) {
  return (
    <div className="space-y-6 lg:sticky lg:top-24 lg:self-start lg:h-fit">
      <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-sky-300 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Pengaturan Banner</p>

        <div className="mt-5 space-y-6">
          {/* Status Selection */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Status Publikasi <span className="text-red-500">*</span>
            </span>
            <div className="mt-2.5 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onStatusChange("published")}
                disabled={disabled}
                className={[
                  "flex flex-col items-start rounded-2xl border p-3.5 text-left transition",
                  form.status === "published"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-950"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faEye}
                    className={form.status === "published" ? "text-emerald-600 text-sm" : "text-slate-400 text-sm"}
                  />
                  <span className="text-xs font-bold">Dipublikasikan</span>
                </div>
                <span className="mt-1 text-[11px] text-slate-500">
                  Tampil di beranda
                </span>
              </button>

              <button
                type="button"
                onClick={() => onStatusChange("draft")}
                disabled={disabled}
                className={[
                  "flex flex-col items-start rounded-2xl border p-3.5 text-left transition",
                  form.status === "draft"
                    ? "border-amber-600 bg-amber-50 text-amber-950"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faEyeSlash}
                    className={form.status === "draft" ? "text-amber-600 text-sm" : "text-slate-400 text-sm"}
                  />
                  <span className="text-xs font-bold">Draf</span>
                </div>
                <span className="mt-1 text-[11px] text-slate-500">
                  Hanya tersimpan
                </span>
              </button>
            </div>
          </div>

          {/* Display Order */}
          <label className="block group">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 group-focus-within:text-brandGreen-600 transition-colors">
              Urutan tampil <span className="text-red-500">*</span>
            </span>
            <div className="relative mt-2">
               <input
                type="number"
                min={0}
                step={1}
                value={form.display_order}
                onChange={(e) => onChange(e.target.value)}
                placeholder="0"
                className={[
                  "w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:outline-none focus:ring-4",
                  error
                    ? "border-rose-300 bg-rose-50 focus:border-rose-300 focus:ring-rose-100"
                    : "border-slate-200 bg-white focus:border-brandGreen-400 focus:ring-brandGreen-50",
                ].join(" ")}
                disabled={disabled}
              />
            </div>
            
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] font-medium text-slate-500">Angka kecil = posisi paling awal.</p>
              <button
                type="button"
                onClick={onSuggest}
                disabled={disabled || loadingPeers}
                className="rounded-full bg-slate-50 px-3 py-1 text-[10px] font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Gunakan urutan kosong
              </button>
            </div>

            {loadingPeers ? (
              <p className="mt-2 text-[10px] font-bold text-slate-400 animate-pulse italic">Memeriksa urutan...</p>
            ) : error ? (
              <p className="mt-2 text-[10px] font-bold text-rose-600">{error}</p>
            ) : (
              <p className="mt-2 text-[10px] font-bold text-brandGreen-600">
                Urutan tersedia. Rekomendasi: #{suggestedOrder}.
              </p>
            )}
          </label>

          <div className="rounded-2xl bg-indigo-50/50 p-4 ring-1 ring-indigo-100">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-400 underline decoration-indigo-200 underline-offset-4">Panduan</p>
            <ul className="mt-2 space-y-2 text-[11px] font-semibold text-slate-600">
              <li className="flex gap-2">
                <span className="h-1 w-1 shrink-0 rounded-full bg-indigo-400 mt-1.5" />
                <span>Gunakan gambar horizontal (landscape).</span>
              </li>
              <li className="flex gap-2">
                <span className="h-1 w-1 shrink-0 rounded-full bg-indigo-400 mt-1.5" />
                <span>Urutan #0 akan tampil paling depan.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
