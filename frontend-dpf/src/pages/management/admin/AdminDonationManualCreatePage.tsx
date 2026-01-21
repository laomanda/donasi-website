import { useEffect, useMemo, useState } from "react";
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
  faPhone,
  faCreditCard,
  faAlignLeft,
} from "@fortawesome/free-solid-svg-icons";
import http from "../../../lib/http";
import { useToast } from "../../../components/ui/ToastProvider";

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

  const [form, setForm] = useState<ManualDonationFormState>(emptyForm);
  const [programOptions, setProgramOptions] = useState<ProgramOption[]>([]);
  const [programLoading, setProgramLoading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const amountNumber = useMemo(() => Number(form.amount || 0), [form.amount]);

  const canSubmit = !saving;

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

    return () => {
      active = false;
    };
  }, []);

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
        <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10" />
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
                <p className="text-sm text-slate-500 font-medium">Informasi program dan nominal donasi</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block">
                  <span className={labelClass}>Program Donasi</span>
                  <div className="relative">
                    <select
                      value={form.program_id}
                      onChange={(e) => setForm((s) => ({ ...s, program_id: e.target.value }))}
                      className={`${inputClass} appearance-none`}
                      disabled={programLoading || !canSubmit}
                    >
                      <option value="">{programLoading ? "Memuat data program..." : "Pilih Program (Opsional)"}</option>
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
                  <span className={labelClass}>Channel / Bank</span>
                  <div className="relative">
                    <input
                      value={form.payment_channel}
                      onChange={(e) => setForm((s) => ({ ...s, payment_channel: e.target.value }))}
                      placeholder="Contoh: BCA / QRIS"
                      className={`${inputClass} pl-10`}
                      disabled={!canSubmit}
                    />
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <FontAwesomeIcon icon={faCreditCard} />
                    </div>
                  </div>
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="block">
                  <span className={labelClass}>Catatan Tambahan</span>
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
                  <span className={labelClass}>Email</span>
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
                </label>
              </div>

              <div>
                <label className="block">
                  <span className={labelClass}>Nomor Telepon</span>
                  <div className="relative">
                    <input
                      value={form.donor_phone}
                      onChange={(e) => setForm((s) => ({ ...s, donor_phone: e.target.value }))}
                      placeholder="0812..."
                      className={`${inputClass} pl-10`}
                      disabled={!canSubmit}
                    />
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <FontAwesomeIcon icon={faPhone} />
                    </div>
                  </div>
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
