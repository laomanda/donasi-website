import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
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
  faReceipt,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import http from "@/lib/http";
import { useToast } from "@/components/ui/ToastProvider";
import { resolveStorageUrl } from "@/lib/urls";
import type { Allocation, AllocatableProgram } from "@/types/allocation";

export function AdminAllocationEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const basePath = location.pathname.startsWith("/keuangan") ? "/keuangan" : "/admin";

  const [allocation, setAllocation] = useState<Allocation | null>(null);
  const [allocatablePrograms, setAllocatablePrograms] = useState<AllocatableProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [programId, setProgramId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [allocatedAt, setAllocatedAt] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeProof, setRemoveProof] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([
      http.get<{ data: Allocation }>(`/admin/allocations/${id}`),
      http.get<{ data: AllocatableProgram[] }>("/admin/allocations/allocatable-programs"),
    ])
      .then(([allocRes, progRes]) => {
        if (!active) return;
        const alloc = allocRes.data?.data;
        const programs = Array.isArray(progRes.data?.data) ? progRes.data.data : [];

        setAllocation(alloc || null);
        setAllocatablePrograms(programs);

        if (alloc) {
          setProgramId(alloc.program_id ? String(alloc.program_id) : "general");
          setAmount(String(alloc.amount));
          setAllocatedAt(alloc.allocated_at ? alloc.allocated_at.split("T")[0] : alloc.created_at.split("T")[0]);
          setDescription(alloc.description || "");
          if (alloc.proof_path) {
            setPreviewUrl(resolveStorageUrl(alloc.proof_path) || null);
          }
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Gagal memuat data penyaluran.", { title: "Gagal" });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const selectedProgram = allocatablePrograms.find((p) => {
    if (programId === "general") return p.program_id === null;
    return String(p.program_id) === String(programId);
  }) || null;

  // Calculate available balance for this program adding back original allocation amount if same program
  const currentAllocationAmount = allocation ? Number(allocation.amount) : 0;
  const isSameProgram = allocation && (
    (programId === "general" && allocation.program_id === null) ||
    (String(allocation.program_id) === String(programId))
  );

  const maxAmount = selectedProgram
    ? selectedProgram.remaining_balance + (isSameProgram ? currentAllocationAmount : 0)
    : 0;

  const isProgramSelected = Boolean(programId);
  const amountNumber = Number(amount || 0);
  const isAmountOver = maxAmount > 0 && amountNumber > maxAmount;

  const handleProgramChange = (selectedVal: string) => {
    setProgramId(selectedVal);
  };

  const handleAmountChange = (val: string) => {
    const rawVal = val.replace(/\D/g, "");
    if (rawVal.length > 15) return;
    setAmount(rawVal);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      setRemoveProof(false);
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleRemoveProof = () => {
    setProofFile(null);
    setPreviewUrl(null);
    setRemoveProof(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!programId) {
      toast.error("Pilih program donasi terlebih dahulu.", { title: "Validasi Gagal" });
      return;
    }

    if (amountNumber <= 0) {
      toast.error("Nominal penyaluran harus lebih dari 0.", { title: "Validasi Gagal" });
      return;
    }

    if (amountNumber > maxAmount) {
      toast.error(`Nominal melebihi saldo tersedia (Maksimal: ${formatRupiah(maxAmount)})`, {
        title: "Validasi Gagal",
      });
      return;
    }

    setSubmitting(true);

    const fd = new FormData();
    fd.append("_method", "PUT");
    if (programId !== "general" && programId !== "") {
      fd.append("program_id", programId);
    }
    fd.append("amount", amount);
    if (description.trim()) {
      fd.append("description", description.trim());
    }
    if (allocatedAt) {
      fd.append("allocated_at", allocatedAt);
    }
    if (proofFile) {
      fd.append("proof", proofFile);
    } else if (removeProof) {
      fd.append("remove_proof", "1");
    }

    try {
      await http.post(`/admin/allocations/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Data penyaluran berhasil diperbarui.", { title: "Berhasil" });
      navigate(`${basePath}/allocations/${id}`, { replace: true });
    } catch (err: any) {
      const errs = err.response?.data?.errors;
      let msg = err.response?.data?.message || "Gagal memperbarui penyaluran.";
      if (errs && typeof errs === "object") {
        const firstErr = Object.values(errs).flat()[0];
        if (firstErr) msg = String(firstErr);
      }
      toast.error(msg, { title: "Validasi Gagal" });
    } finally {
      setSubmitting(false);
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number.isFinite(num) ? num : 0);
  };

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100/80 disabled:text-slate-400";
  const labelClass = "block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1";

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl animate-pulse space-y-6 pb-12">
        <div className="h-28 rounded-3xl bg-slate-100" />
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="h-96 rounded-3xl bg-slate-100 lg:col-span-8" />
          <div className="h-96 rounded-3xl bg-slate-100 lg:col-span-4" />
        </div>
      </div>
    );
  }

  if (!allocation) {
    return (
      <div className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-12 text-center">
        <FontAwesomeIcon icon={faReceipt} className="text-4xl text-slate-300 mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Penyaluran Tidak Ditemukan</h2>
        <p className="mt-1 text-sm text-slate-500">Data penyaluran ini mungkin telah dihapus.</p>
        <button
          type="button"
          onClick={() => navigate(`${basePath}/allocations`)}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-slate-800"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Kembali ke Daftar Penyaluran
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-in space-y-6 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-slate-900 shadow-2xl">
        <div className="absolute inset-0 bg-emerald-700" />
        <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl filter" />
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl filter" />

        <div className="relative z-10 p-6 sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <h1 className="font-heading text-2xl font-black text-white sm:text-4xl">
                Edit Penyaluran Dana #{allocation.id}
              </h1>
              <p className="text-sm sm:text-base font-medium text-emerald-100/90">
                Perbarui nominal, program sumber, tanggal, atau bukti dokumentasi kegiatan.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate(`${basePath}/allocations/${allocation.id}`)}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-xs font-bold text-slate-800 shadow-md transition hover:bg-slate-50 active:scale-95 shrink-0"
              disabled={submitting}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-emerald-600" />
              <span>Batal & Kembali</span>
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          {/* 1. Pilih Program Donasi */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 ring-1 ring-emerald-100">
                <FontAwesomeIcon icon={faHandHoldingHeart} className="text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Program Donasi Sumber</h2>
                <p className="text-sm text-slate-500 font-medium">Ubah program donasi sumber jika diperlukan</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block">
                  <span className={labelClass}>Pilih Program *</span>
                  <div className="relative">
                    <select
                      value={programId}
                      onChange={(e) => handleProgramChange(e.target.value)}
                      disabled={submitting}
                      className={`${inputClass} appearance-none pr-10`}
                    >
                      <option value="">-- Pilih Program Donasi --</option>
                      {allocatablePrograms.map((p) => {
                        const valueKey = p.program_id === null ? "general" : String(p.program_id);
                        const isThisSame = allocation && (
                          (p.program_id === null && allocation.program_id === null) ||
                          (String(p.program_id) === String(allocation.program_id))
                        );
                        const displayBal = p.remaining_balance + (isThisSame ? currentAllocationAmount : 0);

                        return (
                          <option key={valueKey} value={valueKey}>
                            {p.program_title} — Tersedia: {formatRupiah(displayBal)}
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
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Teralokasi Lainnya</p>
                      <p className="mt-1 text-sm sm:text-base font-bold text-rose-600">
                        {formatRupiah(
                          selectedProgram.total_allocated - (isSameProgram ? currentAllocationAmount : 0)
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 shadow-xs">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Maksimal Tersedia</p>
                      <p className="mt-1 text-base sm:text-lg font-black text-emerald-700">
                        {formatRupiah(maxAmount)}
                      </p>
                    </div>
                  </div>
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
                  <p className="text-sm text-slate-500 font-medium">Ubah nominal, tanggal, atau deskripsi keperluan</p>
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
                <span>Pilih program donasi sumber terlebih dahulu untuk mengisi nominal dan rincian penyaluran.</span>
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block">
                  <div className="flex items-center justify-between mb-1">
                    <span className={labelClass}>Nominal Penyaluran (Rp) *</span>
                    {isProgramSelected && maxAmount > 0 && (
                      <button
                        type="button"
                        onClick={() => handleAmountChange(String(Math.round(maxAmount)))}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-2"
                      >
                        Salurkan Seluruh Saldo ({formatRupiah(maxAmount)})
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      placeholder="Contoh: 5000000"
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
                      value={allocatedAt}
                      onChange={(e) => setAllocatedAt(e.target.value)}
                      className={`${inputClass} pl-10`}
                      disabled={!isProgramSelected || submitting}
                    />
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <FontAwesomeIcon icon={faCalendarDays} />
                    </div>
                  </div>
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
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder="Contoh: Penyaluran 50 paket sembako untuk lansia & dhuafa di Desa Sukamaju..."
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

          {/* 3. Bukti Dokumentasi */}
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
                <p className="text-sm text-slate-500 font-medium">Foto kegiatan penyaluran, kuitansi, atau dokumen PDF</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!isProgramSelected || submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faCloudArrowUp} className="text-xs" />
                  {previewUrl || proofFile ? "Ganti File Bukti" : "Pilih File Bukti"}
                </button>

                {(previewUrl || proofFile) && (
                  <button
                    type="button"
                    onClick={handleRemoveProof}
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-xs" />
                    Hapus Bukti
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
              ) : proofFile ? (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <FontAwesomeIcon icon={faReceipt} className="text-xl text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">{proofFile.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {(proofFile.size / 1024 / 1024).toFixed(2)} MB
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
                    Klik untuk mengunggah foto baru (JPG, PNG, WEBP, PDF)
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

        {/* Sidebar Summary */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="sticky top-8 space-y-6">
            <div className="rounded-[24px] border border-emerald-100 bg-white p-6 shadow-xl shadow-emerald-50/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <FontAwesomeIcon icon={faFloppyDisk} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Simpan Perubahan</h3>
                  <p className="text-xs text-slate-500">Perbarui data penyaluran</p>
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
                      <span className="text-slate-500">Saldo Maksimal:</span>
                      <span className="font-bold text-slate-800">
                        {formatRupiah(maxAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1.5">
                      <span className="text-slate-500">Sisa Setelahnya:</span>
                      <span className={`font-bold ${maxAmount - amountNumber < 0 ? "text-rose-600" : "text-emerald-700"}`}>
                        {formatRupiah(Math.max(0, maxAmount - amountNumber))}
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting || isAmountOver || amountNumber <= 0 || !programId}
                    className="group w-full rounded-xl bg-emerald-600 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      "Menyimpan Perubahan..."
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <FontAwesomeIcon icon={faFloppyDisk} className="text-emerald-200 group-hover:text-white transition" />
                        Simpan Perubahan
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}

export default AdminAllocationEditPage;
