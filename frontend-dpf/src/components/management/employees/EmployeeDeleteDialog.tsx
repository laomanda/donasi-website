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
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <FontAwesomeIcon icon={faTriangleExclamation} className="text-base" />
          </div>
          <div className="space-y-1">
            <h2 id="delete-employee-title" className="text-base font-bold text-slate-900 font-poppins">
              Hapus Karyawan?
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Data karyawan akan dihapus dari pengelolaan aktif dan tidak lagi tersedia pada halaman publik. Tindakan ini tidak menghapus file ID Card secara fisik.
            </p>
          </div>
        </div>

        {/* Employee Summary Box */}
        <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80 space-y-1 text-xs">
          <p className="font-bold text-slate-900">{employee.name}</p>
          <p className="font-mono text-slate-500">ID: {employee.employee_code}</p>
          <p className="text-slate-600">
            {employee.position} {employee.division ? `• ${employee.division}` : ''}
          </p>
        </div>

        {/* Dialog Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-red-700 disabled:opacity-60"
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
