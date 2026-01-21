import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCircleInfo,
  faFloppyDisk,
  faTruckRampBox,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import http from "../../../lib/http";
import { useToast } from "../../../components/ui/ToastProvider";

type PickupStatus = "baru" | "dijadwalkan" | "selesai" | "dibatalkan" | string;

type PickupRequest = {
  id: number;
  donor_name: string;
  donor_phone: string;
  address_full: string;
  city: string;
  district: string;
  wakaf_type: string;
  estimation?: string | null;
  preferred_time?: string | null;
  status?: PickupStatus | null;
  assigned_officer?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const formatDateTime = (value?: string | null) => {
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

const normalizePhone = (value?: string | null) => {
  if (!value) return null;
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;
  return digits;
};

const getStatusTone = (status: PickupStatus) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "baru") return "bg-amber-500 text-white shadow-md shadow-amber-500/20";
  if (s === "dijadwalkan") return "bg-blue-600 text-white shadow-md shadow-blue-600/20";
  if (s === "selesai") return "bg-emerald-600 text-white shadow-md shadow-emerald-600/20";
  if (s === "dibatalkan") return "bg-red-600 text-white shadow-md shadow-red-600/20";
  return "bg-slate-600 text-white shadow-md shadow-slate-600/20";
};

const getHeaderColor = (status: PickupStatus) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "baru") return "bg-amber-500";
  if (s === "dijadwalkan") return "bg-blue-600";
  if (s === "selesai") return "bg-emerald-600";
  if (s === "dibatalkan") return "bg-red-600";
  return "bg-slate-600";
};

const getStatusLabel = (status: PickupStatus) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "baru") return "Baru";
  if (s === "dijadwalkan") return "Dijadwalkan";
  if (s === "selesai") return "Selesai";
  if (s === "dibatalkan") return "Dibatalkan";
  return String(status || "-");
};

