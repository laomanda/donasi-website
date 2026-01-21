import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCalendarDays,
  faCircleInfo,
  faEnvelope,
  faFloppyDisk,
  faMoneyBillWave,
  faPhone,
  faReceipt,
  faTrash,
  faUser,
  faCheckCircle,
  faClock,
  faBan,
  faExclamationCircle,
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

const getStatusConfig = (status: DonationStatus) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "paid") return {
    bg: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    icon: faCheckCircle, label: "Lunas", border: "border-l-emerald-500",
    headerBg: "bg-emerald-600", decoration: "decoration-emerald-400/50"
  };
  if (s === "pending") return {
    bg: "bg-amber-50 text-amber-700 ring-amber-100",
    icon: faClock, label: "Menunggu", border: "border-l-amber-500",
    headerBg: "bg-amber-500", decoration: "decoration-amber-400/50"
  };
  if (s === "failed") return {
    bg: "bg-rose-50 text-rose-700 ring-rose-100",
    icon: faExclamationCircle, label: "Gagal", border: "border-l-rose-500",
    headerBg: "bg-rose-600", decoration: "decoration-rose-400/50"
  };
  if (s === "cancelled") return {
    bg: "bg-rose-50 text-rose-700 ring-rose-200",
    icon: faBan, label: "Dibatalkan", border: "border-l-rose-400",
    headerBg: "bg-rose-600", decoration: "decoration-rose-400/50"
  };
  return {
    bg: "bg-slate-50 text-slate-600 ring-slate-200",
    icon: faCircleInfo, label: s || "-", border: "border-l-slate-300",
    headerBg: "bg-slate-500", decoration: "decoration-slate-400/50"
  };
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

  const statusConfig = getStatusConfig(String(data?.status ?? status));

  const statusOptions = useMemo(
    () => {
      if (isStatusLocked) {
        return [
          {
            value: persistedStatus || "pending",
            label: statusConfig.label,
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
    [isStatusLocked, persistedStatus, statusConfig.label],
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

      // Validation: Wajib isi tanggal pembayaran jika status Lunas
      if (desiredStatus === "paid" && !paidAtLocal) {
        toast.error("Wajib mengisi waktu pembayaran untuk status Lunas.", { title: "Validasi Gagal" });
        setSaving(false);
        return;
      }

      const paidAtIso = toIsoFromLocalInput(paidAtLocal);

      await http.patch(`/admin/donations/${donationId}/status`, {
        status: desiredStatus,
        paid_at: paidAtIso,
        notes: notes.trim() || null,
      });
      toast.success("Status donasi berhasil diperbarui.", { title: "Berhasil" });
      window.dispatchEvent(new Event("refresh-badges"));
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
      window.dispatchEvent(new Event("refresh-badges"));
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
    <div className="mx-auto w-full max-w-7xl animate-fade-in space-y-8 pb-10">
      {/* Hero Header */}
      <div className={`relative overflow-hidden rounded-[32px] ${statusConfig.headerBg} shadow-xl transition-colors duration-500`}>
        <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10" />
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-white/10 blur-3xl filter" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-white/10 blur-3xl filter" />

        <div className="relative z-10 p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <button
                onClick={() => navigate("/admin/donations")}
                className="group inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-sm transition hover:bg-white/20"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="transition group-hover:-translate-x-1" />
                Kembali ke List
              </button>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-heading text-3xl font-bold text-white md:text-5xl">
                    {loading ? "Memuat..." : String(data?.donation_code ?? `#${donationId}`)}
                  </h1>
                  {!loading && (
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider shadow-sm ring-1 ring-inset ${statusConfig.bg}`}>
                      <FontAwesomeIcon icon={statusConfig.icon} />
                      {statusConfig.label}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-lg text-white/90 font-medium max-w-2xl">
                  Donasi dari <span className="font-bold text-white">{data?.donor_name || "Hamba Allah"}</span> untuk program <span className={`font-bold text-white underline underline-offset-4 ${statusConfig.decoration}`}>{data?.program?.title || "Umum"}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 flex items-start gap-4 shadow-sm">
          <FontAwesomeIcon icon={faExclamationCircle} className="mt-1 text-xl text-rose-500" />
          <div>
            <h3 className="font-bold text-rose-700">Terjadi Kesalahan</h3>
            <p className="text-sm text-rose-600 mt-1">{error}</p>
          </div>
        </div>
      ) : null}

      {!loading && (
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-8">
            {/* Summary Card */}
            <div className={`overflow-hidden rounded-[24px] bg-white shadow-xl shadow-slate-200/50 border-l-8 ${statusConfig.border}`}>
              <div className="p-8">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
                  <FontAwesomeIcon icon={faMoneyBillWave} />
                  Rincian Pembayaran
                </h2>

                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between border-b border-slate-100 pb-8 mb-8">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1">Total Donasi</p>
                    <div className="font-heading text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
                      {formatCurrency(data?.amount)}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Metode</p>
                      <p className="font-bold text-slate-800">{data?.payment_method || "Manual Transfer"}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Sumber</p>
                      <p className="font-bold text-slate-800 capitalize">{data?.payment_source || "Manual"}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs font-bold text-slate-400 mb-1">Dibuat Pada</p>
                    <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                      <FontAwesomeIcon icon={faCalendarDays} className="text-emerald-500" />
                      {formatDateTime(data?.created_at)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 mb-1">Dibayar Pada</p>
                    <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                      <FontAwesomeIcon icon={faCheckCircle} className={data?.paid_at ? "text-emerald-500" : "text-slate-300"} />
                      {formatDateTime(data?.paid_at)}
                    </div>
                  </div>
                  <div className="col-span-2 lg:col-span-2">
                    <p className="text-xs font-bold text-slate-400 mb-1">Catatan Internal</p>
                    <p className="text-sm text-slate-600 italic">
                      {data?.notes || "Tidak ada catatan."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Donor Info */}
            <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
                <FontAwesomeIcon icon={faUser} className="text-emerald-500" />
                Informasi Donatur
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nama Lengkap</p>
                    <p className="font-bold text-slate-900 mt-1">{String(data?.donor_name ?? "Anonim")}</p>
                    <p className="text-xs font-medium text-slate-400 mt-1">{data?.is_anonymous ? "(Donasi sebagai Anonim)" : "(Publik)"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Alamat Email</p>
                    <p className="font-bold text-slate-900 mt-1">{data?.donor_email || "-"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                    <FontAwesomeIcon icon={faPhone} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nomor Telepon</p>
                    <p className="font-bold text-slate-900 mt-1">{data?.donor_phone || "-"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Proof of Payment */}
            {proofUrl && (
              <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
                  <FontAwesomeIcon icon={faReceipt} className="text-emerald-500" />
                  Bukti Pembayaran Manual
                </h2>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2">
                  <img
                    src={proofUrl}
                    alt="Bukti Transfer"
                    className="w-full h-auto object-contain max-h-[500px] rounded-xl"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-8 space-y-6">
              {/* Control Card */}
              <div className="rounded-[24px] border border-indigo-100 bg-white p-6 shadow-xl shadow-indigo-50/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <FontAwesomeIcon icon={faFloppyDisk} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Perbarui Status</h3>
                    <p className="text-xs text-slate-500">Verifikasi manual donasi ini</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block">
                    <span className="text-xs font-bold text-slate-500 uppercase">Status Terkini</span>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
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
                    <span className="text-xs font-bold text-slate-500 uppercase">Waktu Pembayaran (Manual)</span>
                    <input
                      type="datetime-local"
                      value={paidAtLocal}
                      onChange={(e) => setPaidAtLocal(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
                      disabled={!canSave}
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-bold text-slate-500 uppercase">Catatan Tambahan</span>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
                      disabled={!canSave}
                      placeholder="Contoh: Transfer valid via BCA..."
                    />
                  </label>

                  {isMidtrans ? (
                    <div className="rounded-xl bg-blue-50 p-4 border border-blue-100 text-xs font-medium text-blue-700 flex items-start gap-2">
                      <FontAwesomeIcon icon={faCircleInfo} className="mt-0.5" />
                      Status ini dikelola otomatis oleh Midtrans payment gateway dan tidak dapat diubah manual.
                    </div>
                  ) : (
                    <button
                      onClick={() => void onSaveStatus()}
                      disabled={!canSave}
                      className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      Simpan Perubahan
                    </button>
                  )}
                </div>
              </div>

              {/* Delete Zone */}
              {isPendingStatus && (
                <div className="rounded-[24px] border border-rose-100 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                      <FontAwesomeIcon icon={faTrash} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Area Berbahaya</h3>
                    </div>
                  </div>

                  {!confirmDelete ? (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      disabled={!canDelete}
                      className="w-full rounded-xl border-2 border-rose-100 bg-white py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50 hover:border-rose-200"
                    >
                      Hapus Donasi Ini
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-rose-600 text-center">Yakin ingin menghapus data permanen?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="flex-1 rounded-lg bg-slate-100 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200"
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => void onDelete()}
                          disabled={deleting}
                          className="flex-1 rounded-lg bg-rose-600 py-2 text-xs font-bold text-white hover:bg-rose-700"
                        >
                          {deleting ? "Menghapus..." : "Ya, Hapus"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDonationShowPage;


