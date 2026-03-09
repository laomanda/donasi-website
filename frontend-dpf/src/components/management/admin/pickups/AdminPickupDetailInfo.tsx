import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";

import type { PickupRequest, PickupStatus } from "@/types/pickup";

interface AdminPickupDetailInfoProps {
  data: PickupRequest | null;
  loading: boolean;
  getStatusBorder: (status: PickupStatus) => string;
  getStatusLabel: (status: PickupStatus) => string;
  formatDateTime: (value?: string | null) => string;
}

export default function AdminPickupDetailInfo({
  data,
  loading,
  getStatusBorder,
  getStatusLabel,
  formatDateTime,
}: AdminPickupDetailInfoProps) {
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
            <h2 className="font-heading text-xl font-bold text-slate-900">Detail Pemohon</h2>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Informasi Pickup & Alamat</p>
          </div>
        </div>
        <div className={`inline-flex items-center gap-2 rounded-full border-l-[4px] px-4 py-1.5 text-xs font-bold uppercase tracking-wider shadow-sm ${getStatusBorder(data.status ?? "")}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
          {getStatusLabel(data.status ?? "")}
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Data Personal</h3>
            <div className="grid gap-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-slate-50">
                <p className="text-[10px] font-bold uppercase text-slate-400">Nama Lengkap</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{data.donor_name ?? "-"}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-slate-50">
                <p className="text-[10px] font-bold uppercase text-slate-400">Nomor Telepon</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{data.donor_phone ?? "-"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Jadwal & Wakaf</h3>
            <div className="grid gap-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-slate-50">
                <p className="text-[10px] font-bold uppercase text-slate-400">Jenis Wakaf</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{data.zakat_type ?? "-"}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-slate-50">
                <p className="text-[10px] font-bold uppercase text-slate-400">Estimasi Jumlah</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{data.estimation ?? "-"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:col-span-2">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Alamat Penjemputan</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-white p-4 transition hover:bg-slate-50">
                <p className="text-[10px] font-bold uppercase text-slate-400">Kota / Kabupaten</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{data.city ?? "-"}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4 transition hover:bg-slate-50">
                <p className="text-[10px] font-bold uppercase text-slate-400">Kecamatan</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{data.district ?? "-"}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:col-span-2 transition hover:bg-slate-50">
                <p className="text-[10px] font-bold uppercase text-slate-400">Alamat Lengkap</p>
                <p className="mt-1 text-sm font-bold text-slate-900 leading-relaxed">{data.address_full ?? "-"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:col-span-2">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Informasi Tambahan</h3>
            <div className="grid gap-3">
              <div className="rounded-2xl border border-slate-100 bg-indigo-50/30 p-4">
                <p className="text-[10px] font-bold uppercase text-indigo-400">Waktu Preferensi Donor</p>
                <p className="mt-1 text-sm font-bold text-indigo-900">{data.preferred_time ?? "-"}</p>
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
            <span>Diperbarui: {formatDateTime(data.updated_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
