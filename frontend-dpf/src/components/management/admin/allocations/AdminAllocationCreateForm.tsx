import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFloppyDisk,
  faHandHoldingHeart,
  faMoneyBillWave,
  faCalendarDays,
  faAlignLeft,
  faImage,
  faTrash,
  faCloudArrowUp,
  faCircleInfo,
  faVault,
  faCheckCircle,
  faReceipt,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import type { AllocatableProgram, AllocationFormData } from "@/types/allocation";

type AdminAllocationCreateFormProps = {
  allocatablePrograms: AllocatableProgram[];
  loadingPrograms: boolean;
  selectedProgram: AllocatableProgram | null;
  formData: AllocationFormData;
  submitting: boolean;
  previewUrl: string | null;
  maxAmount: number;
  handleProgramChange: (selectedProgId: string) => void;
  handleAmountChange: (val: string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<AllocationFormData>>;
  setPreviewUrl: React.Dispatch<React.SetStateAction<string | null>>;
  handleSubmit: (e?: React.FormEvent) => void;
  formatRupiah: (num: number) => string;
};

export default function AdminAllocationCreateForm({
  allocatablePrograms,
  loadingPrograms,
  selectedProgram,
  formData,
  submitting,
  previewUrl,
  maxAmount,
  handleProgramChange,
  handleAmountChange,
  handleFileChange,
  setFormData,
  setPreviewUrl,
  handleSubmit,
  formatRupiah,
}: AdminAllocationCreateFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const amountNumber = Number(formData.amount || 0);
  const isProgramSelected = Boolean(formData.program_id);

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100/80 disabled:text-slate-400";
  const labelClass = "block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1";

  const isAmountOver = maxAmount > 0 && amountNumber > maxAmount;

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-12">
      {/* Main Form Section */}
      <div className="space-y-8 lg:col-span-8">
        
        {/* 1. Pilih Program & Informasi Saldo */}
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 ring-1 ring-emerald-100">
              <FontAwesomeIcon icon={faHandHoldingHeart} className="text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Program Donasi Sumber</h2>
              <p className="text-sm text-slate-500 font-medium">Pilih program donasi yang dananya akan disalurkan</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block">
                <span className={labelClass}>Pilih Program *</span>
                <div className="relative">
                  <select
                    value={formData.program_id}
                    onChange={(e) => handleProgramChange(e.target.value)}
                    disabled={loadingPrograms || submitting}
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    <option value="">{loadingPrograms ? "Memuat data program..." : "-- Pilih Program Donasi --"}</option>
                    {allocatablePrograms.map((p) => {
                      const valueKey = p.program_id === null ? "general" : String(p.program_id);
                      return (
                        <option key={valueKey} value={valueKey}>
                          {p.program_title} — Tersedia: {formatRupiah(p.remaining_balance)}
                        </option>
                      );
                    })}
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <FontAwesomeIcon icon={faHandHoldingHeart} />
                  </div>
                </div>
              </label>
            </div>

            {/* Dynamic Program Balance Overview */}
            {selectedProgram && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 animate-fade-in">
                <div className="flex items-center gap-2 mb-3">
                  <FontAwesomeIcon icon={faVault} className="text-emerald-600 text-sm" />
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Ringkasan Saldo: <span className="text-slate-900 font-extrabold">{selectedProgram.program_title}</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Donasi Masuk</p>
                    <p className="mt-1 text-sm sm:text-base font-bold text-slate-800">
                      {formatRupiah(selectedProgram.collected_amount)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sudah Disalurkan</p>
                    <p className="mt-1 text-sm sm:text-base font-bold text-rose-600">
                      {formatRupiah(selectedProgram.total_allocated)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 shadow-xs">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Sisa Saldo Tersedia</p>
                    <p className="mt-1 text-base sm:text-lg font-black text-emerald-700">
                      {formatRupiah(selectedProgram.remaining_balance)}
                    </p>
                  </div>
                </div>

                {selectedProgram.remaining_balance <= 0 && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 p-3 border border-amber-200 text-xs font-semibold text-amber-800">
                    <FontAwesomeIcon icon={faCircleInfo} className="text-amber-600" />
                    <span>Seluruh dana program ini sudah habis disalurkan.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 2. Rincian Penyaluran */}
        <div className={`rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 transition-opacity ${!isProgramSelected ? "opacity-75" : ""}`}>
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 ring-1 ring-indigo-100">
                <FontAwesomeIcon icon={faMoneyBillWave} className="text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Rincian Penyaluran</h2>
                <p className="text-sm text-slate-500 font-medium">Tentukan nominal, tanggal, dan keperluan penyaluran</p>
              </div>
            </div>

            {!isProgramSelected && (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                <FontAwesomeIcon icon={faLock} className="text-[10px]" />
                Pilih program dahulu
              </span>
            )}
          </div>

          {!isProgramSelected && (
            <div className="mb-6 rounded-2xl bg-amber-50/80 p-4 border border-amber-200/80 text-xs font-semibold text-amber-800 flex items-center gap-2.5">
              <FontAwesomeIcon icon={faCircleInfo} className="text-amber-600 shrink-0 text-sm" />
              <span>Silakan pilih program donasi sumber di atas terlebih dahulu untuk mengisi nominal dan rincian penyaluran.</span>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block">
                <div className="flex items-center justify-between mb-1">
                  <span className={labelClass}>Nominal Penyaluran (Rp) *</span>
                  {isProgramSelected && selectedProgram && selectedProgram.remaining_balance > 0 && (
                    <button
                      type="button"
                      onClick={() => handleAmountChange(String(Math.round(selectedProgram.remaining_balance)))}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-2"
                    >
                      Salurkan Seluruh Saldo ({formatRupiah(selectedProgram.remaining_balance)})
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    value={formData.amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder={isProgramSelected ? "Contoh: 5000000" : "Pilih program donasi terlebih dahulu"}
                    inputMode="numeric"
                    className={`${inputClass} pl-12 text-lg ${isAmountOver ? "border-rose-300 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10" : ""}`}
                    disabled={!isProgramSelected || submitting}
                  />
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                    Rp
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="inline-block rounded-md border border-emerald-100 bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600">
                    Terbaca: {formatRupiah(amountNumber)}
                  </p>

                  {isAmountOver && (
                    <p className="text-xs font-bold text-rose-600">
                      ⚠️ Melebihi saldo tersedia ({formatRupiah(maxAmount)})
                    </p>
                  )}
                </div>
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="block">
                <span className={labelClass}>Tanggal Penyaluran *</span>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.allocated_at}
                    onChange={(e) => setFormData((s) => ({ ...s, allocated_at: e.target.value }))}
                    className={`${inputClass} pl-10`}
                    disabled={!isProgramSelected || submitting}
                  />
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <FontAwesomeIcon icon={faCalendarDays} />
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-400 font-medium">
                  Bisa diisi tanggal penyaluran yang telah terlaksana sebelumnya.
                </p>
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="block">
                <div className="flex items-center justify-between mb-1">
                  <span className={labelClass}>Keterangan / Keperluan Penyaluran</span>
                  <span className="text-[11px] font-semibold text-slate-400 normal-case">(Opsional)</span>
                </div>
                <div className="relative">
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((s) => ({ ...s, description: e.target.value }))}
                    rows={3}
                    placeholder={isProgramSelected ? "Contoh: Penyaluran 50 paket sembako untuk lansia & dhuafa di Desa Sukamaju..." : "Pilih program donasi terlebih dahulu"}
                    className={`${inputClass} pl-10 resize-none`}
                    disabled={!isProgramSelected || submitting}
                  />
                  <div className="pointer-events-none absolute left-4 top-5 text-slate-400">
                    <FontAwesomeIcon icon={faAlignLeft} />
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* 3. Bukti Dokumentasi Penyaluran (Opsional) */}
        <div className={`rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 transition-opacity ${!isProgramSelected ? "opacity-75" : ""}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 ring-1 ring-teal-100">
              <FontAwesomeIcon icon={faImage} className="text-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Bukti Dokumentasi Penyaluran</h2>
                <span className="text-xs font-semibold text-slate-400">(Opsional)</span>
              </div>
              <p className="text-sm text-slate-500 font-medium">Foto kegiatan penyaluran, kuitansi serah terima, atau dokumen PDF</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!isProgramSelected || submitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon icon={faCloudArrowUp} className="text-xs" />
                {formData.proof ? "Ganti File Bukti" : "Pilih File Bukti"}
              </button>

              {formData.proof && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData((s) => ({ ...s, proof: null }));
                    setPreviewUrl(null);
                  }}
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faTrash} className="text-xs" />
                  Hapus
                </button>
              )}
            </div>

            {previewUrl ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2 max-w-md">
                <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="block cursor-zoom-in group relative">
                  <img
                    src={previewUrl}
                    alt="Bukti Dokumentasi"
                    className="h-auto max-h-60 w-full rounded-xl object-contain"
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="rounded-lg bg-white/90 px-3 py-1 text-xs font-bold text-slate-800 shadow">
                      Klik untuk melihat ukuran penuh
                    </span>
                  </div>
                </a>
              </div>
            ) : formData.proof ? (
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <FontAwesomeIcon icon={faReceipt} className="text-xl text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-slate-800">{formData.proof.name}</p>
                  <p className="text-[10px] text-slate-400">
                    {(formData.proof.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : (
              <div
                onClick={() => {
                  if (isProgramSelected && !submitting) {
                    fileInputRef.current?.click();
                  }
                }}
                className={`rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center transition flex flex-col items-center justify-center gap-2 ${
                  isProgramSelected ? "cursor-pointer hover:border-slate-300 hover:bg-slate-50" : "opacity-60 cursor-not-allowed"
                }`}
              >
                <FontAwesomeIcon icon={faImage} className="text-2xl text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">
                  {isProgramSelected
                    ? "Klik untuk mengunggah foto dokumentasi kegiatan atau kuitansi (JPG, PNG, WEBP, PDF)"
                    : "Pilih program donasi terlebih dahulu untuk mengunggah bukti"}
                </p>
                <p className="text-[11px] text-slate-400">Maksimal ukuran file 10MB</p>
              </div>
            )}

            <input
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={!isProgramSelected || submitting}
            />
          </div>
        </div>
      </div>

      {/* Sidebar Summary & Submit */}
      <aside className="lg:col-span-4 space-y-6">
        <div className="sticky top-8 space-y-6">
          <div className="rounded-[24px] border border-emerald-100 bg-white p-6 shadow-xl shadow-emerald-50/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <FontAwesomeIcon icon={faFloppyDisk} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Konfirmasi Penyaluran</h3>
                <p className="text-xs text-slate-500">Ringkasan transaksi keluar</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100">
                <p className="text-xs font-bold text-emerald-800 uppercase mb-1">Nominal Disalurkan</p>
                <p className="text-2xl font-bold text-emerald-700 tracking-tight">{formatRupiah(amountNumber)}</p>
              </div>

              {selectedProgram && (
                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Program:</span>
                    <span className="font-bold text-slate-800 truncate max-w-[160px]">
                      {selectedProgram.program_title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Saldo Tersedia:</span>
                    <span className="font-bold text-slate-800">
                      {formatRupiah(selectedProgram.remaining_balance)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1.5">
                    <span className="text-slate-500">Sisa Setelahnya:</span>
                    <span className={`font-bold ${selectedProgram.remaining_balance - amountNumber < 0 ? "text-rose-600" : "text-emerald-700"}`}>
                      {formatRupiah(Math.max(0, selectedProgram.remaining_balance - amountNumber))}
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || isAmountOver || amountNumber <= 0 || !formData.program_id}
                  className="group w-full rounded-xl bg-emerald-600 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {submitting ? (
                    "Menyimpan Penyaluran..."
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <FontAwesomeIcon icon={faFloppyDisk} className="text-emerald-200 group-hover:text-white transition" />
                      Simpan Penyaluran
                    </span>
                  )}
                </button>

                <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium text-center">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500 text-xs" />
                  <span>Akan langsung tampil di tab Penyaluran halaman publik</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </form>
  );
}
