import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faPenToSquare,
  faTrashCan,
  faCopy,
  faCheck,
  faIdBadge,
} from '@fortawesome/free-solid-svg-icons';
import type { Employee } from '@/types/employee';
import { EmployeePublicationBadge, EmployeeStatusBadge } from './EmployeeStatusBadge';
import { useToast } from '@/components/ui/ToastProvider';

interface EmployeeDetailViewProps {
  employee: Employee;
  canManage: boolean;
  onDeleteClick: () => void;
}

export const EmployeeDetailView: React.FC<EmployeeDetailViewProps> = ({
  employee,
  canManage,
  onDeleteClick,
}) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyUrl = async () => {
    if (!employee.public_url) return;
    try {
      await navigator.clipboard.writeText(employee.public_url);
      setCopied(true);
      toast.success('URL ID Digital berhasil disalin ke clipboard.');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Gagal menyalin URL.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandGreen-400 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-heading text-2xl font-bold text-slate-900 sm:text-3xl">
                {employee.name}
              </h1>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                {employee.employee_code}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {employee.position} {employee.division ? `• ${employee.division}` : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/employees')}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
              <span>Kembali</span>
            </button>

            {canManage && (
              <>
                <Link
                  to={`/employees/${employee.id}/edit`}
                  className="inline-flex items-center gap-2 rounded-2xl bg-brandGreen-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-700"
                >
                  <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
                  <span>Edit Karyawan</span>
                </Link>

                <button
                  type="button"
                  onClick={onDeleteClick}
                  className="inline-flex items-center gap-2 rounded-2xl border border-rose-300 bg-rose-50 px-5 py-3 text-sm font-bold text-rose-700 shadow-sm transition hover:bg-rose-100"
                >
                  <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                  <span>Hapus</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT: ID Card Visual Showcase */}
        <div className="lg:col-span-5">
          <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandGreen-300 bg-white p-6 shadow-sm sm:p-8">
            <h3 className="font-heading text-lg font-bold text-slate-900 pb-4 border-b border-slate-100">
              ID Card Digital Fisik
            </h3>

            <div className="mt-5 flex min-h-[380px] items-center justify-center rounded-2xl bg-slate-50 p-4 border border-slate-200">
              {employee.id_card_image_url ? (
                <img
                  src={employee.id_card_image_url}
                  alt={`ID Card digital ${employee.name}`}
                  className="max-h-[500px] w-auto max-w-full rounded-xl object-contain shadow-md"
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
          <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandGreen-300 bg-white p-6 shadow-sm sm:p-8 space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b border-slate-100 pb-4">
              <div>
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
                <p className="mt-1 font-semibold text-slate-900">{employee.position}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/75 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Divisi</p>
                <p className="mt-1 font-semibold text-slate-900">{employee.division || '—'}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/75 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Urutan Tampilan</p>
                <p className="mt-1 font-mono font-bold text-slate-900">
                  #{employee.display_order ?? '—'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/75 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Slug URL</p>
                <p className="mt-1 font-mono text-xs font-semibold text-slate-700">
                  {employee.slug}
                </p>
              </div>
            </div>
          </div>

          {/* Public Digital URL Box */}
          <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandGreen-200 bg-white p-6 shadow-sm sm:p-8 space-y-4">
            <div>
              <h3 className="font-heading text-lg font-bold text-slate-900">
                Tautan Profil Publik (QR Target)
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                URL publik ini tertanam pada kode QR kartu ID fisik karyawan dan dapat diverifikasi langsung oleh masyarakat/mitra.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="text"
                readOnly
                value={employee.public_url}
                className="flex-1 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-xs text-slate-800 focus:outline-hidden"
              />

              <button
                type="button"
                onClick={handleCopyUrl}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brandGreen-600 px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-brandGreen-700"
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
