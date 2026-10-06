import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useEmployeeDetail } from '@/hooks/employees/useEmployeeDetail';
import { useEmployeePermissions } from '@/hooks/employees/useEmployeePermissions';
import { EmployeeDetailView } from '@/components/management/employees';

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { canManage } = useEmployeePermissions();

  const { employee, loading, error, refresh } = useEmployeeDetail(id);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6 pb-12 animate-pulse font-body">
        <div className="h-6 w-48 rounded bg-slate-200" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="h-96 rounded-2xl bg-slate-200 lg:col-span-5" />
          <div className="h-96 rounded-2xl bg-slate-200 lg:col-span-7" />
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="mx-auto w-full max-w-md space-y-4 py-16 text-center font-body">
        <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-rose-500 bg-white p-10 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4">
            <FontAwesomeIcon icon={faTriangleExclamation} className="text-2xl" />
          </div>
          <h2 className="font-heading text-lg font-bold text-slate-900">
            {error || 'Karyawan tidak ditemukan.'}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Data karyawan yang Anda cari mungkin telah dihapus atau tidak tersedia.
          </p>
          <div className="flex items-center justify-center gap-3 pt-4">
            <Link
              to="/employees"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Kembali ke Daftar</span>
            </Link>
            <button
              type="button"
              onClick={() => void refresh()}
              className="rounded-2xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-12 animate-fade-in font-body">
      <EmployeeDetailView
        employee={employee}
        canManage={canManage}
      />
    </div>
  );
}

export default EmployeeDetailPage;
