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
import http from "../../../../lib/http";
import { useToast } from "../../../../components/ui/ToastProvider";

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



const getHeaderColor = (status: PickupStatus) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "baru") return "bg-amber-600";
  if (s === "dijadwalkan") return "bg-blue-700";
  if (s === "selesai") return "bg-emerald-700";
  if (s === "dibatalkan") return "bg-rose-700";
  return "bg-slate-700";
};

const getStatusBorder = (status: PickupStatus) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "baru") return "border-l-amber-500 text-amber-700 bg-amber-50/50";
  if (s === "dijadwalkan") return "border-l-blue-500 text-blue-700 bg-blue-50/50";
  if (s === "selesai") return "border-l-emerald-500 text-emerald-700 bg-emerald-50/50";
  if (s === "dibatalkan") return "border-l-rose-500 text-rose-700 bg-rose-50/50";
  return "border-l-slate-500 text-slate-700 bg-slate-50/50";
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
  const canSave = canLoad && !loading && !saving && !deleting && !isLockedStatus ;
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
      <div className={`relative overflow-hidden rounded-[32px] ${getHeaderColor(String(data?.status ?? status))} shadow-lg transition-all duration-500`}>
        <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10" />
        <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 p-6 sm:p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white ring-1 ring-white/30 backdrop-blur-sm sm:text-[11px]">
                  <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  Detail Jemput Wakaf
                </span>
                <h1 className="mt-3 font-heading text-2xl font-bold text-white sm:text-3xl md:text-5xl text-shadow-sm">
                  {loading ? "Memuat..." : data?.donor_name ?? `#${pickupId}`}
                </h1>
                <p className="mt-2 max-w-2xl text-sm font-medium text-white/90 sm:text-lg">
                  ID: {data?.id ?? "-"} • {data ? `${data.city}, ${data.district}` : "Lokasi belum ditentukan"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/admin/pickup-requests")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
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
          <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white p-0 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                  <FontAwesomeIcon icon={faCircleInfo} className="text-xl" />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold text-slate-900">Detail Pemohon</h2>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Informasi Pickup & Alamat</p>
                </div>
              </div>
              <div className={`inline-flex items-center gap-2 rounded-full border-l-[4px] px-4 py-1.5 text-xs font-bold uppercase tracking-wider shadow-sm ${getStatusBorder(String(data?.status ?? status))}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                {getStatusLabel(String(data?.status ?? status))}
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Data Personal</h3>
                  <div className="grid gap-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-slate-50">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Nama Lengkap</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{data?.donor_name ?? "-"}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-slate-50">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Nomor Telepon</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{data?.donor_phone ?? "-"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Jadwal & Wakaf</h3>
                  <div className="grid gap-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-slate-50">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Jenis Wakaf</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{data?.wakaf_type ?? "-"}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-slate-50">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Estimasi Jumlah</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{data?.estimation ?? "-"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 sm:col-span-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Alamat Penjemputan</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 transition hover:bg-slate-50">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Kota / Kabupaten</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{data?.city ?? "-"}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 transition hover:bg-slate-50">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Kecamatan</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{data?.district ?? "-"}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:col-span-2 transition hover:bg-slate-50">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Alamat Lengkap</p>
                      <p className="mt-1 text-sm font-bold text-slate-900 leading-relaxed">{data?.address_full ?? "-"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 sm:col-span-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Informasi Tambahan</h3>
                  <div className="grid gap-3">
                    <div className="rounded-2xl border border-slate-100 bg-indigo-50/30 p-4">
                      <p className="text-[10px] font-bold uppercase text-indigo-400">Waktu Preferensi Donor</p>
                      <p className="mt-1 text-sm font-bold text-indigo-900">{data?.preferred_time ?? "-"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-t border-slate-50 pt-6">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  <span>Dibuat: {formatDateTime(data?.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  <span>Diperbarui: {formatDateTime(data?.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-700/20">
                <FontAwesomeIcon icon={faTruckRampBox} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Panel Kontrol</p>
                <h2 className="mt-1 font-heading text-lg font-bold text-slate-900">Status & Petugas</h2>
              </div>
            </div>

            <div className="mt-8 grid gap-5">
              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status Permintaan</label>
                <div className="relative group">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50"
                    disabled={!canSave || isLockedStatus}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value} disabled={option.disabled}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Petugas Lapangan</label>
                <input
                  value={assignedOfficer}
                  onChange={(e) => setAssignedOfficer(e.target.value)}
                  placeholder="Nama petugas (opsional)"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50"
                  disabled={!canEditDetails}
                />
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Catatan Internal</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Catatan admin..."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50"
                  disabled={!canEditDetails}
                />
              </div>

              <button
                type="button"
                onClick={() => void onSave()}
                className="group mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition-all hover:bg-emerald-800 hover:shadow-emerald-700/30 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none disabled:translate-y-0"
                disabled={!canSave}
              >
                {saving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <FontAwesomeIcon icon={faFloppyDisk} className="transition group-hover:scale-110" />
                )}
                Simpan Perubahan
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
              <div className="flex gap-3">
                <FontAwesomeIcon icon={faCircleInfo} className="mt-0.5 text-blue-500" />
                <p className="text-xs font-medium leading-relaxed text-blue-700">
                  Status <strong>Selesai</strong> atau <strong>Dibatalkan</strong> akan mengunci data ini secara permanen.
                </p>
              </div>
            </div>
          </div>

          {isEditableStatus ? (
            <div className="rounded-[32px] border border-rose-200 bg-rose-50/30 p-6 sm:p-8">
              <div className="flex items-start gap-4 text-rose-800">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                  <FontAwesomeIcon icon={faTrash} className="text-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-heading text-lg font-bold">Hapus Data</h2>
                  <p className="mt-1 text-xs font-medium text-rose-600/80">Data akan dihapus permanen dari sistem.</p>
                </div>
              </div>

              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-5 py-3.5 text-sm font-bold text-rose-700 shadow-sm transition hover:bg-rose-100/50 disabled:opacity-50"
                  disabled={!canSave}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  Hapus Permintaan
                </button>
              ) : (
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    disabled={deleting}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => void onDelete()}
                    className="inline-flex items-center justify-center rounded-2xl bg-rose-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-rose-600/20 transition hover:bg-rose-700 disabled:bg-slate-300"
                    disabled={deleting}
                  >
                    {deleting ? "Menghapus..." : "Ya, Hapus"}
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


