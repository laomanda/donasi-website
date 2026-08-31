import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPenToSquare,
  faHandHoldingHeart,
  faCalendarDays,
  faAlignLeft,
  faImage,
  faExternalLinkAlt,
  faReceipt,
  faVault,
  faClock,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import http from "@/lib/http";
import { useToast } from "@/components/ui/ToastProvider";
import { resolveStorageUrl } from "@/lib/urls";
import type { Allocation } from "@/types/allocation";

const formatCurrency = (value: number | string | null | undefined) => {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
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

const formatDateOnly = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

export function AdminAllocationShowPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const basePath = location.pathname.startsWith("/keuangan") ? "/keuangan" : "/admin";

  const [allocation, setAllocation] = useState<Allocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);

    http
      .get<{ data: Allocation }>(`/admin/allocations/${id}`)
      .then((res) => {
        if (!active) return;
        setAllocation(res.data?.data || null);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Gagal memuat detail penyaluran.", { title: "Gagal" });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!allocation) return;
    setDeleting(true);
    try {
      await http.delete(`/admin/allocations/${allocation.id}`);
      toast.success("Penyaluran berhasil dihapus. Saldo program telah dikembalikan.", { title: "Berhasil" });
      navigate(`${basePath}/allocations`, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal menghapus penyaluran.";
      toast.error(msg, { title: "Gagal" });
      setDeleting(false);
    }
  };

  const getWhatsappUrl = () => {
    if (!allocation) return null;
    const phone = allocation.donation?.donor_phone || allocation.user?.phone;
    const name = allocation.donation?.donor_name || allocation.user?.name || "Donatur";
    const programTitle = allocation.program?.title || "Program Donasi";
    if (!phone) return null;

    let cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith("62")) {
      cleanPhone = "62" + cleanPhone;
    }

    const proofUrl = allocation.proof_path ? resolveStorageUrl(allocation.proof_path) : null;
    const text = `Assalamu'alaikum Wr. Wb.\n\nYth. Bapak/Ibu *${name}*,\n\nTerima kasih atas kebaikan dan donasi wakaf Anda pada program *${programTitle}*.\n\nBerikut kami sampaikan laporan penyaluran dana:\n- Tanggal Penyaluran: *${formatDateOnly(allocation.allocated_at || allocation.created_at)}*\n- Nominal Penyaluran: *${formatCurrency(allocation.amount)}*\n- Keperluan/Tujuan: *${allocation.description || "-"}*\n${proofUrl ? `- Bukti Foto Penyaluran: ${proofUrl}\n` : ""}\nSemoga menjadi amal jariyah yang senantiasa mengalir pahalanya. Syukron jazakumullah khairan.\n\n— *Djalaludin Pane Foundation (DPF)*`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl animate-pulse space-y-6 pb-12">
        <div className="h-28 rounded-3xl bg-slate-100" />
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="h-96 rounded-3xl bg-slate-100 lg:col-span-8" />
          <div className="h-96 rounded-3xl bg-slate-100 lg:col-span-4" />
        </div>
      </div>
    );
  }

  if (!allocation) {
    return (
      <div className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-12 text-center">
        <FontAwesomeIcon icon={faReceipt} className="text-4xl text-slate-300 mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Penyaluran Tidak Ditemukan</h2>
        <p className="mt-1 text-sm text-slate-500">Data penyaluran ini mungkin telah dihapus atau tidak tersedia.</p>
        <button
          type="button"
          onClick={() => navigate(`${basePath}/allocations`)}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-slate-800"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Kembali ke Daftar Penyaluran
        </button>
      </div>
    );
  }

  const proofUrl = allocation.proof_path ? resolveStorageUrl(allocation.proof_path) : null;
  const isProofPdf = allocation.proof_path ? allocation.proof_path.toLowerCase().endsWith(".pdf") : false;
  const waUrl = getWhatsappUrl();
  const programTitle = allocation.program?.title || "Dana Umum / Infaq & Wakaf Terbuka";

  return (
    <div className="mx-auto w-full max-w-6xl animate-fade-in space-y-6 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-slate-900 shadow-2xl">
        <div className="absolute inset-0 bg-emerald-700" />
        <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl filter" />
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl filter" />

        <div className="relative z-10 p-6 sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-emerald-100 backdrop-blur-md">
                <FontAwesomeIcon icon={faReceipt} className="text-emerald-300" />
                <span>Detail Penyaluran #{allocation.id}</span>
              </div>
              <h1 className="font-heading text-2xl font-black text-white sm:text-4xl">
                {formatCurrency(allocation.amount)}
              </h1>
              <p className="text-sm sm:text-base font-medium text-emerald-100/90">
                Disalurkan pada {formatDateOnly(allocation.allocated_at || allocation.created_at)}
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={() => navigate(`${basePath}/allocations`)}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/10 border border-white/20 px-5 py-3 text-xs sm:text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20 active:scale-95"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                <span>Kembali</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Details */}
        <div className="space-y-6 lg:col-span-8">
          
          {/* Card 1: Rincian Program & Penyaluran */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <FontAwesomeIcon icon={faHandHoldingHeart} />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-slate-800">Rincian Program & Penyaluran</h2>
                <p className="text-xs text-slate-500">Informasi program donasi dan dana yang disalurkan</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-xs font-semibold text-slate-400 block mb-1">Program Donasi</span>
                <p className="text-sm font-bold text-slate-900">{programTitle}</p>
                {allocation.program?.category && (
                  <span className="inline-block mt-2 rounded-lg bg-emerald-100/70 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                    {allocation.program.category}
                  </span>
                )}
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-xs font-semibold text-slate-400 block mb-1">Nominal Disalurkan</span>
                <p className="font-heading text-lg font-black text-rose-600">
                  -{formatCurrency(allocation.amount)}
                </p>
                <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                  Tercatat dalam arus kas keluar
                </span>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-xs font-semibold text-slate-400 block mb-1">Tanggal Transaksi Penyaluran</span>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <FontAwesomeIcon icon={faCalendarDays} className="text-slate-400 text-xs" />
                  <span>{formatDateTime(allocation.allocated_at || allocation.created_at)}</span>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-xs font-semibold text-slate-400 block mb-1">Donatur Terkait (Jika Ada)</span>
                <p className="text-sm font-bold text-slate-800">
                  {allocation.donation?.donor_name || allocation.user?.name || "Penyaluran Umum"}
                </p>
                {allocation.donation?.donor_phone && (
                  <span className="text-xs text-slate-500 block mt-0.5">{allocation.donation.donor_phone}</span>
                )}
              </div>
            </div>

            {/* Deskripsi / Keperluan */}
            <div className="mt-6 rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <FontAwesomeIcon icon={faAlignLeft} className="text-slate-400 text-xs" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Keperluan / Keterangan Penyaluran</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                {allocation.description || "Tidak ada deskripsi rinci untuk penyaluran ini."}
              </p>
            </div>
          </div>

          {/* Card 2: Bukti Dokumentasi */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <FontAwesomeIcon icon={faImage} />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-slate-800">Bukti Dokumentasi & Penyaluran</h2>
                  <p className="text-xs text-slate-500">Foto kegiatan, kwitansi, atau dokumen pertanggungjawaban</p>
                </div>
              </div>

              {proofUrl && (
                <a
                  href={proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50"
                >
                  <span>Buka Asli</span>
                  <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px]" />
                </a>
              )}
            </div>

            {proofUrl ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center p-2">
                {isProofPdf ? (
                  <div className="p-8 text-center space-y-3">
                    <FontAwesomeIcon icon={faReceipt} className="text-5xl text-rose-500" />
                    <p className="text-sm font-bold text-slate-800">Dokumen PDF Terlampir</p>
                    <a
                      href={proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow transition hover:bg-slate-800"
                    >
                      <FontAwesomeIcon icon={faExternalLinkAlt} />
                      Lihat Dokumen PDF
                    </a>
                  </div>
                ) : (
                  <img
                    src={proofUrl}
                    alt="Bukti Penyaluran"
                    className="max-h-[480px] w-full rounded-xl object-contain shadow-xs"
                  />
                )}
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                <FontAwesomeIcon icon={faImage} className="text-3xl text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-600">Tidak Ada Bukti Foto / Dokumen</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Penyaluran ini belum memiliki lampiran berkas bukti.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar (Sticky) */}
        <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-6 lg:self-start lg:h-fit">
          {/* Action Card */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Aksi Cepat</h3>
            
            <button
              type="button"
              onClick={() => navigate(`${basePath}/allocations/${allocation.id}/edit`)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow transition hover:bg-slate-800 active:scale-98"
            >
              <FontAwesomeIcon icon={faPenToSquare} />
              <span>Edit Data Penyaluran</span>
            </button>

            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow transition hover:bg-emerald-700 active:scale-98"
              >
                <FontAwesomeIcon icon={faWhatsapp} className="text-sm" />
                <span>Kirim Laporan via WhatsApp</span>
              </a>
            )}
          </div>

          {/* Audit Info Card */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Informasi Sistem</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faClock} className="text-slate-400 text-[10px]" />
                  Dibuat Pada
                </span>
                <span className="font-semibold text-slate-700">{formatDateTime(allocation.created_at)}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faClock} className="text-slate-400 text-[10px]" />
                  ID Penyaluran
                </span>
                <span className="font-semibold text-slate-700">#{allocation.id}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faVault} className="text-slate-400 text-[10px]" />
                  Visibilitas
                </span>
                <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Publik & Terbuka
                </span>
              </div>
            </div>
          </div>

          {/* Area Berbahaya Card */}
          <div className="rounded-[28px] border border-rose-100 bg-white p-6 shadow-sm">
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
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="w-full rounded-2xl border-2 border-rose-100 bg-white py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50 hover:border-rose-200"
              >
                Hapus Penyaluran Ini
              </button>
            ) : (
              <div className="space-y-3 mt-4">
                <p className="text-xs font-semibold text-rose-600 text-center">Yakin ingin menghapus data permanen?</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-50 transition"
                    disabled={deleting}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50 transition shadow-sm"
                  >
                    {deleting ? "Menghapus..." : "Ya, Hapus"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default AdminAllocationShowPage;
