import { type GalleryDpfFormState, type GalleryDpfStatus } from "../GalleryDpfTypes";

type Props = {
  form: GalleryDpfFormState;
  disabled: boolean;
  onChange: (field: keyof GalleryDpfFormState, value: string) => void;
};

const fields = [
  { key: "caption_id" as const, label: "Caption Indonesia", placeholder: "Contoh: Berbagi Takjil" },
  { key: "caption_en" as const, label: "Caption English", placeholder: "Example: Sharing Takjil" },
];

export default function EditorGalleryDpfFormSidebar({ form, disabled, onChange }: Props) {
  return (
    <div className="space-y-6 lg:sticky lg:top-24 lg:self-start lg:h-fit">
      <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-sky-300 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Properti</p>
        <div className="mt-5 space-y-5">
          {fields.map((field) => (
            <label key={field.key} className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                {field.label} <span className="text-red-500">*</span>
              </span>
              <input
                value={form[field.key]}
                onChange={(event) => onChange(field.key, event.target.value)}
                placeholder={field.placeholder}
                maxLength={255}
                disabled={disabled}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-brandGreen-400 focus:outline-none focus:ring-4 focus:ring-brandGreen-50 disabled:opacity-60"
              />
              <span className="mt-1 block text-[10px] font-medium text-slate-400">Maksimal 3 kata.</span>
            </label>
          ))}

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Status <span className="text-red-500">*</span></span>
            <select
              value={form.status}
              onChange={(event) => onChange("status", event.target.value as GalleryDpfStatus)}
              disabled={disabled}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-brandGreen-400 focus:outline-none focus:ring-4 focus:ring-brandGreen-50 disabled:opacity-60"
            >
              <option value="draft">Draf</option>
              <option value="published">Terbit</option>
              <option value="archived">Arsip</option>
            </select>
          </label>
        </div>
      </div>

      <div className="rounded-2xl bg-indigo-50/50 p-4 ring-1 ring-indigo-100">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-400">Panduan</p>
        <p className="mt-2 text-[11px] font-semibold leading-relaxed text-slate-600">Caption singkat membantu pengunjung memahami dokumentasi tanpa membuka halaman detail.</p>
      </div>
    </div>
  );
}
