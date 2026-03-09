import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faPhone, faEnvelope, faMessage } from "@fortawesome/free-solid-svg-icons";
import type { Consultation, ConsultationStatus } from "@/types/consultation";

interface AdminConsultationDetailInfoProps {
  data: Consultation | null;
  loading: boolean;
  getStatusBorder: (status: ConsultationStatus) => string;
  getStatusLabel: (status: ConsultationStatus) => string;
  formatDateTime: (value?: string | null) => string;
}

export default function AdminConsultationDetailInfo({
  data,
  loading,
  getStatusBorder,
  getStatusLabel,
  formatDateTime,
}: AdminConsultationDetailInfoProps) {
  if (loading || !data) {
    return (
      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 bg-slate-100 rounded" />
          <div className="h-32 bg-slate-50 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white p-0 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
            <FontAwesomeIcon icon={faCircleInfo} className="text-xl" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-slate-900">Detail Konsultasi</h2>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Informasi Pemohon & Pertanyaan</p>
          </div>
        </div>
        <div className={`inline-flex items-center gap-2 rounded-full border-l-[4px] px-4 py-1.5 text-xs font-bold uppercase tracking-wider shadow-sm ${getStatusBorder(data.status ?? "baru")}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
          {getStatusLabel(data.status ?? "baru")}
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* PEMOHON */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Data Pemohon</h3>
            <div className="grid gap-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-slate-50">
                <p className="text-[10px] font-bold uppercase text-slate-400">Nama Lengkap</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{data.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-slate-50">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Nomor HP</p>
                  <p className="mt-1 text-sm font-bold text-slate-900 overflow-hidden text-ellipsis">
                    {data.phone ? (
                      <a href={`tel:${data.phone}`} className="flex items-center gap-2 hover:text-emerald-600 transition">
                        <FontAwesomeIcon icon={faPhone} className="text-[10px]" />
                        {data.phone}
                      </a>
                    ) : "-"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-slate-50 overflow-hidden">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Email</p>
                  <p className="mt-1 truncate text-sm font-bold text-slate-900">
                    {data.email ? (
                      <a href={`mailto:${data.email}`} className="flex items-center gap-2 hover:text-emerald-600 transition">
                        <FontAwesomeIcon icon={faEnvelope} className="text-[10px]" />
                        {data.email}
                      </a>
                    ) : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* PERTANYAAN */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Detail Pertanyaan</h3>
            <div className="grid gap-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-slate-50">
                <p className="text-[10px] font-bold uppercase text-slate-400">Topik</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{data.topic}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-slate-50">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Pesan</p>
                  <FontAwesomeIcon icon={faMessage} className="text-[10px] text-slate-300" />
                </div>
                <div className="mt-2 text-sm font-medium leading-relaxed text-slate-700 whitespace-pre-wrap">
                  {data.message}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-t border-slate-50 pt-6">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
            <span>Dibuat: {formatDateTime(data.created_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
            <span>Terakhir Diperbarui: {formatDateTime(data.updated_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
