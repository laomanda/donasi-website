import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave, faBuildingColumns, faTimes } from "@fortawesome/free-solid-svg-icons";
import http from "../../../../lib/http";
import { toast } from "react-hot-toast";

type User = {
  id: number;
  name: string;
  email: string;
  role_label: string;
};

type AllocatableProgram = {
  program_id: number | null;
  program_title: string;
  remaining_balance: number;
};

export function AdminAllocationCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [allocatablePrograms, setAllocatablePrograms] = useState<AllocatableProgram[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    user_id: "",
    program_id: "",
    amount: "",
    description: "",
    proof: null as File | null,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await http.get("/admin/users", { params: { role: "mitra", per_page: 100 } });
        setUsers(data.data?.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Gagal memuat data mitra.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUserChange = async (userId: string) => {
    setFormData(prev => ({ ...prev, user_id: userId, program_id: "", amount: "" }));
    setAllocatablePrograms([]);

    if (!userId) return;

    const toastId = toast.loading("Mengecek saldo program...");
    try {
      const { data } = await http.get(`/admin/users/${userId}/allocatable-programs`);
      setAllocatablePrograms(data.data || []);
      toast.dismiss(toastId);
      
      if (data.data.length === 0) {
        toast.error("Mitra ini belum memiliki saldo donasi yang bisa dialokasikan.", { duration: 5000 });
      } else {
        toast.success(`Ditemukan ${data.data.length} program dengan saldo.`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat saldo program.");
      toast.dismiss(toastId);
    }
  };

  const getSelectedProgramBalance = () => {
    if (!formData.program_id && formData.program_id !== "") return 0;
    // Find program. If program_id is "", check for null program_id in list
    const prog = allocatablePrograms.find(p => 
      String(p.program_id ?? "") === String(formData.program_id)
    );
    return prog ? prog.remaining_balance : 0;
  };

  const maxAmount = getSelectedProgramBalance();

  const handleAmountChange = (val: string) => {
    // Remove non-numeric
    const numVal = Number(val);
    if (numVal > maxAmount) {
       // Optional: block input or show error. Let's strict block for now? 
       // Better to allow typing but show error or cap it? 
       // User requested "nominal tidak bisa lebih dari saldo", so strict cap or error.
       // Let's cap it effectively or valid state check.
       // Actually user logic: "field nominal akan langsung terisi... tidak bisa lebih"
       // Let's just update state, but validation will happen on render/submit or onBlur
    }
    setFormData({ ...formData, amount: val });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setFormData({ ...formData, proof: file });
          const url = URL.createObjectURL(file);
          setPreviewUrl(url);
      } else {
          setFormData({ ...formData, proof: null });
          setPreviewUrl(null);
      }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (Number(formData.amount) > maxAmount) {
      toast.error(`Nominal melebihi saldo tersedia (Maks: ${formatRupiah(maxAmount)})`);
      return;
    }

    setSubmitting(true);

    const data = new FormData();
    data.append("user_id", formData.user_id);
    if (formData.program_id) {
        data.append("program_id", formData.program_id);
    }
    data.append("amount", formData.amount);
    data.append("description", formData.description);
    if (formData.proof) {
      data.append("proof", formData.proof);
    }

    try {
      await http.post("/admin/allocations", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Dana berhasil dialokasikan.");
      navigate("/admin/allocations");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal mengalokasikan dana.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat data...</div>;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-emerald-600 shadow-xl">
        <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10" />
        <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl" />

        <div className="relative z-10 p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white ring-1 ring-white/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-200 shadow-[0_0_8px_rgba(167,243,208,0.6)]" />
                  Keuangan
                </span>
                <h1 className="mt-3 font-heading text-3xl font-bold text-white md:text-5xl text-shadow-sm">
                  Buat Alokasi Baru
                </h1>
                <p className="mt-2 max-w-2xl text-lg font-medium text-emerald-100/90">
                  Alokasikan dana untuk Mitra dengan mudah dan transparan.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/admin/allocations")}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20"
                disabled={submitting}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Kembali
              </button>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Pilih Mitra <span className="text-red-500">*</span></label>
                <select
                  required
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition"
                  value={formData.user_id}
                  onChange={(e) => handleUserChange(e.target.value)}
                >
                  <option value="">-- Pilih Mitra --</option>
                  {users?.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Program (Sumber Dana)</label>
                <select
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                  value={formData.program_id}
                  onChange={(e) => {
                     const selectedProgId = e.target.value;
                     const prog = allocatablePrograms.find(p => String(p.program_id ?? "") === String(selectedProgId));
                     const max = prog ? prog.remaining_balance : "";
                     setFormData({ ...formData, program_id: selectedProgId, amount: String(max) });
                  }}
                  disabled={!formData.user_id || allocatablePrograms.length === 0}
                >
                  <option value="">-- Pilih Sumber Dana --</option>
                  {allocatablePrograms.map((p) => (
                    <option key={p.program_id ?? 'general'} value={p.program_id ?? ""}>
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
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nominal Alokasi <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-slate-400 font-bold">Rp</span>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    disabled={!formData.program_id && formData.program_id !== ""} 
                    // Note: formData.program_id "" is valid for General Fund IF selected.
                    // But here we rely on select value. If "General" is selected, value is "".
                    // So we check if user has selected something. 
                    // Let's rely on maxAmount > 0 check instead or just logical flow.
                    // Actually, enable input only if program selected?
                    // Getting a bit complex with "General" being "".
                    // Let's simplfy: disable if no allocatable program selected.
                    // But how to distinguish "Not Selected" vs "Selected General"?
                    // Select default option value is also "".
                    // We can check if allocatablePrograms has match.
                    min={1}
                    max={maxAmount}
                    className={`block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition ${Number(formData.amount) > maxAmount ? 'border-red-500 ring-4 ring-red-500/10' : ''}`}
                    value={formData.amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                  />
                </div>
                {/* Helper Balance or Warning */ }
                {Number(formData.amount) > maxAmount && maxAmount > 0 ? (
                  <p className="mt-1 text-xs font-bold text-red-500 animate-pulse">
                     ⚠️ Nominal melebihi saldo tersedia (Maks: {formatRupiah(maxAmount)})
                  </p>
                ) : maxAmount > 0 && (
                   <div className="mt-1 flex justify-between text-xs">
                      <span className="text-slate-500">
                        {formData.amount ? "Sisa saldo setelah alokasi:" : "Maksimal tersedia:"}
                      </span>
                      <span className={`font-bold ${formData.amount ? 'text-blue-600' : 'text-emerald-600'}`}>
                        {formatRupiah(maxAmount - Number(formData.amount))}
                      </span>
                   </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Keterangan / Tujuan <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={4}
                  placeholder="Contoh: Operasional Program A Tahap 1"
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
                    Pastikan nominal dan mitra sudah sesuai sebelum menyimpan. Dana yang dialokasikan akan langsung mengurangi saldo Dompet Mitra.
                  </p>
                </div>
             </div>
           </div>

           {/* Proof & Action Box */}
           <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Bukti Penggunaan (Foto/Nota)</label>
                 
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
    </div>
  );
}
