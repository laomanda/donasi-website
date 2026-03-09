import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faBuildingColumns, faTimes } from "@fortawesome/free-solid-svg-icons";
import type { UserOption, AllocatableProgram, AllocationFormData } from "@/types/allocation";

type AdminAllocationCreateFormProps = {
  users: UserOption[];
  allocatablePrograms: AllocatableProgram[];
  formData: AllocationFormData;
  submitting: boolean;
  previewUrl: string | null;
  maxAmount: number;
  handleUserChange: (userId: string) => void;
  handleAmountChange: (val: string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleProgramChange: (selectedProgId: string) => void;
  setFormData: React.Dispatch<React.SetStateAction<AllocationFormData>>;
  setPreviewUrl: React.Dispatch<React.SetStateAction<string | null>>;
  handleSubmit: (e?: React.FormEvent) => void;
  formatRupiah: (num: number) => string;
};

export default function AdminAllocationCreateForm({
  users,
  allocatablePrograms,
  formData,
  submitting,
  previewUrl,
  maxAmount,
  handleUserChange,
  handleAmountChange,
  handleFileChange,
  handleProgramChange,
  setFormData,
  setPreviewUrl,
  handleSubmit,
  formatRupiah,
}: AdminAllocationCreateFormProps) {
  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pilih Mitra <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition"
                value={formData.user_id}
                onChange={(e) => handleUserChange(e.target.value)}
              >
                <option value="">-- Pilih Mitra --</option>
                {users?.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Program (Sumber Dana)
              </label>
              <select
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                value={formData.program_id}
                onChange={(e) => handleProgramChange(e.target.value)}
                disabled={!formData.user_id || allocatablePrograms.length === 0}
              >
                <option value="">-- Pilih Sumber Dana --</option>
                {allocatablePrograms.map((p) => (
                  <option key={p.program_id ?? "general"} value={p.program_id ?? ""}>
                    {p.program_title} (Sisa: {formatRupiah(p.remaining_balance)})
                  </option>
                ))}
              </select>
              {formData.user_id && allocatablePrograms.length === 0 && (
                <p className="text-xs text-red-500 mt-1 italic">
                  *Mitra ini belum memiliki donasi terkonfirmasi (paid) yang bisa dialokasikan.
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Nominal Alokasi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-slate-400 font-bold">Rp</span>
                <input
                  type="text"
                  required
                  placeholder="0"
                  disabled={!formData.program_id && formData.program_id !== ""}
                  className={`block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition ${
                    Number(formData.amount) > maxAmount ? "border-red-500 ring-4 ring-red-500/10" : ""
                  }`}
                  value={formData.amount ? new Intl.NumberFormat("id-ID").format(Number(formData.amount)) : ""}
                  onChange={(e) => handleAmountChange(e.target.value)}
                />
              </div>
              {Number(formData.amount) > maxAmount && maxAmount > 0 ? (
                <p className="mt-1 text-xs font-bold text-red-500 animate-pulse">
                  ⚠️ Nominal melebihi saldo tersedia (Maks: {formatRupiah(maxAmount)})
                </p>
              ) : (
                maxAmount > 0 && (
                  <div className="mt-1 flex justify-between text-xs">
                    <span className="text-slate-500">
                      {formData.amount ? "Sisa saldo setelah alokasi:" : "Maksimal tersedia:"}
                    </span>
                    <span className={`font-bold ${formData.amount ? "text-blue-600" : "text-emerald-600"}`}>
                      {formatRupiah(maxAmount - Number(formData.amount))}
                    </span>
                  </div>
                )
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Keterangan / Tujuan <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Contoh: Operasional Program A"
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 lg:col-span-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 sticky top-28">
          <div className="flex items-start gap-3">
            <span className="flex shrink-0 h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-200">
              <FontAwesomeIcon icon={faBuildingColumns} />
            </span>
            <div>
              <p className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Informasi</p>
              <p className="mt-2 text-sm text-slate-700 font-medium">
                Pastikan nominal dan mitra sudah sesuai sebelum menyimpan. Dana yang dialokasikan akan langsung mengurangi
                saldo Dompet Mitra.
              </p>
            </div>
          </div>
        </div>

        {/* Proof & Action Box */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Bukti Penggunaan (Foto/Nota) <span className="text-red-500">*</span>
            </label>

            {/* Preview */}
            {previewUrl ? (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <img src={previewUrl} alt="Preview" className="h-48 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, proof: null });
                    setPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600 transition"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            ) : (
              <div className="flex h-32 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition">
                <p className="text-xs text-slate-400">Belum ada foto dipilih</p>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              required
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition cursor-pointer mt-2"
              onChange={handleFileChange}
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon icon={faSave} />
              {submitting ? "Memproses..." : "Simpan Alokasi"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
