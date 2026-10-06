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
      {/* Top Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => navigate('/employees')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
          <span>Kembali ke Daftar Karyawan</span>
        </button>

        <div className="flex items-center gap-2">
          {canManage && (
            <>
              <Link
                to={`/employees/${employee.id}/edit`}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800"
              >
                <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
                <span>Edit Karyawan</span>
              </Link>

              <button
                type="button"
                onClick={onDeleteClick}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 shadow-xs transition hover:bg-red-100"
              >
                <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                <span>Hapus</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT: ID Card Visual Showcase */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="font-poppins text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              ID Card Digital Fisik
            </h3>

            <div className="flex min-h-[380px] items-center justify-center rounded-xl bg-slate-50 p-4 border border-slate-100">
              {employee.id_card_image_url ? (
                <img
                  src={employee.id_card_image_url}
                  alt={`ID Card digital ${employee.name}`}
                  className="max-h-[500px] w-auto max-w-full rounded-lg object-contain shadow-md"
                />
              ) : (
                <div className="text-center text-xs text-slate-400 py-12">
                  <FontAwesomeIcon icon={faIdBadge} className="text-4xl mb-2 text-slate-300" />
                  <p>Gambar ID Card tidak tersedia</p>
                </div>
              )}
            </div>

            <p className="mt-3 text-center text-[11px] text-slate-400">
              Desain kartu identitas resmi lembaga Yayasan Wakaf Djalaluddin Pane
            </p>
          </div>
        </div>

        {/* RIGHT: Metadata & Information */}
        <div className="space-y-6 lg:col-span-7">
          {/* Identity & Status Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between border-b border-slate-100 pb-4">
              <div>
                <h1 className="font-poppins text-2xl font-bold text-slate-900">
                  {employee.name}
                </h1>
                <p className="font-mono text-sm font-semibold text-slate-500 mt-0.5">
                  ID Pegawai: {employee.employee_code}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <EmployeeStatusBadge status={employee.employment_status} />
                <EmployeePublicationBadge isPublished={employee.is_published} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jabatan</p>
                <p className="mt-1 font-semibold text-slate-900">{employee.position}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Divisi</p>
                <p className="mt-1 font-semibold text-slate-900">{employee.division || '—'}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Urutan Tampilan</p>
                <p className="mt-1 font-mono font-semibold text-slate-900">
                  #{employee.display_order ?? '—'}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Slug URL</p>
                <p className="mt-1 font-mono text-xs font-medium text-slate-700">
                  {employee.slug}
                </p>
              </div>
            </div>
          </div>

          {/* Public Digital URL Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <h3 className="font-poppins text-xs font-bold uppercase tracking-wider text-slate-500">
              Tautan Profil Publik (QR Target)
            </h3>
            <p className="text-xs text-slate-600">
              URL publik ini tertanam pada kode QR kartu ID fisik karyawan dan dapat diverifikasi langsung oleh masyarakat/mitra.
            </p>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="text"
                readOnly
                value={employee.public_url}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-xs text-slate-800 focus:outline-hidden"
              />

              <button
                type="button"
                onClick={handleCopyUrl}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800"
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
