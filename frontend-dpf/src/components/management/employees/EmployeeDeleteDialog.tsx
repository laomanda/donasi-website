import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import type { Employee } from '@/types/employee';

interface EmployeeDeleteDialogProps {
  employee: Employee | null;
  deleting: boolean;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export const EmployeeDeleteDialog: React.FC<EmployeeDeleteDialogProps> = ({
  employee,
  deleting,
  onConfirm,
  onClose,
}) => {
  useEffect(() => {
    if (!employee) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !deleting) {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [employee, deleting, onClose]);

  if (!employee) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-employee-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !deleting) {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-md rounded-[28px] border border-slate-200 border-l-4 border-l-rose-500 bg-white p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <FontAwesomeIcon icon={faTriangleExclamation} className="text-lg" />
          </div>
          <div className="space-y-1">
            <h2 id="delete-employee-title" className="text-lg font-bold text-slate-900 font-heading">
              Hapus Karyawan?
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Data karyawan akan dihapus dari pengelolaan aktif dan tidak lagi tersedia pada halaman publik. Tindakan ini tidak menghapus berkas ID Card secara fisik.
            </p>
          </div>
        </div>

        {/* Employee Summary Box */}
        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-1 text-xs">
          <p className="font-bold text-slate-900 text-sm">{employee.name}</p>
          <p className="font-mono text-slate-500">ID Pegawai: {employee.employee_code}</p>
          <p className="text-slate-600 font-medium">
            {employee.position}
          </p>
        </div>

        {/* Dialog Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-2xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-60"
          >
            <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
            <span>{deleting ? 'Menghapus...' : 'Hapus Karyawan'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
