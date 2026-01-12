import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCircleInfo,
  faFloppyDisk,
  faPlus,
  faReceipt,
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
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="rounded-[28px] border border-primary-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-700 ring-1 ring-primary-100">
              <span className="h-2 w-2 rounded-full bg-primary-600" />
              Donasi manual
            </span>
            <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">Input Donasi</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Input transaksi offline (transfer/QR/konter) dengan status langsung lunas.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/donations")}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            disabled={!canSubmit}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Kembali
          </button>
        </div>
      </div>

      {errors.length ? (
        <div className="rounded-[28px] border border-red-100 bg-red-50 p-5 text-sm font-semibold text-red-700">
          <ul className="list-disc space-y-1 pl-5">
            {errors.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 ring-1 ring-primary-100">
                <FontAwesomeIcon icon={faReceipt} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Transaksi</p>
                <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">Detail Pembayaran</h2>
                <p className="mt-2 text-sm text-slate-600">Pastikan nominal dan metode pembayaran sesuai bukti.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Program (opsional)</span>
                <select
                  value={form.program_id}
                  onChange={(e) => setForm((s) => ({ ...s, program_id: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={programLoading || !canSubmit}
                >
                  <option value="">{programLoading ? "Memuat..." : "Tanpa program"}</option>
                  {programOptions.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Nominal</span>
                <input
                  value={form.amount}
                  onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value }))}
                  placeholder="Contoh: 50000"
                  inputMode="numeric"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={!canSubmit}
                />
                <p className="mt-2 text-xs font-semibold text-slate-500">Pratinjau: {formatCurrency(amountNumber)}</p>
              </label>

              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Metode</span>
                <input
                  value={form.payment_method}
                  onChange={(e) => setForm((s) => ({ ...s, payment_method: e.target.value }))}
                  placeholder="Mis. Transfer Bank"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={!canSubmit}
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Channel (opsional)</span>
                <input
                  value={form.payment_channel}
                  onChange={(e) => setForm((s) => ({ ...s, payment_channel: e.target.value }))}
                  placeholder="Mis. BCA / QRIS / Konter"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={!canSubmit}
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Catatan (opsional)</span>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))}
                  rows={4}
                  placeholder="Mis. konfirmasi via WhatsApp"
                  className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={!canSubmit}
                />
              </label>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-semibold text-slate-600">
              <span className="inline-flex items-start gap-2">
                <FontAwesomeIcon icon={faCircleInfo} className="mt-0.5 text-slate-500" />
                Donasi manual akan disimpan dengan status <span className="font-bold">paid</span>.
              </span>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                <FontAwesomeIcon icon={faPlus} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Donatur</p>
                <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">Informasi Donatur</h2>
                <p className="mt-2 text-sm text-slate-600">Boleh anonim jika tidak ingin ditampilkan.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Nama</span>
                <input
                  value={form.donor_name}
                  onChange={(e) => setForm((s) => ({ ...s, donor_name: e.target.value }))}
                  placeholder="Nama donatur"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={!canSubmit}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Email</span>
                <input
                  value={form.donor_email}
                  onChange={(e) => setForm((s) => ({ ...s, donor_email: e.target.value }))}
                  placeholder="opsional"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={!canSubmit}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Telepon</span>
                <input
                  value={form.donor_phone}
                  onChange={(e) => setForm((s) => ({ ...s, donor_phone: e.target.value }))}
                  placeholder="opsional"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={!canSubmit}
                />
              </label>

              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.is_anonymous}
                  onChange={(e) => setForm((s) => ({ ...s, is_anonymous: e.target.checked }))}
                  className="mt-1 h-4 w-4"
                  disabled={!canSubmit}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-slate-900">Anonimkan Donatur</span>
                  <span className="mt-1 block text-xs font-semibold text-slate-600">
                    Jika aktif, nama tidak tampil di landing.
                  </span>
                </span>
              </label>
            </div>
          </div>
        </div>

        <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-[28px] border border-primary-100 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 ring-1 ring-primary-100">
                <FontAwesomeIcon icon={faFloppyDisk} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Simpan</p>
                <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">Konfirmasi Input</h2>
                <p className="mt-2 text-sm text-slate-600">Pastikan data sudah benar sebelum disimpan.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void onSubmit()}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brandGreen-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-600 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={!canSubmit}
            >
              <FontAwesomeIcon icon={faFloppyDisk} />
              {saving ? "Menyimpan..." : "Simpan donasi"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default AdminDonationManualCreatePage;