export function AdminPickupRequestShowPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams<{ id: string }>();
  const pickupId = useMemo(() => Number(id), [id]);

  const [data, setData] = useState<PickupRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<PickupStatus>("baru");
  const [assignedOfficer, setAssignedOfficer] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const persistedStatus = String(data?.status ?? status).trim().toLowerCase();
  const isLockedStatus = persistedStatus === "selesai" || persistedStatus === "dibatalkan";
  const limitToComplete = persistedStatus === "dijadwalkan";

  const canLoad = Number.isFinite(pickupId) && pickupId > 0;
  const isEditableStatus = persistedStatus === "baru";
  const canSave = canLoad && !loading && !saving && !deleting && !isLockedStatus;
  const canEditDetails = canSave && isEditableStatus;
  const statusOptions = useMemo(
    () => {
      if (limitToComplete) {
        return [
          { value: "dijadwalkan", label: "Dijadwalkan", disabled: true },
          { value: "selesai", label: "Selesai", disabled: false },
        ];
      }
      if (isLockedStatus) {
        return [
          {
            value: persistedStatus || "selesai",
            label: getStatusLabel(persistedStatus || "selesai"),
            disabled: true,
          },
        ];
      }
      return [
        { value: "baru", label: "Baru", disabled: false },
        { value: "dijadwalkan", label: "Dijadwalkan", disabled: false },
        { value: "selesai", label: "Selesai", disabled: false },
        { value: "dibatalkan", label: "Dibatalkan", disabled: false },
      ];
    },
    [isLockedStatus, limitToComplete, persistedStatus],
  );

  useEffect(() => {
    if (!canLoad) {
      setError("ID jemput wakaf tidak valid.");
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);
    http
      .get<PickupRequest>(`/admin/pickup-requests/${pickupId}`)
      .then((res) => {
        if (!active) return;
        setData(res.data);
        setStatus(String(res.data?.status ?? "baru"));
        setAssignedOfficer(String(res.data?.assigned_officer ?? ""));
        setNotes(String(res.data?.notes ?? ""));
      })
      .catch(() => {
        if (!active) return;
        setError("Gagal memuat detail jemput wakaf.");
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [canLoad, pickupId]);

  const onSave = async () => {
    if (!canLoad) return;
    const nextStatus = String(status ?? "").trim().toLowerCase();
    const prevStatus = String(data?.status ?? "").trim().toLowerCase();
    setSaving(true);
    try {
      await http.patch(`/admin/pickup-requests/${pickupId}/status`, {
        status: String(status ?? "").trim(),
        assigned_officer: assignedOfficer.trim() || null,
        notes: notes.trim() || null,
      });
      toast.success("Status jemput wakaf diperbarui.", { title: "Berhasil" });
      window.dispatchEvent(new Event("refresh-badges"));
      if (nextStatus === "dijadwalkan" && prevStatus !== "dijadwalkan") {
        const phone = normalizePhone(data?.donor_phone);
        if (phone) {
          const message =
            "Informasi, DPF Siap Menjemput Wakaf Anda Silahkan Tunggu Di Alamat Yang Sudah Disesuaikan Anda, Terimakasih";
          const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
          window.open(url, "_blank", "noopener,noreferrer");
        } else {
          toast.error("Nomor telepon tidak tersedia untuk WhatsApp.", { title: "Gagal kirim" });
        }
      }
      navigate("/admin/pickup-requests", { replace: true });
    } catch {
      toast.error("Gagal memperbarui status jemput wakaf.", { title: "Gagal" });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!canLoad) return;
    setDeleting(true);
    try {
      await http.delete(`/admin/pickup-requests/${pickupId}`);
      toast.success("Permintaan jemput dihapus.", { title: "Berhasil" });
      window.dispatchEvent(new Event("refresh-badges"));
      navigate("/admin/pickup-requests", { replace: true });
    } catch {
      toast.error("Gagal menghapus permintaan jemput.", { title: "Gagal" });
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Hero Header */}
      <div className={`relative overflow-hidden rounded-[32px] ${getHeaderColor(String(data?.status ?? status))} shadow-xl transition-colors duration-500`}>
        <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10" />
        <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white ring-1 ring-white/30 backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  Detail Jemput Wakaf
                </span>
                <h1 className="mt-3 font-heading text-3xl font-bold text-white md:text-5xl text-shadow-sm">
                  {loading ? "Memuat..." : data?.donor_name ?? `#${pickupId}`}
                </h1>
                <p className="mt-2 max-w-2xl text-lg font-medium text-white/90">
                  ID: {data?.id ?? "-"} • {data ? `${data.city}, ${data.district}` : "Lokasi belum ditentukan"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/admin/pickup-requests")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Kembali
            </button>
          </div>
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
                <h2 className="font-heading text-xl font-semibold text-slate-900">Detail pemohon</h2>
                <p className="text-sm font-medium text-slate-600">Alamat, jenis wakaf, dan jadwal.</p>
              </div>
              <span
                className={[
                  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm",
                  getStatusTone(String(data?.status ?? status)),
                ].join(" ")}
              >
                {getStatusLabel(String(data?.status ?? status))}
              </span>
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <dt className="text-xs font-semibold text-slate-500">Nama</dt>
                <dd className="mt-2 text-sm font-bold text-slate-900">{data?.donor_name ?? "-"}</dd>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <dt className="text-xs font-semibold text-slate-500">Telepon</dt>
                <dd className="mt-2 text-sm font-bold text-slate-900">{data?.donor_phone ?? "-"}</dd>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <dt className="text-xs font-semibold text-slate-500">Kota</dt>
                <dd className="mt-2 text-sm font-bold text-slate-900">{data?.city ?? "-"}</dd>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <dt className="text-xs font-semibold text-slate-500">Kecamatan</dt>
                <dd className="mt-2 text-sm font-bold text-slate-900">{data?.district ?? "-"}</dd>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-2">
                <dt className="text-xs font-semibold text-slate-500">Alamat lengkap</dt>
                <dd className="mt-2 text-sm font-bold text-slate-900">{data?.address_full ?? "-"}</dd>
              </div>
            </dl>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <dt className="text-xs font-semibold text-slate-500">Jenis wakaf</dt>
                <dd className="mt-2 text-sm font-bold text-slate-900">{data?.wakaf_type ?? "-"}</dd>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <dt className="text-xs font-semibold text-slate-500">Estimasi</dt>
                <dd className="mt-2 text-sm font-bold text-slate-900">{data?.estimation ?? "-"}</dd>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-2">
                <dt className="text-xs font-semibold text-slate-500">Waktu preferensi</dt>
                <dd className="mt-2 text-sm font-bold text-slate-900">{data?.preferred_time ?? "-"}</dd>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-xs font-semibold text-slate-600">
              Dibuat: {formatDateTime(data?.created_at)} - Diperbarui: {formatDateTime(data?.updated_at)}
            </div>
          </div>
        </div>

        <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-[28px] border border-primary-100 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
                <FontAwesomeIcon icon={faTruckRampBox} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Kontrol</p>
                <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">Status & penugasan</h2>
                <p className="mt-2 text-sm text-slate-600">Perbarui jadwal dan petugas.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                  disabled={!canSave || isLockedStatus}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value} disabled={option.disabled}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Petugas</span>
                <input
                  value={assignedOfficer}
                  onChange={(e) => setAssignedOfficer(e.target.value)}
                  placeholder="Nama petugas (opsional)"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                  disabled={!canEditDetails}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Catatan</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Catatan admin (opsional)."
                  className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                  disabled={!canEditDetails}
                />
              </label>

              <button
                type="button"
                onClick={() => void onSave()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition hover:bg-emerald-700 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                disabled={!canSave}
              >
                <FontAwesomeIcon icon={faFloppyDisk} />
                Simpan perubahan
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-semibold text-slate-600">
              <span className="inline-flex items-start gap-2">
                <FontAwesomeIcon icon={faCircleInfo} className="mt-0.5 text-slate-500" />
                Status selesai akan menutup permintaan jemput.
              </span>
            </div>
          </div>

          {isEditableStatus ? (
            <div className="rounded-[28px] border border-red-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/20">
                  <FontAwesomeIcon icon={faTrash} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Aksi</p>
                  <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">Hapus permintaan</h2>
                  <p className="mt-2 text-sm text-slate-600">Gunakan jika data tidak valid.</p>
                </div>
              </div>

              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                  disabled={!canSave}
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

export default AdminPickupRequestShowPage;


