import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCircleInfo,
  faFloppyDisk,
  faReceipt,
  faHandHoldingHeart,
  faMoneyBillWave,
  faUser,
  faEnvelope,
  faCreditCard,
  faAlignLeft,
  faCalendarDays,
  faImage,
  faTrash,
  faCloudArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import http from "../../../../lib/http";
import { useToast } from "../../../../components/ui/ToastProvider";
import PhoneInput from "../../../../components/ui/PhoneInput";
import { resolveStorageUrl } from "../../../../lib/urls";

type BankAccount = {
  id: number;
  bank_name: string;
  account_number: string;
  account_name: string;
};

type ProgramOption = {
  id: number;
  title: string;
};

type ProgramsPayload = {
  data?: { id: number; title: string }[];
};

type ManualDonationFormState = {
  program_id: string;
  donor_name: string;
  donor_email: string;
  donor_phone: string;
  amount: string;
  is_anonymous: boolean;
  payment_method: string;
  payment_channel: string;
  notes: string;
  paid_at: string;
  manual_proof_path: string;
};

const getLocalDatetimeString = (date = new Date()) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const emptyForm: ManualDonationFormState = {
  program_id: "",
  donor_name: "",
  donor_email: "",
  donor_phone: "",
  amount: "",
  is_anonymous: false,
  payment_method: "Transfer Bank",
  payment_channel: "",
  notes: "",
  paid_at: getLocalDatetimeString(),
  manual_proof_path: "",
};

const normalizeErrors = (error: any): string[] => {
  const errors = error?.response?.data?.errors;
  if (!errors || typeof errors !== "object") {
    const message = error?.response?.data?.message ?? error?.message;
    return message ? [String(message)] : ["Terjadi kesalahan."];
  }

  const messages: string[] = [];
  for (const key of Object.keys(errors)) {
    const value = (errors as any)[key];
    if (Array.isArray(value)) value.forEach((msg) => messages.push(String(msg)));
    else if (value) messages.push(String(value));
  }
  return messages.length ? messages : ["Validasi gagal."];
};

const formatCurrency = (value: number | string | null | undefined) => {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  );
};

