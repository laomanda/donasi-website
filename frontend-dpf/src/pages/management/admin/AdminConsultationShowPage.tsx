import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCircleInfo,
  faFloppyDisk,
  faHeadset,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import http from "../../../lib/http";
import { useToast } from "../../../components/ui/ToastProvider";

type ConsultationStatus = "baru" | "dibalas" | "ditutup" | string;

type Consultation = {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  topic: string;
  message: string;
  status?: ConsultationStatus | null;
  admin_notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const normalizePhone = (value?: string | null) => {
  if (!value) return null;
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;
  return digits;
};

const getStatusTone = (status: ConsultationStatus) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "baru") return "bg-amber-50 text-amber-700 ring-amber-100";
  if (s === "dibalas") return "bg-brandGreen-50 text-brandGreen-700 ring-brandGreen-100";
  if (s === "ditutup") return "bg-slate-100 text-slate-700 ring-slate-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
};

const getStatusLabel = (status: ConsultationStatus) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "baru") return "Baru";
  if (s === "dibalas") return "Dibalas";
  if (s === "ditutup") return "Ditutup";
  return String(status || "-");
};

export function AdminConsultationShowPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams<{ id: string }>();
  const consultationId = useMemo(() => Number(id), [id]);

  const [data, setData] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<ConsultationStatus>("baru");
  const [adminNotes, setAdminNotes] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canLoad = Number.isFinite(consultationId) && consultationId > 0;
  const persistedStatus = String(data?.status ?? status).trim().toLowerCase();
  const isLockedStatus = persistedStatus === "dibalas" || persistedStatus === "ditutup";
  const canSave = canLoad && !loading && !saving && !deleting && !isLockedStatus;

  useEffect(() => {
    if (!canLoad) {
      setError("ID konsultasi tidak valid.");
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);
    http
      .get<Consultation>(`/admin/consultations/${consultationId}`)
      .then((res) => {
        if (!active) return;
        setData(res.data);
        setStatus(String(res.data?.status ?? "baru"));
        setAdminNotes(String(res.data?.admin_notes ?? ""));
        setReplyMessage("");
      })
      .catch(() => {
        if (!active) return;
        setError("Gagal memuat detail konsultasi.");
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [canLoad, consultationId]);

  const onSave = async () => {
    if (!canLoad) return;
    const nextStatus = String(status ?? "").trim().toLowerCase();
    const prevStatus = String(data?.status ?? "").trim().toLowerCase();
    setSaving(true);
    try {
      await http.patch(`/admin/consultations/${consultationId}/status`, {
        status: String(status ?? "").trim(),
        admin_notes: adminNotes.trim() || null,
      });
      toast.success("Status konsultasi diperbarui.", { title: "Berhasil" });
      if (nextStatus === "dibalas" && prevStatus !== "dibalas") {
        const phone = normalizePhone(data?.phone);
        const message = replyMessage.trim();
        if (!phone) {
          toast.error("Nomor telepon tidak tersedia untuk WhatsApp.", { title: "Gagal kirim" });
        } else if (!message) {
          toast.error("Pesan balasan masih kosong.", { title: "Gagal kirim" });
        } else {
          const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
          window.open(url, "_blank", "noopener,noreferrer");
        }
      }
      navigate(0);
    } catch {
      toast.error("Gagal memperbarui status konsultasi.", { title: "Gagal" });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!canLoad) return;
    setDeleting(true);
    try {
      await http.delete(`/admin/consultations/${consultationId}`);
      toast.success("Konsultasi berhasil dihapus.", { title: "Berhasil" });
      navigate("/admin/consultations", { replace: true });
    } catch {
      toast.error("Gagal menghapus konsultasi.", { title: "Gagal" });
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
              Detail konsultasi
            </span>
            <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">
              {loading ? "Memuat..." : data?.topic ?? `#${consultationId}`}
            </h1>
            <p className="mt-2 text-sm text-slate-600">Kelola status dan catatan tindak lanjut.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/consultations")}
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
                <h2 className="font-heading text-xl font-semibold text-slate-900">Informasi pemohon</h2>
                <p className="text-sm font-medium text-slate-600">Data kontak dan detail permintaan konsultasi.</p>
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
                <dt className="text-xs font-semibold text-slate-500">Nama</dt>
                <dd className="mt-2 text-sm font-bold text-slate-900">{data?.name ?? "-"}</dd>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <dt className="text-xs font-semibold text-slate-500">Topik</dt>
                <dd className="mt-2 text-sm font-bold text-slate-900">{data?.topic ?? "-"}</dd>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <dt className="text-xs font-semibold text-slate-500">Telepon</dt>
                <dd className="mt-2 text-sm font-bold text-slate-900">{data?.phone ? String(data.phone) : "-"}</dd>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <dt className="text-xs font-semibold text-slate-500">Email</dt>
                <dd className="mt-2 text-sm font-bold text-slate-900">{data?.email ? String(data.email) : "-"}</dd>
              </div>
            </dl>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Pesan</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">{data?.message ?? "-"}</p>
            </div>
          </div>
        </div>

        <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-[28px] border border-primary-100 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 ring-1 ring-primary-100">
                <FontAwesomeIcon icon={faHeadset} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Kontrol</p>
                <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">Status konsultasi</h2>
                <p className="mt-2 text-sm text-slate-600">Perbarui status dan simpan catatan admin.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={!canSave || isLockedStatus}
                >
                  <option value="baru">Baru</option>
                  <option value="dibalas">Dibalas</option>
                  <option value="ditutup">Ditutup</option>
                </select>
              </label>

              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Catatan admin</span>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  placeholder="Catatan tindak lanjut (opsional)."
                  className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={!canSave}
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Balasan WhatsApp
                </span>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={4}
                  placeholder="Tulis balasan yang akan dikirim ke WhatsApp pemohon."
                  className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={!canSave || isLockedStatus}
                />
              </label>

              <button
                type="button"
                onClick={() => void onSave()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brandGreen-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={!canSave}
              >
                <FontAwesomeIcon icon={faFloppyDisk} />
                Simpan & Balas Konsultasi
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-semibold text-slate-600">
              <span className="inline-flex items-start gap-2">
                <FontAwesomeIcon icon={faCircleInfo} className="mt-0.5 text-slate-500" />
                Catatan internal hanya terlihat oleh admin.
              </span>
            </div>
          </div>

          <div className="rounded-[28px] border border-red-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-700 ring-1 ring-red-100">
                <FontAwesomeIcon icon={faTrash} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Aksi</p>
                <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">Hapus konsultasi</h2>
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
        </aside>
      </div>
    </div>
  );
}

export default AdminConsultationShowPage;

