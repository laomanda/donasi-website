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
import http from "../../../../lib/http";
import { useToast } from "../../../../components/ui/ToastProvider";

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



const getHeaderColor = (status: ConsultationStatus) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "baru") return "bg-amber-600";
  if (s === "dibalas") return "bg-emerald-700";
  if (s === "ditutup") return "bg-slate-700";
  return "bg-slate-700";
};

const getStatusBorder = (status: ConsultationStatus) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "baru") return "border-l-amber-500 text-amber-700 bg-amber-50/50";
  if (s === "dibalas") return "border-l-emerald-500 text-emerald-700 bg-emerald-50/50";
  if (s === "ditutup") return "border-l-slate-500 text-slate-700 bg-slate-50/50";
  return "border-l-slate-500 text-slate-700 bg-slate-50/50";
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
  const canSave = canLoad && !loading && !saving && !deleting && !isLockedStatus ;

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
      window.dispatchEvent(new Event("refresh-badges"));
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
      window.dispatchEvent(new Event("refresh-badges"));
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
                  Detail Konsultasi
                </span>
                <h1 className="mt-3 font-heading text-2xl font-bold text-white sm:text-3xl md:text-5xl text-shadow-sm">
                  {loading ? "Memuat..." : data?.topic ?? `#${consultationId}`}
                </h1>
                <p className="mt-2 max-w-2xl text-sm font-medium text-white/90 sm:text-lg">
                  ID: {data?.id ?? "-"} • Monitoring detail dan rekam tindak lanjut aspirasi.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/admin/consultations")}
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
          <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                  <FontAwesomeIcon icon={faCircleInfo} className="text-xl" />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold text-slate-900">Informasi Pemohon</h2>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Data Kontak & Identitas</p>
                </div>
              </div>
              <div className={`inline-flex items-center gap-2 rounded-full border-l-[4px] px-4 py-1.5 text-xs font-bold uppercase tracking-wider shadow-sm ${getStatusBorder(String(data?.status ?? status))}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                {getStatusLabel(String(data?.status ?? status))}
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-slate-50">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Nama Lengkap</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{data?.name ?? "-"}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-slate-50">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Topik Utama</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{data?.topic ?? "-"}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4 transition hover:bg-slate-50">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Kontak WhatsApp</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{data?.phone ? String(data.phone) : "-"}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4 transition hover:bg-slate-50">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Email Aktif</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{data?.email ? String(data.email) : "-"}</p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Isi Konsultasi</h3>
                <div className="relative rounded-2xl border border-slate-100 bg-slate-50/30 p-6 leading-relaxed text-slate-700 shadow-inner group">
                  <div className="absolute -left-1 top-4 h-6 w-1 rounded-full bg-slate-200 transition-colors group-hover:bg-brandGreen" />
                  <p className="text-sm italic">"{data?.message ?? "-"}"</p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-t border-slate-50 pt-6">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  <span>Submisi: {data?.created_at ? new Date(data.created_at).toLocaleString('id-ID') : '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  <span>Update: {data?.updated_at ? new Date(data.updated_at).toLocaleString('id-ID') : '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-700/20">
                <FontAwesomeIcon icon={faHeadset} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Panel Kontrol</p>
                <h2 className="mt-1 font-heading text-lg font-bold text-slate-900">Status Konsultasi</h2>
              </div>
            </div>

            <div className="mt-8 grid gap-5">
              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status Saat Ini</label>
                <div className="relative group">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50"
                    disabled={!canSave || isLockedStatus}
                  >
                    <option value="baru">Baru</option>
                    <option value="dibalas">Dibalas</option>
                    <option value="ditutup">Ditutup</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Catatan Internal</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder="Catatan tindak lanjut..."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50"
                  disabled={!canSave}
                />
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Balasan WhatsApp</label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={4}
                  placeholder="Tulis balasan..."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50"
                  disabled={!canSave || isLockedStatus}
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
                Simpan & Balas
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
              <div className="flex gap-3 text-blue-700">
                <FontAwesomeIcon icon={faCircleInfo} className="mt-0.5" />
                <p className="text-xs font-medium leading-relaxed">
                  Status <strong>Dibalas</strong> atau <strong>Ditutup</strong> akan mengunci riwayat konsultasi ini.
                </p>
              </div>
            </div>
          </div>

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
                Hapus Konsultasi
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
        </aside>
      </div>
    </div>
  );
}

export default AdminConsultationShowPage;

