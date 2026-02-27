import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCommentDots,
  faTrash,
  faReply,
  faTag,
  faUser,
  faPhone,
  faCalendarAlt,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import http from "../../../lib/http";
import { getAuthUser } from "../../../lib/auth";
import { useToast } from "../../../components/ui/ToastProvider";

type Suggestion = {
  id: number;
  name: string;
  phone: string;
  category: string;
  message: string;
  status: "baru" | "dibalas";
  is_anonymous: boolean;
  created_at: string;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getCategoryLabel = (cat: string) => {
  const map: Record<string, string> = {
    suggestion: "Saran",
    bug: "Laporan Bug",
    appreciation: "Apresiasi",
    other: "Lainnya",
  };
  return map[cat] || cat;
};

const getCategoryTone = (cat: string) => {
  if (cat === "bug") return "bg-red-50 text-red-700 border-red-100";
  if (cat === "appreciation") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (cat === "suggestion") return "bg-amber-50 text-amber-700 border-amber-100";
  return "bg-slate-50 text-slate-700 border-slate-100";
};

const formatWhatsAppLink = (phone: string, name: string, category: string) => {
  let cleanNumber = phone.replace(/\D/g, "");
  if (cleanNumber.startsWith("0")) {
    cleanNumber = "62" + cleanNumber.substring(1);
  } else if (cleanNumber.startsWith("8")) {
    cleanNumber = "62" + cleanNumber;
  }
  const message = `Halo Bapak/Ibu ${name}, kami dari Admin DPF ingin menindaklanjuti pesan Anda terkait *${getCategoryLabel(category)}*. Terima kasih.`;
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
};

export function AdminSuggestionShowPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [item, setItem] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const authUser = useMemo(() => getAuthUser(), []);
  

  const [isChangingStatus, setIsChangingStatus] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await http.get<Suggestion>(`/admin/suggestions/${id}`);
        setItem(res.data);
      } catch {
        setError("Saran tidak ditemukan.");
      } finally {
        setLoading(false);
      }
    };
    void fetchDetail();
  }, [id]);

  const onDelete = async () => {
    setDeleting(true);
    try {
      await http.delete(`/admin/suggestions/${id}`);
      toast.success("Saran berhasil dihapus.", { title: "Berhasil" });
      navigate("/admin/suggestions", { replace: true });
    } catch {
      toast.error("Gagal menghapus saran.", { title: "Gagal" });
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-emerald-600 shadow-xl transition-colors duration-500">
        <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10" />
        <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white ring-1 ring-white/30 backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  Detail Saran Muzakki
                </span>
                <h1 className="mt-3 font-heading text-3xl font-bold text-white md:text-5xl text-shadow-sm">
                  {loading ? "Memuat..." : "Saran & Kritik"}
                </h1>
                <p className="mt-2 max-w-2xl text-lg font-medium text-white/90">
                  Pantau detail saran, hubungi donatur, atau kelola saran yang masuk.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/admin/suggestions")}
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
        <div className="space-y-6 lg:col-span-8 lg:sticky lg:top-24 lg:h-fit lg:self-start lg:z-10">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h2 className="font-heading text-xl font-semibold text-slate-900">Informasi Donatur</h2>
                  {item && (
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${item.status === 'baru' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                      {item.status === 'baru' ? 'Baru' : 'Dibalas'}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-600">Data kontak dan detail saran yang diberikan.</p>
              </div>
              <span
                className={[
                  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold leading-none shadow-sm border bg-primary-600 text-white",
                  item ? getCategoryTone(item.category) : "bg-slate-50 text-slate-400 border-slate-100",
                ].join(" ")}
              >
                <FontAwesomeIcon icon={faTag} className="text-[10px] text-white" />
                {item ? getCategoryLabel(item.category) : "-"}
              </span>
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <FontAwesomeIcon icon={faUser} className="text-emerald-500" />
                  Nama
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <dd className="text-sm font-bold text-slate-900">{item?.name ?? "-"}</dd>
                  {!!item?.is_anonymous && (
                    <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 relative -top-0.5">Anonim</span>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <FontAwesomeIcon icon={faPhone} className="text-emerald-500" />
                  No. Telepon
                </p>
                <dd className="mt-2 text-sm font-bold text-slate-900">{item?.phone ?? "-"}</dd>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-2">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-emerald-500" />
                  Dikirim Pada
                </p>
                <dd className="mt-2 text-sm font-bold text-slate-900">{formatDateTime(item?.created_at)}</dd>
              </div>
            </dl>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                <FontAwesomeIcon icon={faCommentDots} className="text-emerald-500" />
                Isi Saran / Kritik
              </p>
              <div className="mt-3 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                {item?.message ?? "-"}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-24 lg:h-fit lg:self-start lg:z-10">
          {true && (
            <div className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
                  <FontAwesomeIcon icon={faReply} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Tindak Lanjut</p>
                  <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">Hubungi Donatur</h2>
                  <p className="mt-2 text-sm text-slate-600">Sampaikan tanggapan atau terima kasih atas masukannya.</p>
                </div>
              </div>

              <div className="mt-6">
                {item ? (
                  <a
                    href={formatWhatsAppLink(item.phone, item.name, item.category)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#25D366]/20 transition hover:bg-[#128C7E] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#25D366]/20"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="text-lg" />
                    Balas via WhatsApp
                  </a>
                ) : (
                  <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-300 px-5 py-3 text-sm font-bold text-white cursor-not-allowed">
                    <FontAwesomeIcon icon={faWhatsapp} className="text-lg" />
                    Balas via WhatsApp
                  </button>
                )}
              </div>
              
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-semibold text-slate-600">
                <span className="inline-flex items-start gap-2">
                  <FontAwesomeIcon icon={faCircleInfo} className="mt-0.5 text-slate-500" />
                  WhatsApp akan otomatis membuka chat dengan template pesan yang telah disiapkan.
                </span>
              </div>
            </div>
          )}

          {true && (
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Pengaturan Status</h3>
                <p className="mt-1 text-sm font-semibold text-slate-800">Ubah status penyelesaian saran</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  disabled={isChangingStatus || !item}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50"
                  value={item?.status ?? "baru"}
                  onChange={async (e) => {
                    const val = e.target.value as "baru" | "dibalas";
                    if (!item) return;
                    setIsChangingStatus(true);
                    try {
                      await http.patch(`/admin/suggestions/${item.id}/status`, { status: val });
                      setItem({ ...item, status: val });
                      toast.success("Status berhasil diubah.");
                      window.dispatchEvent(new Event("refresh-badges"));
                    } catch {
                      toast.error("Gagal mengubah status.");
                    } finally {
                      setIsChangingStatus(false);
                    }
                  }}
                >
                  <option value="baru">Baru</option>
                  <option value="dibalas">Dibalas</option>
                </select>
                {isChangingStatus && (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-r-transparent" />
                )}
              </div>
            </div>
          )}

          {true && (
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
                  disabled={loading || !item}
                  className="w-full rounded-xl border-2 border-rose-100 bg-white py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50 hover:border-rose-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hapus Saran Ini
                </button>
              ) : (
                <div className="space-y-3 mt-4">
                  <p className="text-xs font-semibold text-rose-600 text-center">Yakin ingin menghapus data permanen?</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 rounded-lg bg-slate-100 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                      disabled={deleting}
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => void onDelete()}
                      disabled={deleting}
                      className="flex-1 rounded-lg bg-rose-600 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                    >
                      {deleting ? "Menghapus..." : "Ya, Hapus"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default AdminSuggestionShowPage;
