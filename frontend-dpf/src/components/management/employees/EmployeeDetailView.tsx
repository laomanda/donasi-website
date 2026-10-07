import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faPenToSquare,
  faCopy,
  faCheck,
  faIdBadge,
  faEnvelope,
  faPhone,
} from '@fortawesome/free-solid-svg-icons';
import type { Employee } from '@/types/employee';
import { EmployeePublicationBadge, EmployeeStatusBadge } from './EmployeeStatusBadge';
import { useToast } from '@/components/ui/ToastProvider';

interface EmployeeDetailViewProps {
  employee: Employee;
  canManage: boolean;
}

export const EmployeeDetailView: React.FC<EmployeeDetailViewProps> = ({
  employee,
  canManage,
}) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyUrl = async () => {
    if (!employee.public_url) return;
    try {
      await navigator.clipboard.writeText(employee.public_url);
      setCopied(true);
      toast.success('URL ID Digital berhasil disalin ke clipboard.', { title: 'Berhasil' });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Gagal menyalin URL.', { title: 'Gagal' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandPurple-500 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 title={employee.name} className="line-clamp-2 max-w-full break-all font-heading text-2xl font-bold leading-tight text-slate-900 sm:text-3xl lg:max-w-3xl">
                {employee.name}
              </h1>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                {employee.employee_code}
              </span>
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2.5 lg:w-auto lg:shrink-0">
            <button
              type="button"
              onClick={() => navigate('/employees')}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:flex-none"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
              <span>Kembali</span>
            </button>

            {canManage && (
              <>
                <Link
                  to={`/employees/${employee.id}/edit`}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary-500 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-600 sm:flex-none"
                >
                  <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
                  <span>Edit Karyawan</span>
                </Link>

              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT: ID Card Visual Showcase */}
        <div className="lg:col-span-5">
          <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandBlueTeal-500 bg-white p-5 shadow-sm sm:p-8">
            <h3 className="font-heading text-lg font-bold text-slate-900 pb-4 border-b border-slate-100">
              ID Card Digital Fisik
            </h3>

            <div className="mt-5 flex min-h-[280px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:min-h-[380px] sm:p-4">
              {employee.id_card_image_url ? (
                <img
                  src={employee.id_card_image_url}
                  alt={`ID Card digital ${employee.name}`}
                  className="max-h-[560px] w-auto max-w-full rounded-xl object-contain shadow-md"
                />
              ) : (
                <div className="text-center text-xs text-slate-400 py-12">
                  <FontAwesomeIcon icon={faIdBadge} className="text-4xl mb-2 text-slate-300" />
                  <p className="font-semibold">Gambar ID Card tidak tersedia</p>
                </div>
              )}
            </div>

            <p className="mt-4 text-center text-xs text-slate-400">
              Desain kartu identitas resmi Yayasan Wakaf Djalaluddin Pane
            </p>
          </div>
        </div>

        {/* RIGHT: Metadata & Information */}
        <div className="space-y-6 lg:col-span-7">
          {/* Identity & Status Card */}
          <div className="min-w-0 space-y-6 rounded-[28px] border border-slate-200 border-l-4 border-l-brandWarmOrange-500 bg-white p-5 shadow-sm sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b border-slate-100 pb-4">
              <div className="min-w-0">
                <h2 className="font-heading text-lg font-bold text-slate-900">
                  Informasi & Status Karyawan
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detail penugasan, visibilitas publik, dan urutan tampilan
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <EmployeeStatusBadge status={employee.employment_status} />
                <EmployeePublicationBadge isPublished={employee.is_published} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/75 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Jabatan</p>
                <p className="mt-1 break-words font-semibold text-slate-900">{employee.position}</p>
              </div>

              <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/75 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Divisi</p>
                <p title={employee.division || undefined} className="mt-1 line-clamp-2 break-words font-semibold text-slate-900">{employee.division || '—'}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/75 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Email</p>
                {employee.email ? (
                  <a
                    href={`mailto:${employee.email}`}
                    className="mt-1 flex items-center gap-2 break-all text-sm font-semibold text-brandGreen-700 hover:text-brandGreen-800 hover:underline"
                  >
                    <FontAwesomeIcon icon={faEnvelope} className="text-xs text-slate-400 shrink-0" />
                    <span>{employee.email}</span>
                  </a>
                ) : (
                  <p className="mt-1 text-slate-400">—</p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/75 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">No. Telepon</p>
                {employee.phone ? (
                  <a
                    href={`tel:${employee.phone}`}
                    className="mt-1 flex items-center gap-2 font-mono text-sm font-semibold text-brandGreen-700 hover:text-brandGreen-800 hover:underline"
                  >
                    <FontAwesomeIcon icon={faPhone} className="text-xs text-slate-400 shrink-0" />
                    <span>{employee.phone}</span>
                  </a>
                ) : (
                  <p className="mt-1 text-slate-400">—</p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/75 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Urutan Tampilan</p>
                <p className="mt-1 font-mono font-bold text-slate-900">
                  #{employee.display_order ?? '—'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/75 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Slug URL</p>
                <p className="mt-1 break-all font-mono text-xs font-semibold text-slate-700">
                  {employee.slug}
                </p>
              </div>
            </div>
          </div>

          {/* Public Digital URL Box */}
          <div className="min-w-0 space-y-4 rounded-[28px] border border-slate-200 border-l-4 border-l-brandPurple-500 bg-white p-5 shadow-sm sm:p-8">
            <div>
              <h3 className="font-heading text-lg font-bold text-slate-900">
                Tautan Profil Publik (QR Target)
              </h3>
              <p className="mt-1 break-words text-xs text-slate-600">
                URL publik ini tertanam pada kode QR kartu ID fisik karyawan dan dapat diverifikasi langsung oleh masyarakat/mitra.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="text"
                readOnly
                value={employee.public_url}
                className="min-w-0 flex-1 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-xs text-slate-800 focus:outline-hidden"
              />

              <button
                type="button"
                onClick={handleCopyUrl}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brandBlueTeal-500 px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:brightness-95"
              >
                <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-xs" />
                <span>{copied ? 'Tersalin' : 'Salin URL'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
