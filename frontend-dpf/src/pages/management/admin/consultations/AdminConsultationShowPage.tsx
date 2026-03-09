import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faTrashAlt,
  faHeadset,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import http from "@/lib/http";
import { useToast } from "@/components/ui/ToastProvider";
import type { Consultation, ConsultationStatus } from "@/types/consultation";
import AdminConsultationDetailInfo from "@/components/management/admin/consultations/AdminConsultationDetailInfo";
import AdminConsultationStatusControl from "@/components/management/admin/consultations/AdminConsultationStatusControl";
import AdminDeleteConfirmationModal from "@/components/management/admin/AdminDeleteConfirmationModal";

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

const getStatusBorder = (status: ConsultationStatus) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "baru") return "border-l-amber-500 text-amber-600 bg-amber-50/50";
  if (s === "dibalas") return "border-l-blue-600 text-blue-700 bg-blue-50/50";
  if (s === "ditutup") return "border-l-emerald-600 text-emerald-700 bg-emerald-50/50";
  return "border-l-slate-400 text-slate-600 bg-slate-50";
};

const getStatusLabel = (status: ConsultationStatus) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "baru") return "Baru";
  if (s === "dibalas") return "Dibalas";
  if (s === "ditutup") return "Ditutup";
  return String(status || "-");
};

const getHeroStyles = (status: ConsultationStatus) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "baru") return "bg-amber-600 from-amber-600 to-amber-700";
  if (s === "dibalas") return "bg-blue-600 from-blue-600 to-blue-700";
  if (s === "ditutup") return "bg-emerald-600 from-emerald-600 to-emerald-700";
  return "bg-slate-600 from-slate-600 to-slate-700";
};

export function AdminConsultationShowPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [data, setData] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form State
  const [status, setStatus] = useState<ConsultationStatus>("baru");
  const [adminNotes, setAdminNotes] = useState("");

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await http.get<Consultation>(`/admin/consultations/${id}`);
      setData(res.data);
      setStatus(res.data.status || "baru");
      setAdminNotes(res.data.admin_notes || "");
    } catch {
      toast.error("Gagal memuat detail konsultasi.");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSave = async () => {
    setIsSaving(true);
    try {
      await http.patch(`/admin/consultations/${id}`, {
        status,
        admin_notes: adminNotes,
      });
      toast.success("Perubahan berhasil disimpan.");
      void fetchDetail();
      window.dispatchEvent(new Event("refresh-badges"));
    } catch {
      toast.error("Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      await http.delete(`/admin/consultations/${id}`);
      toast.success("Konsultasi berhasil dihapus.");
      setIsDeleteModalOpen(false);
      navigate(-1);
      window.dispatchEvent(new Event("refresh-badges"));
    } catch {
      toast.error("Gagal menghapus data.");
    } finally {
      setIsDeleting(false);
    }
  };

  const sendWa = () => {
    if (!data?.phone) return;
    const phone = data.phone.replace(/\D/g, "");
    const cleanPhone = phone.startsWith("0") ? `62${phone.slice(1)}` : phone;
    const msg = encodeURIComponent(
      `Halo Bapak/Ibu ${data.name}, perkenalkan kami dari DPF (Dompet Peduli Fauziah). ` +
      `Terkait pertanyaan Anda mengenai "${data.topic}", berikut adalah tanggapan kami:`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
  };

  const isLocked = data?.status === "ditutup";
  const canSave = !loading && !isSaving;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-10">
      {/* Modal Confirmation */}
      <AdminDeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={onDelete}
        loading={isDeleting}
        title="Hapus Konsultasi"
        itemName={data?.name ? `Konsultasi dari ${data.name}` : "Data Konsultasi"}
        description="Apakah Anda yakin ingin menghapus data konsultasi ini? Seluruh riwayat percakapan dan catatan akan hilang."
      />

      {/* PREMIUM HERO HEADER */}
      <div className={`relative overflow-hidden rounded-[40px] shadow-2xl transition-all duration-500 bg-gradient-to-br ${getHeroStyles(data?.status || "baru")}`}>
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10 mix-blend-overlay" />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-black/10 blur-3xl" />

        <div className="relative z-10 p-8 md:p-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="space-y-6">
              <button
                onClick={() => navigate(-1)}
                className="group inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md transition hover:bg-white hover:text-slate-900"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="transition group-hover:-translate-x-1" />
                Kembali
              </button>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                    <FontAwesomeIcon icon={faHeadset} className="text-xl text-white" />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-[0.3em] text-white/80">Detail Konsultasi</span>
                </div>
                <h1 className="font-heading text-4xl font-bold text-white md:text-5xl">
                  {data?.name || "Memuat..."}
                </h1>
                <p className="max-w-xl text-lg font-medium text-white/70">
                  {data?.topic ? `Topik: ${data.topic}` : "Mengambil informasi topik konsultasi..."}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={sendWa}
                className="group flex items-center justify-center gap-3 rounded-3xl bg-white px-8 py-4 text-sm font-bold text-emerald-700 shadow-xl transition hover:-translate-y-1 hover:bg-emerald-50 active:translate-y-0"
              >
                <FontAwesomeIcon icon={faWhatsapp} className="text-xl" />
                Hubungi via WhatsApp
              </button>
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-black/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white/80 backdrop-blur-sm">
                ID: {id?.toString().padStart(6, "0")} • {formatDateTime(data?.created_at)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <AdminConsultationDetailInfo
            data={data}
            loading={loading}
            getStatusBorder={getStatusBorder}
            getStatusLabel={getStatusLabel}
            formatDateTime={formatDateTime}
          />

          {/* DANGER ZONE (Relocated below detail) */}
          <div className="overflow-hidden rounded-[32px] border border-rose-100 bg-rose-50/30 p-8 shadow-sm transition hover:shadow-md">
            <div className="flex items-center gap-4 text-rose-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100">
                <FontAwesomeIcon icon={faExclamationTriangle} />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold">Area Berbahaya</h3>
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Manajemen Data</p>
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <p className="text-xs font-medium leading-relaxed text-rose-700/70">
                Menghapus data konsultasi bersifat permanen dan tidak dapat dibatalkan. Pastikan Anda telah menyelesaikan tindak lanjut sebelum menghapus.
              </p>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={isDeleting}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-rose-600 py-4 text-sm font-bold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 hover:shadow-rose-600/30 active:scale-[0.98] disabled:opacity-50 sm:w-auto sm:px-8"
              >
                <FontAwesomeIcon icon={faTrashAlt} />
                Hapus Data Konsultasi
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-8">
            <AdminConsultationStatusControl
              status={status}
              setStatus={setStatus}
              adminNotes={adminNotes}
              setAdminNotes={setAdminNotes}
              isSaving={isSaving}
              onSave={onSave}
              isLocked={isLocked}
              canSave={canSave}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminConsultationShowPage;
