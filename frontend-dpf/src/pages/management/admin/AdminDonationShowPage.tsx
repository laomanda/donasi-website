import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCircleInfo,
  faFloppyDisk,
  faReceipt,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import http from "../../../lib/http";
import { useToast } from "../../../components/ui/ToastProvider";

type DonationStatus = "pending" | "paid" | "failed" | "expired" | "cancelled" | string;

type Donation = {
  id: number;
  program_id?: number | null;
  donation_code?: string | null;
  donor_name?: string | null;
  donor_email?: string | null;
  donor_phone?: string | null;
  amount?: number | string | null;
  is_anonymous?: boolean | null;
  payment_source?: string | null;
  payment_method?: string | null;
  payment_channel?: string | null;
  status?: DonationStatus | null;
  midtrans_order_id?: string | null;
  midtrans_transaction_id?: string | null;
  midtrans_va_numbers?: unknown;
  manual_proof_path?: string | null;
  paid_at?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  program?: { id?: number; title?: string | null; slug?: string | null } | null;
};

const getBackendBaseUrl = () => {
  const api = (import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
  const backend = import.meta.env.VITE_BACKEND_URL ?? api.replace(/\/api(\/v1)?$/, "");
  return String(backend).replace(/\/$/, "");
};

const resolveStorageUrl = (path: string | null | undefined) => {
  const value = String(path ?? "").trim();
  if (!value) return null;
  if (value.startsWith("http")) return value;
  const clean = value.replace(/^\/+/, "").replace(/^storage\//, "");
  return `${getBackendBaseUrl()}/storage/${clean}`;
};

const formatCurrency = (value: number | string | null | undefined) => {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  );
};

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const toLocalDateTimeInput = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`;
};

const toIsoFromLocalInput = (value: string) => {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return null;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

const getStatusTone = (status: DonationStatus) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "paid") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (s === "pending") return "bg-amber-50 text-amber-700 ring-amber-100";
  if (s === "failed" || s === "cancelled") return "bg-red-50 text-red-700 ring-red-100";
  if (s === "expired") return "bg-slate-100 text-slate-700 ring-slate-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
};

const getStatusLabel = (status: DonationStatus) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "paid") return "Lunas";
  if (s === "pending") return "Menunggu";
  if (s === "failed") return "Gagal";
  if (s === "expired") return "Kedaluwarsa";
  if (s === "cancelled") return "Dibatalkan";
  return String(status || "-");
};

export function AdminDonationShowPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams<{ id: string }>();
  const donationId = useMemo(() => Number(id), [id]);

  const [data, setData] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<DonationStatus>("pending");
  const [paidAtLocal, setPaidAtLocal] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canLoad = Number.isFinite(donationId) && donationId > 0;
  const isMidtrans = String(data?.payment_source ?? "").toLowerCase() === "midtrans";
  const persistedStatus = String(data?.status ?? status).trim().toLowerCase();
  const isPendingStatus = persistedStatus === "pending";
  const isStatusLocked = persistedStatus !== "" && persistedStatus !== "pending";
  const canSave = canLoad && !loading && !saving && !deleting && !isMidtrans && isPendingStatus;
  const canDelete = canLoad && !loading && !saving && !deleting && isPendingStatus;

  const proofUrl = useMemo(() => resolveStorageUrl(data?.manual_proof_path), [data?.manual_proof_path]);
  const statusOptions = useMemo(
    () => {
      if (isStatusLocked) {
        return [
          {
            value: persistedStatus || "pending",
            label: getStatusLabel(persistedStatus || "pending"),
            disabled: true,
          },
        ];
      }
      return [
        { value: "pending", label: "Menunggu", disabled: false },
        { value: "paid", label: "Lunas", disabled: false },
        { value: "failed", label: "Gagal", disabled: false },
        { value: "expired", label: "Kedaluwarsa", disabled: false },
        { value: "cancelled", label: "Dibatalkan", disabled: false },
      ];
    },
    [isStatusLocked, persistedStatus],
  );

  useEffect(() => {
    if (!canLoad) {
      setError("ID donasi tidak valid.");
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);
    http
      .get<Donation>(`/admin/donations/${donationId}`)
      .then((res) => {
        if (!active) return;
        setData(res.data);
        const currentStatus = String(res.data?.status ?? "pending");
        setStatus(currentStatus);
        setPaidAtLocal(res.data?.paid_at ? toLocalDateTimeInput(res.data.paid_at) : "");
        setNotes(String(res.data?.notes ?? ""));
      })
      .catch(() => {
        if (!active) return;
        setError("Gagal memuat detail donasi.");
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [canLoad, donationId]);

  const onSaveStatus = async () => {
    if (!canLoad) return;
    setSaving(true);
    try {
      const desiredStatus = String(status ?? "").trim();
      const paidAtIso = toIsoFromLocalInput(paidAtLocal);
      const shouldAutoPaidAt = desiredStatus === "paid" && !paidAtIso;
      await http.patch(`/admin/donations/${donationId}/status`, {
        status: desiredStatus,
        paid_at: shouldAutoPaidAt ? new Date().toISOString() : paidAtIso,
        notes: notes.trim() || null,
      });
      toast.success("Status donasi berhasil diperbarui.", { title: "Berhasil" });
      navigate("/admin/donations", { replace: true });
    } catch (err: any) {
      const message = err?.response?.data?.message ?? "Gagal memperbarui status donasi.";
      toast.error(String(message), { title: "Gagal" });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!canLoad) return;
    setDeleting(true);
    try {
      await http.delete(`/admin/donations/${donationId}`);
      toast.success("Donasi berhasil dihapus.", { title: "Berhasil" });
      navigate("/admin/donations", { replace: true });
    } catch (err: any) {
      const message = err?.response?.data?.message ?? "Gagal menghapus donasi.";
      toast.error(String(message), { title: "Gagal" });
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="rounded-[28px] border border-primary-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-700 ring-1 ring-primary-100">
              <span className="h-2 w-2 rounded-full bg-primary-600" />
              Detail donasi
            </span>
            <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">
              {loading ? "Memuat..." : String(data?.donation_code ?? `#${donationId}`)}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Informasi donatur, metode pembayaran, dan kontrol status donasi.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/donations")}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Kembali
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-[28px] border border-red-100 bg-red-50 p-5 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <h2 className="font-heading text-xl font-semibold text-slate-900">Ringkasan</h2>
                <p className="text-sm font-medium text-slate-600">Data utama donasi yang tercatat di sistem.</p>
              </div>
              <span
                className={[
                  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1",
                  getStatusTone(String(data?.status ?? status)),
                ].join(" ")}
              >
                {getStatusLabel(String(data?.status ?? status))}
              </span>
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <dt className="text-xs font-semibold text-slate-500">Nominal</dt>
                <dd className="mt-2 font-heading text-2xl font-bold text-slate-900">
                  {formatCurrency(data?.amount)}
                </dd>
                <p className="mt-2 text-xs font-semibold text-slate-500">Dibuat: {formatDateTime(data?.created_at)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <dt className="text-xs font-semibold text-slate-500">Waktu bayar</dt>
                <dd className="mt-2 text-sm font-bold text-slate-900">{formatDateTime(data?.paid_at)}</dd>
                <p className="mt-2 text-xs font-semibold text-slate-500">Diperbarui: {formatDateTime(data?.updated_at)}</p>
              </div>
            </dl>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Program</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {String(data?.program?.title ?? "").trim() || "Tanpa program"}
              </p>
              {data?.program?.slug ? (
                <button
                  type="button"
                  onClick={() => window.open(`/program/${data.program?.slug}`, "_blank", "noopener,noreferrer")}
                  className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-primary-200 bg-white px-4 py-2.5 text-sm font-bold text-primary-800 shadow-sm transition hover:bg-primary-50"
                >
                  <FontAwesomeIcon icon={faReceipt} />
                  Lihat di landing
                </button>
              ) : null}
            </div>

            {proofUrl ? (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Bukti manual</p>
                <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <img
                    src={proofUrl}
                    alt="Bukti pembayaran manual"
                    className="h-auto w-full max-h-[420px] object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-heading text-xl font-semibold text-slate-900">Data Donatur</h2>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <dt className="text-xs font-semibold text-slate-500">Nama</dt>
                <dd className="mt-2 text-sm font-bold text-slate-900">
                  {String(data?.donor_name ?? "").trim() || "Anonim"}
                </dd>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <dt className="text-xs font-semibold text-slate-500">Anonim</dt>
                <dd className="mt-2 text-sm font-bold text-slate-900">
                  {data?.is_anonymous ? "Ya" : "Tidak"}
                </dd>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <dt className="text-xs font-semibold text-slate-500">Email</dt>
                <dd className="mt-2 text-sm font-bold text-slate-900">{data?.donor_email ? String(data.donor_email) : "-"}</dd>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <dt className="text-xs font-semibold text-slate-500">Telepon</dt>
                <dd className="mt-2 text-sm font-bold text-slate-900">{data?.donor_phone ? String(data.donor_phone) : "-"}</dd>
              </div>
            </dl>
          </div>
        </div>

        <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-[28px] border border-primary-100 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 ring-1 ring-primary-100">
                <FontAwesomeIcon icon={faReceipt} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Kontrol</p>
                <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">Status Donasi</h2>
                <p className="mt-2 text-sm text-slate-600">
                  {isMidtrans
                    ? "Transaksi Midtrans bersifat otomatis dan status tidak dapat diubah dari admin."
                    : "Perbarui status untuk verifikasi dan pelaporan."}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={!canSave || isStatusLocked}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value} disabled={option.disabled}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Waktu bayar</span>
                <input
                  type="datetime-local"
                  value={paidAtLocal}
                  onChange={(e) => setPaidAtLocal(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={!canSave}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Catatan</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Catatan internal (opsional)."
                  className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={!canSave}
                />
              </label>

              <button
                type="button"
                onClick={() => void onSaveStatus()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brandGreen-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={!canSave}
              >
                <FontAwesomeIcon icon={faFloppyDisk} />
                Simpan perubahan
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-semibold text-slate-600">
              <span className="inline-flex items-start gap-2">
                <FontAwesomeIcon icon={faCircleInfo} className="mt-0.5 text-slate-500" />
                {isMidtrans ? (
                  <>
                    Status Midtrans dikelola otomatis oleh sistem pembayaran.
                  </>
                ) : (
                  <>
                    Perubahan status <span className="font-bold">paid</span> akan mempengaruhi total terkumpul pada program.
                  </>
                )}
              </span>
            </div>
          </div>

          {isPendingStatus ? (
            <div className="rounded-[28px] border border-red-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-700 ring-1 ring-red-100">
                  <FontAwesomeIcon icon={faTrash} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Aksi</p>
                  <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">Hapus Donasi</h2>
                  <p className="mt-2 text-sm text-slate-600">Gunakan hanya jika benar-benar diperlukan.</p>
                </div>
              </div>

              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                  disabled={!canDelete}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  Hapus
                </button>
              ) : (
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    disabled={deleting}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => void onDelete()}
                    className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    disabled={deleting}
                  >
                    {deleting ? "Menghapus..." : "Konfirmasi"}
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

export default AdminDonationShowPage;