export function AdminDonationManualCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ManualDonationFormState>(emptyForm);
  const [programOptions, setProgramOptions] = useState<ProgramOption[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [programLoading, setProgramLoading] = useState(false);

  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofError, setProofError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const amountNumber = useMemo(() => Number(form.amount || 0), [form.amount]);
  const proofUrl = useMemo(() => resolveStorageUrl(form.manual_proof_path), [form.manual_proof_path]);

  const canSubmit = !saving && !uploadingProof;

  useEffect(() => {
    let active = true;
    setProgramLoading(true);
    http
      .get<ProgramsPayload>("/admin/programs", { params: { page: 1, per_page: 100 } })
      .then((res) => {
        if (!active) return;
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setProgramOptions(list.map((item) => ({ id: item.id, title: item.title })));
      })
      .catch(() => {
        if (!active) return;
        setProgramOptions([]);
      })
      .finally(() => active && setProgramLoading(false));

    http.get<{ bank_accounts: BankAccount[] }>("/organization")
      .then((res) => {
        if (!active) return;
        setBankAccounts(res.data?.bank_accounts || []);
      })
      .catch(console.error);

    return () => {
      active = false;
    };
  }, []);

  const onUploadProof = async (file: File) => {
    setProofError(null);
    setUploadingProof(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "donations/proofs");
      const res = await http.post<{ path: string }>("/admin/uploads/image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((s) => ({ ...s, manual_proof_path: res.data.path }));
      toast.success("Bukti transfer berhasil diunggah.", { title: "Berhasil" });
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Gagal mengunggah bukti transfer. Pastikan format JPG, PNG, atau WEBP (Maks. 10MB).";
      setProofError(msg);
      toast.error("Gagal mengunggah bukti transfer.", { title: "Gagal" });
    } finally {
      setUploadingProof(false);
    }
  };

  const payloadForRequest = (state: ManualDonationFormState) => {
    const amount = Number(state.amount || 0);
    return {
      program_id: state.program_id.trim() ? Number(state.program_id) : null,
      donor_name: state.donor_name.trim(),
      donor_email: state.donor_email.trim() || null,
      donor_phone: state.donor_phone.trim() || null,
      amount: Number.isFinite(amount) ? amount : 0,
      is_anonymous: Boolean(state.is_anonymous),
      payment_method: state.payment_method.trim(),
      payment_channel: state.payment_channel.trim() || null,
      notes: state.notes.trim() || null,
      paid_at: state.paid_at ? new Date(state.paid_at).toISOString() : null,
      manual_proof_path: state.manual_proof_path.trim() || null,
    };
  };

  const onSubmit = async () => {
    setErrors([]);
    setSaving(true);
    try {
      const payload = payloadForRequest(form);
      await http.post("/admin/donations/manual", payload);
      toast.success("Donasi manual berhasil dibuat.", { title: "Berhasil" });
      navigate("/admin/donations", { replace: true });
    } catch (err: any) {
      setErrors(normalizeErrors(err));
      toast.error("Gagal menyimpan donasi. Periksa kembali input Anda.", { title: "Gagal" });
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-60";
  const labelClass = "block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1";

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-in space-y-8 pb-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-emerald-700 shadow-xl">
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl filter" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl filter" />

        <div className="relative z-10 p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <button
                onClick={() => navigate("/admin/donations")}
                className="group inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-50 backdrop-blur-sm transition hover:bg-white/20"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="transition group-hover:-translate-x-1" />
                Kembali
              </button>

              <div>
                <h1 className="font-heading text-3xl font-bold text-white md:text-5xl">Input Donasi Manual</h1>
                <p className="mt-2 text-lg text-emerald-100/90 font-medium max-w-2xl">
                  Catat transaksi offline (transfer bank, tunai, atau QRIS) secara langsung ke dalam sistem. Status akan otomatis menjadi <span className="font-bold text-white underline decoration-emerald-400/50 underline-offset-4">Lunas</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {errors.length ? (
        <div className="rounded-[24px] border border-rose-100 bg-rose-50 p-6 flex items-start gap-4 shadow-sm animate-pulse-soft">
          <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 shrink-0">
            <FontAwesomeIcon icon={faCircleInfo} />
          </div>
          <div>
            <h3 className="font-bold text-rose-700">Validasi Gagal</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-rose-600 font-medium">
              {errors.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Main Form Area */}
        <div className="space-y-8 lg:col-span-8">

          {/* Transaction Details */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 ring-1 ring-emerald-100">
                <FontAwesomeIcon icon={faReceipt} className="text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Detail Transaksi</h2>
                <p className="text-sm text-slate-500 font-medium">Informasi program, tanggal, dan nominal donasi</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block">
                  <span className={labelClass}>Tanggal & Waktu Donasi</span>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={form.paid_at}
                      onChange={(e) => setForm((s) => ({ ...s, paid_at: e.target.value }))}
                      className={`${inputClass} pl-10`}
                      disabled={!canSubmit}
                    />
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <FontAwesomeIcon icon={faCalendarDays} />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-slate-400 font-medium">
                    Bisa diubah ke tanggal lampau jika mencatat data donatur yang sudah lama/berlalu.
                  </p>
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="block">
                  <div className="flex items-center justify-between mb-1">
                    <span className={labelClass}>Program Donasi</span>
                    <span className="text-[11px] font-semibold text-slate-400 normal-case">(Opsional)</span>
                  </div>
                  <div className="relative">
                    <select
                      value={form.program_id}
                      onChange={(e) => setForm((s) => ({ ...s, program_id: e.target.value }))}
                      className={`${inputClass} appearance-none`}
                      disabled={programLoading || !canSubmit}
                    >
                      <option value="">{programLoading ? "Memuat data program..." : "Pilih Program (Opsional / Donasi Umum)"}</option>
                      {programOptions.map((p) => (
                        <option key={p.id} value={String(p.id)}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <FontAwesomeIcon icon={faHandHoldingHeart} />
                    </div>
                  </div>
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="block">
                  <span className={labelClass}>Nominal Donasi (Rp)</span>
                  <div className="relative">
                    <input
                      value={form.amount}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val.length > 15) return;
                        if (Number(val) > 1000000000000) return;
                        setForm((s) => ({ ...s, amount: val }));
                      }}
                      placeholder="Contoh: 100000"
                      inputMode="numeric"
                      className={`${inputClass} pl-12 text-lg`}
                      disabled={!canSubmit}
                    />
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      Rp
                    </div>
                  </div>
                  <p className="mt-2 text-xs font-bold text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded-md border border-emerald-100">
                    Terbaca: {formatCurrency(amountNumber)}
                  </p>
                </label>
              </div>

              <div>
                <label className="block">
                  <span className={labelClass}>Metode Pembayaran</span>
                  <div className="relative">
                    <input
                      value={form.payment_method}
                      onChange={(e) => setForm((s) => ({ ...s, payment_method: e.target.value }))}
                      placeholder="Contoh: Transfer Bank"
                      className={`${inputClass} pl-10`}
                      disabled={!canSubmit}
                    />
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <FontAwesomeIcon icon={faMoneyBillWave} />
                    </div>
                  </div>
                </label>
              </div>

              <div>
                <label className="block">
                  <div className="flex items-center justify-between mb-1">
                    <span className={labelClass}>Channel / Bank</span>
                    <span className="text-[11px] font-semibold text-slate-400 normal-case">(Opsional)</span>
                  </div>
                  <div className="relative">
                    <select
                      value={form.payment_channel}
                      onChange={(e) => setForm((s) => ({ ...s, payment_channel: e.target.value }))}
                      className={`${inputClass} pl-10 appearance-none`}
                      disabled={!canSubmit}
                    >
                      <option value="">Pilih Rekening Tujuan (Opsional)</option>
                      {bankAccounts.map((acc) => (
                        <option key={acc.id} value={`${acc.bank_name} - ${acc.account_number}`}>
                          {acc.bank_name} - {acc.account_number} a.n {acc.account_name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <FontAwesomeIcon icon={faCreditCard} />
                    </div>
                  </div>
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="block">
                  <div className="flex items-center justify-between mb-1">
                    <span className={labelClass}>Catatan Tambahan</span>
                    <span className="text-[11px] font-semibold text-slate-400 normal-case">(Opsional)</span>
                  </div>
                  <div className="relative">
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))}
                      rows={3}
                      placeholder="Catatan internal atau pesan dari donatur..."
                      className={`${inputClass} pl-10 resize-none`}
                      disabled={!canSubmit}
                    />
                    <div className="pointer-events-none absolute left-4 top-5 text-slate-400">
                      <FontAwesomeIcon icon={faAlignLeft} />
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Bukti Transfer (Opsional) */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 ring-1 ring-teal-100">
                <FontAwesomeIcon icon={faImage} className="text-xl" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">Bukti Pembayaran / Transfer</h2>
                  <span className="text-xs font-semibold text-slate-400">(Opsional)</span>
                </div>
                <p className="text-sm text-slate-500 font-medium">Foto struk ATM, tangkapan layar m-banking, atau file bukti transaksi</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!canSubmit || uploadingProof}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faCloudArrowUp} className="text-xs" />
                  {form.manual_proof_path ? "Ganti Bukti Transfer" : "Unggah Bukti Transfer"}
                </button>

                {form.manual_proof_path && (
                  <button
                    type="button"
                    onClick={() => setForm((s) => ({ ...s, manual_proof_path: "" }))}
                    disabled={!canSubmit || uploadingProof}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-xs" />
                    Hapus
                  </button>
                )}

                {uploadingProof && (
                  <span className="text-xs font-semibold text-emerald-600 animate-pulse">
                    Mengunggah file...
                  </span>
                )}
              </div>

              {proofError && (
                <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                  {proofError}
                </p>
              )}

              {form.manual_proof_path && proofUrl ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2 max-w-md">
                  <a href={proofUrl} target="_blank" rel="noopener noreferrer" className="block cursor-zoom-in group relative">
                    <img
                      src={proofUrl}
                      alt="Bukti Transfer"
                      className="h-auto max-h-60 w-full rounded-xl object-contain"
                    />
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="rounded-lg bg-white/90 px-3 py-1 text-xs font-bold text-slate-800 shadow">
                        Klik untuk melihat ukuran penuh
                      </span>
                    </div>
                  </a>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center transition hover:border-slate-300 hover:bg-slate-50 flex flex-col items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faImage} className="text-2xl text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">
                    Klik untuk memilih foto / gambar bukti transfer (JPG, PNG, WEBP)
                  </p>
                  <p className="text-[11px] text-slate-400">Maksimal ukuran file 10MB</p>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) onUploadProof(file);
                }}
                disabled={!canSubmit || uploadingProof}
              />
            </div>
          </div>

          {/* Donor Info */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 ring-1 ring-indigo-100">
                <FontAwesomeIcon icon={faUser} className="text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Informasi Donatur</h2>
                <p className="text-sm text-slate-500 font-medium">Data diri penyumbang (opsional)</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block">
                  <span className={labelClass}>Nama Lengkap</span>
                  <div className="relative">
                    <input
                      value={form.donor_name}
                      onChange={(e) => setForm((s) => ({ ...s, donor_name: e.target.value }))}
                      placeholder="Nama Donatur (atau Hamba Allah)"
                      className={`${inputClass} pl-10`}
                      disabled={!canSubmit}
                    />
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <FontAwesomeIcon icon={faUser} />
                    </div>
                  </div>
                </label>
              </div>

              <div>
                <label className="block">
                  <div className="flex items-center justify-between mb-1">
                    <span className={labelClass}>Email</span>
                    <span className="text-[11px] font-semibold text-slate-400 normal-case">(Opsional)</span>
                  </div>
                  <div className="relative">
                    <input
                      value={form.donor_email}
                      onChange={(e) => setForm((s) => ({ ...s, donor_email: e.target.value }))}
                      placeholder="email@contoh.com"
                      className={`${inputClass} pl-10`}
                      disabled={!canSubmit}
                    />
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <FontAwesomeIcon icon={faEnvelope} />
                    </div>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 font-medium">
                    Tidak wajib diisi jika donatur tidak memiliki email.
                  </p>
                </label>
              </div>

              <div>
                <label className="block">
                  <div className="flex items-center justify-between mb-1">
                    <span className={labelClass}>Nomor Telepon</span>
                    <span className="text-[11px] font-semibold text-slate-400 normal-case">(Opsional)</span>
                  </div>
                  <div className="relative">
                    <PhoneInput
                      value={form.donor_phone}
                      onChange={(val) => setForm((s) => ({ ...s, donor_phone: val || "" }))}
                      disabled={!canSubmit}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 font-medium">
                    Tidak wajib diisi jika nomor tidak diketahui.
                  </p>
                </label>
              </div>

              <div className="sm:col-span-2 mt-2">
                <label className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer transition hover:bg-slate-100 hover:border-slate-300">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={form.is_anonymous}
                      onChange={(e) => setForm((s) => ({ ...s, is_anonymous: e.target.checked }))}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 transition-all checked:border-emerald-500 checked:bg-emerald-500 hover:shadow-sm"
                      disabled={!canSubmit}
                    />
                    <FontAwesomeIcon icon={faCircleInfo} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] text-white opacity-0 peer-checked:opacity-100" />
                  </div>
                  <div className="flex-1">
                    <span className="block text-sm font-bold text-slate-900">Sembunyikan Nama (Hamba Allah)</span>
                    <span className="text-xs text-slate-500 font-medium">Nama donatur tidak akan ditampilkan di halaman publik website.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="sticky top-8 space-y-6">
            <div className="rounded-[24px] border border-emerald-100 bg-white p-6 shadow-xl shadow-emerald-50/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <FontAwesomeIcon icon={faFloppyDisk} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Simpan Data</h3>
                  <p className="text-xs text-slate-500">Konfirmasi input manual</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-800 uppercase mb-1">Total Donasi</p>
                  <p className="text-2xl font-bold text-emerald-700 tracking-tight">{formatCurrency(amountNumber)}</p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => void onSubmit()}
                    disabled={!canSubmit}
                    className="group w-full rounded-xl bg-emerald-600 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {saving ? (
                      "Memproses..."
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <FontAwesomeIcon icon={faFloppyDisk} className="text-emerald-200 group-hover:text-white transition" />
                        Simpan Transaksi
                      </span>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-slate-400 font-medium mt-3">
                    Data akan disimpan sebagai donasi <span className="text-emerald-600 font-bold">LUNAS</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default AdminDonationManualCreatePage;
