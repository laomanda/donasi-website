import type { PartnerFormState } from "../EditorPartnerTypes";

type Props = {
  form: PartnerFormState;
  onChange: (updates: Partial<PartnerFormState>) => void;
  disabled: boolean;
};

export default function EditorPartnerFormSidebar({ form, onChange, disabled }: Props) {
  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h3 className="font-heading text-lg font-bold text-slate-900">Pengaturan Tampilan</h3>
        <p className="mt-1 text-sm text-slate-500">
          Atur urutan dan status visibilitas mitra.
        </p>

        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Urutan (Sort Order) <span className="text-red-500">*</span>
            </span>
            <input
              type="number"
              min="0"
              value={form.order}
              onChange={(e) => onChange({ order: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
              disabled={disabled}
            />
            <p className="mt-2 text-xs text-slate-500">
              Angka lebih kecil akan tampil lebih dulu.
            </p>
          </label>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50 cursor-pointer">
            <div className="flex h-5 items-center">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => onChange({ is_active: e.target.checked })}
                className="h-5 w-5 rounded accent-brandGreen-600"
                disabled={disabled}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Status Aktif
                {form.is_active ? (
                  <span className="inline-flex h-2 w-2 rounded-full bg-brandGreen-500"></span>
                ) : (
                  <span className="inline-flex h-2 w-2 rounded-full bg-slate-300"></span>
                )}
              </span>
              <span className="text-xs text-slate-500 mt-0.5">
                {form.is_active
                  ? "Mitra akan ditampilkan di website publik."
                  : "Sembunyikan mitra ini sementara."}
              </span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
