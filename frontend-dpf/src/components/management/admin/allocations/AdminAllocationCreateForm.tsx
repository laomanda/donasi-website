import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faBuildingColumns,
  faTimes,
  faUserGroup,
  faHandHoldingHeart,
  faMagnifyingGlass,
  faChevronDown,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import type { UserOption, AllocatableProgram, AllocatablePublicDonation, AllocationFormData } from "@/types/allocation";

type AdminAllocationCreateFormProps = {
  users: UserOption[];
  allocatablePrograms: AllocatableProgram[];
  publicDonations: AllocatablePublicDonation[];
  includeDepleted: boolean;
  setIncludeDepleted: React.Dispatch<React.SetStateAction<boolean>>;
  formData: AllocationFormData;
  submitting: boolean;
  previewUrl: string | null;
  maxAmount: number;
  handleSourceTypeChange: (type: "mitra" | "public_donor") => void;
  handleUserChange: (userId: string) => void;
  handleDonationChange: (donationId: string) => void;
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
  publicDonations,
  includeDepleted,
  setIncludeDepleted,
  formData,
  submitting,
  previewUrl,
  maxAmount,
  handleSourceTypeChange,
  handleUserChange,
  handleDonationChange,
  handleAmountChange,
  handleFileChange,
  handleProgramChange,
  setFormData,
  setPreviewUrl,
  handleSubmit,
  formatRupiah,
}: AdminAllocationCreateFormProps) {
  const isMitra = formData.source_type === "mitra";

  // State for Searchable Comboboxes
  const [mitraSearch, setMitraSearch] = useState("");
  const [isMitraOpen, setIsMitraOpen] = useState(false);
  const mitraRef = useRef<HTMLDivElement>(null);

  const [donationSearch, setDonationSearch] = useState("");
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const donationRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mitraRef.current && !mitraRef.current.contains(event.target as Node)) {
        setIsMitraOpen(false);
      }
      if (donationRef.current && !donationRef.current.contains(event.target as Node)) {
        setIsDonationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update search query when selection changes externally
  useEffect(() => {
    if (formData.user_id) {
      const selected = users.find((u) => String(u.id) === String(formData.user_id));
      if (selected) {
        setMitraSearch(`${selected.name} (${selected.email})`);
      }
    } else {
      setMitraSearch("");
    }
  }, [formData.user_id, users]);

  useEffect(() => {
    if (formData.donation_id) {
      const selected = publicDonations.find((d) => String(d.id) === String(formData.donation_id));
      if (selected) {
        setDonationSearch(`[${selected.donation_code}] ${selected.donor_name} - ${selected.program_title}`);
      }
    } else {
      setDonationSearch("");
    }
  }, [formData.donation_id, publicDonations]);

  // Filtered lists
  const filteredUsers = users.filter((u) => {
    const q = mitraSearch.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const filteredDonations = publicDonations.filter((d) => {
    const q = donationSearch.toLowerCase();
    return (
      d.donation_code.toLowerCase().includes(q) ||
      d.donor_name.toLowerCase().includes(q) ||
      d.program_title.toLowerCase().includes(q) ||
      (d.donor_phone && d.donor_phone.toLowerCase().includes(q)) ||
      (d.donor_email && d.donor_email.toLowerCase().includes(q))
    );
  });

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="space-y-6">
            {/* Tipe Sumber Penyaluran */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tipe Sumber Donasi / Penyaluran <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSourceTypeChange("mitra")}
                  className={`flex items-center justify-center gap-2 rounded-2xl border p-4 text-xs font-bold transition shadow-sm ${
                    isMitra
                      ? "border-emerald-600 bg-emerald-50/70 text-emerald-800 ring-2 ring-emerald-500/20"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <FontAwesomeIcon icon={faUserGroup} className={isMitra ? "text-emerald-600" : "text-slate-400"} />
                  <span>Mitra Terdaftar</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSourceTypeChange("public_donor")}
                  className={`flex items-center justify-center gap-2 rounded-2xl border p-4 text-xs font-bold transition shadow-sm ${
                    !isMitra
                      ? "border-emerald-600 bg-emerald-50/70 text-emerald-800 ring-2 ring-emerald-500/20"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <FontAwesomeIcon icon={faHandHoldingHeart} className={!isMitra ? "text-emerald-600" : "text-slate-400"} />
                  <span>Donatur Publik (Non-Akun)</span>
                </button>
              </div>
            </div>

            {/* Opsi Mitra Terdaftar */}
            {isMitra ? (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Cari & Pilih Mitra Terdaftar <span className="text-red-500">*</span>
                  </label>

                  <div className="relative" ref={mitraRef}>
                    <div className="relative flex items-center">
                      <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-4 text-slate-400 text-sm pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Ketik nama atau email mitra untuk mencari..."
                        value={mitraSearch}
                        onFocus={() => setIsMitraOpen(true)}
                        onChange={(e) => {
                          setMitraSearch(e.target.value);
                          setIsMitraOpen(true);
                          if (formData.user_id) {
                            handleUserChange("");
                          }
                        }}
                        className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition"
                      />
                      {formData.user_id || mitraSearch ? (
                        <button
                          type="button"
                          onClick={() => {
                            setMitraSearch("");
                            handleUserChange("");
                            setIsMitraOpen(false);
                          }}
                          className="absolute right-3 p-1.5 text-slate-400 hover:text-red-500 transition"
                        >
                          <FontAwesomeIcon icon={faTimes} className="text-xs" />
                        </button>
                      ) : (
                        <FontAwesomeIcon icon={faChevronDown} className="absolute right-4 text-slate-400 text-xs pointer-events-none" />
                      )}
                    </div>

                    {/* Dropdown list */}
                    {isMitraOpen && (
                      <div className="absolute z-30 mt-2 max-h-60 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl space-y-1">
                        {filteredUsers.length === 0 ? (
                          <div className="p-4 text-center text-xs font-bold text-slate-400">
                            Tidak ada mitra cocok dengan kata kunci "{mitraSearch}"
                          </div>
                        ) : (
                          filteredUsers.map((u) => {
                            const isSelected = String(u.id) === String(formData.user_id);
                            return (
                              <button
                                key={u.id}
                                type="button"
                                onClick={() => {
                                  handleUserChange(String(u.id));
                                  setMitraSearch(`${u.name} (${u.email})`);
                                  setIsMitraOpen(false);
                                }}
                                className={`w-full text-left rounded-xl p-3 text-xs font-bold transition flex items-center justify-between ${
                                  isSelected
                                    ? "bg-emerald-50 border border-emerald-300 text-emerald-950"
                                    : "hover:bg-slate-50 text-slate-800"
                                }`}
                              >
                                <div>
                                  <p className="text-slate-900 font-bold">{u.name}</p>
                                  <p className="text-xs font-normal text-slate-500">{u.email}</p>
                                </div>
                                {isSelected && <FontAwesomeIcon icon={faCheck} className="text-emerald-600" />}
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
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
                    <p className="text-xs text-red-500 mt-1 italic font-medium">
                      *Mitra ini belum memiliki donasi terkonfirmasi (paid) yang bisa disalurkan.
                    </p>
                  )}
                </div>
              </>
            ) : (
              /* Opsi Donatur Publik */
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Cari & Pilih Donasi Publik (Lunas) <span className="text-red-500">*</span>
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600">
                      <input
                        type="checkbox"
                        checked={includeDepleted}
                        onChange={(e) => setIncludeDepleted(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Tampilkan yang saldo Rp 0</span>
                    </label>
                  </div>

                  <div className="relative" ref={donationRef}>
                    <div className="relative flex items-center">
                      <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-4 text-slate-400 text-sm pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Ketik Kode Donasi, Nama Donatur, Program, atau No. WA..."
                        value={donationSearch}
                        onFocus={() => setIsDonationOpen(true)}
                        onChange={(e) => {
                          setDonationSearch(e.target.value);
                          setIsDonationOpen(true);
                          if (formData.donation_id) {
                            handleDonationChange("");
                          }
                        }}
                        className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition"
                      />
                      {formData.donation_id || donationSearch ? (
                        <button
                          type="button"
                          onClick={() => {
                            setDonationSearch("");
                            handleDonationChange("");
                            setIsDonationOpen(false);
                          }}
                          className="absolute right-3 p-1.5 text-slate-400 hover:text-red-500 transition"
                        >
                          <FontAwesomeIcon icon={faTimes} className="text-xs" />
                        </button>
                      ) : (
                        <FontAwesomeIcon icon={faChevronDown} className="absolute right-4 text-slate-400 text-xs pointer-events-none" />
                      )}
                    </div>

                    {/* Dropdown Options List */}
                    {isDonationOpen && (
                      <div className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl space-y-1">
                        {filteredDonations.length === 0 ? (
                          <div className="p-4 text-center text-xs font-bold text-slate-400">
                            Tidak ada donasi publik cocok dengan kata kunci "{donationSearch}"
                          </div>
                        ) : (
                          filteredDonations.map((d) => {
                            const isSelected = String(d.id) === String(formData.donation_id);
                            return (
                              <button
                                key={d.id}
                                type="button"
                                disabled={d.is_depleted}
                                onClick={() => {
                                  handleDonationChange(String(d.id));
                                  setDonationSearch(`[${d.donation_code}] ${d.donor_name} - ${d.program_title}`);
                                  setIsDonationOpen(false);
                                }}
                                className={`w-full text-left rounded-xl p-3 text-xs transition flex items-start justify-between gap-3 ${
                                  d.is_depleted
                                    ? "opacity-50 cursor-not-allowed bg-slate-50"
                                    : isSelected
                                    ? "bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold"
                                    : "hover:bg-slate-50 text-slate-800"
                                }`}
                              >
                                <div className="space-y-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-black text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded text-[10px]">
                                      {d.donation_code}
                                    </span>
                                    {d.is_depleted && (
                                      <span className="bg-red-500 text-white font-black px-1.5 py-0.5 rounded text-[9px] uppercase">
                                        Lunas 100% (Saldo Rp 0)
                                      </span>
                                    )}
                                  </div>
                                  <p className="font-bold truncate text-slate-900">{d.donor_name} <span className="text-slate-500 font-normal">({d.donor_phone || "Tanpa No. WA"})</span></p>
                                  <p className="text-slate-600 truncate">{d.program_title}</p>
                                </div>

                                <div className="text-right shrink-0">
                                  <p className="font-bold text-emerald-600">Sisa: {formatRupiah(d.remaining_balance)}</p>
                                  <p className="text-[10px] text-slate-400">Total: {formatRupiah(d.amount)}</p>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {formData.donation_id && (
                  (() => {
                    const sel = publicDonations.find((d) => String(d.id) === String(formData.donation_id));
                    if (!sel) return null;
                    return (
                      <div className={`rounded-2xl border p-4 text-xs space-y-1.5 transition ${
                        sel.is_depleted ? "border-amber-200 bg-amber-50/70 text-amber-900" : "border-emerald-200 bg-emerald-50/60 text-emerald-900"
                      }`}>
                        <div className="flex items-center justify-between font-bold">
                          <span>Kode: {sel.donation_code}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            sel.is_depleted ? "bg-amber-200 text-amber-900" : "bg-emerald-200 text-emerald-900"
                          }`}>
                            {sel.is_depleted ? "Lunas 100% Selesai Disalurkan" : "Tersedia Disalurkan"}
                          </span>
                        </div>
                        <p className="font-semibold">Donatur: <span className="font-bold">{sel.donor_name}</span> {sel.donor_phone ? `(${sel.donor_phone})` : ""}</p>
                        <p className="font-semibold">Program: <span className="font-bold">{sel.program_title}</span></p>
                        <p className="font-semibold">Total Donasi Masuk: <span className="font-bold">{formatRupiah(sel.amount)}</span> | Sudah Disalurkan: <span className="font-bold">{formatRupiah(sel.total_allocated)}</span></p>
                        <p className="font-bold text-sm pt-1">Sisa Dana Tersedia: <span className={sel.remaining_balance > 0 ? "text-emerald-700 font-black" : "text-red-600"}>{formatRupiah(sel.remaining_balance)}</span></p>
                      </div>
                    );
                  })()
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Input Nominal */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Nominal Penyaluran <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-slate-400 font-bold">Rp</span>
                  <input
                    type="text"
                    required
                    placeholder="0"
                    disabled={(isMitra && !formData.program_id && formData.program_id !== "") || (!isMitra && !formData.donation_id)}
                    className={`block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition ${
                      Number(formData.amount) > maxAmount ? "border-red-500 ring-4 ring-red-500/10" : ""
                    }`}
                    value={formData.amount ? new Intl.NumberFormat("id-ID").format(Number(formData.amount)) : ""}
                    onChange={(e) => handleAmountChange(e.target.value)}
                  />
                </div>
                {Number(formData.amount) > maxAmount && maxAmount > 0 ? (
                  <p className="mt-1 text-xs font-bold text-red-500 animate-pulse">
                    ⚠️ Nominal melebihi sisa dana tersedia (Maksimal: {formatRupiah(maxAmount)})
                  </p>
                ) : (
                  maxAmount > 0 && (
                    <div className="mt-1 flex justify-between text-xs font-medium">
                      <span className="text-slate-500">
                        {formData.amount ? "Sisa dana:" : "Maksimal:"}
                      </span>
                      <span className={`font-bold ${formData.amount ? "text-blue-600" : "text-emerald-600"}`}>
                        {formatRupiah(maxAmount - Number(formData.amount))}
                      </span>
                    </div>
                  )
                )}
              </div>

              {/* Input Tanggal Penyaluran */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Tanggal Penyaluran <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.allocated_at || new Date().toISOString().split("T")[0]}
                  onChange={(e) => setFormData({ ...formData, allocated_at: e.target.value })}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition"
                />
                <p className="mt-1 text-[11px] font-semibold text-slate-400">
                  Tanggal realisasi penyaluran.
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Keterangan / Tujuan Penyaluran <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Contoh: Bantuan operasional paket pangan & beasiswa santri..."
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
              <p className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Informasi Penyaluran</p>
              <p className="mt-2 text-sm text-slate-700 font-medium">
                Pastikan nominal dan donatur/mitra sudah sesuai sebelum menyimpan. Dana yang disalurkan akan langsung mengurangi sisa dana donatur.
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
              {submitting ? "Memproses..." : "Simpan Penyaluran"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
