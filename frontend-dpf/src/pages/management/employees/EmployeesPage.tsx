import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faArrowRight,
  faTriangleExclamation,
  faRotateRight,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { useToast } from '@/components/ui/ToastProvider';
import employeeService from '@/services/employeeService';
import type { Employee, EmployeeListParams } from '@/types/employee';
import { useEmployees } from '@/hooks/employees/useEmployees';
import { useEmployeeFilters } from '@/hooks/employees/useEmployeeFilters';
import { useEmployeePermissions } from '@/hooks/employees/useEmployeePermissions';
import {
  EmployeesHeader,
  EmployeesToolbar,
  EmployeesTable,
  EmployeesMobileList,
  EmployeeDeleteDialog,
} from '@/components/management/employees';

export function EmployeesPage() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { canManage } = useEmployeePermissions();

  // Read URL query parameters
  const params: EmployeeListParams = useMemo(() => {
    const q = searchParams.get('q') || undefined;
    const position = searchParams.get('position') || undefined;
    const division = searchParams.get('division') || undefined;
    const employment_status = searchParams.get('employment_status') || undefined;
    const isPubParam = searchParams.get('is_published');
    const is_published =
      isPubParam === 'true' ? true : isPubParam === 'false' ? false : undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const per_page = parseInt(searchParams.get('per_page') || '15', 10);

    return {
      q,
      position,
      division,
      employment_status,
      is_published,
      page: isNaN(page) || page < 1 ? 1 : page,
      per_page: isNaN(per_page) || per_page < 1 ? 15 : per_page,
    };
  }, [searchParams]);

  // SWR Cached Employees Query
  const {
    employees,
    meta,
    loading,
    refreshing,
    error,
    refresh,
  } = useEmployees(params);

  // Filter options
  const { filters: filterOptions } = useEmployeeFilters();

  // State for delete modal
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Update URL search parameters
  const updateParams = useCallback(
    (updated: Partial<EmployeeListParams>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(updated).forEach(([key, val]) => {
          if (val === undefined || val === '') {
            next.delete(key);
          } else {
            next.set(key, String(val));
          }
        });
        return next;
      });
    },
    [setSearchParams]
  );

  const handleResetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  // Handle pagination changes
  const handlePageChange = useCallback(
    (newPage: number) => {
      updateParams({ page: newPage });
    },
    [updateParams]
  );

  const handlePerPageChange = useCallback(
    (newPerPage: number) => {
      updateParams({ per_page: newPerPage, page: 1 });
    },
    [updateParams]
  );

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!deletingEmployee) return;

    setIsDeleting(true);
    try {
      await employeeService.deleteEmployee(deletingEmployee.id);
      toast.success('Karyawan berhasil dihapus.');
      setDeletingEmployee(null);

      // If last item on page is deleted and page > 1, decrement page
      if (employees.length === 1 && (params.page ?? 1) > 1) {
        updateParams({ page: (params.page ?? 1) - 1 });
      } else {
        await refresh();
      }
    } catch {
      toast.error('Gagal menghapus karyawan.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Pagination summary text
  const paginationLabel = useMemo(() => {
    if (!meta.total) return 'Tidak ada data karyawan.';
    const start = meta.from ?? (meta.current_page - 1) * meta.per_page + 1;
    const end = meta.to ?? Math.min(meta.current_page * meta.per_page, meta.total);
    return `Menampilkan ${start}–${end} dari ${meta.total} karyawan`;
  }, [meta]);

  const hasFilterActive = Boolean(
    params.q ||
    params.position ||
    params.division ||
    params.employment_status ||
    params.is_published !== undefined
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12 animate-fade-in font-body">
      {/* Page Header */}
      <EmployeesHeader
        canManage={canManage}
        refreshing={refreshing}
        onRefresh={() => void refresh()}
        total={meta.total}
      />

      {/* Filter and Search Toolbar */}
      <EmployeesToolbar
        params={params}
        filterOptions={filterOptions}
        onChange={updateParams}
        onReset={handleResetFilters}
      />

      {/* Error Banner */}
      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 shadow-xs">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faTriangleExclamation} className="text-rose-500" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => void refresh()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-100 px-3.5 py-1.5 text-xs font-bold text-rose-800 transition hover:bg-rose-200"
          >
            <FontAwesomeIcon icon={faRotateRight} className="text-[11px]" />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {/* Empty State when zero employees in system */}
      {!loading && !error && employees.length === 0 && (
        <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandGreen-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mb-4">
            <FontAwesomeIcon icon={faUsers} className="text-2xl" />
          </div>
          {hasFilterActive ? (
            <div className="space-y-1">
              <h2 className="font-heading text-base font-bold text-slate-900">
                Karyawan Tidak Ditemukan
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tidak ada data yang sesuai dengan pencarian atau filter saat ini.
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="rounded-2xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Reset Filter
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <h2 className="font-heading text-base font-bold text-slate-900">
                Belum Ada Karyawan
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Data karyawan yang ditambahkan akan muncul di sini.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Main Employee Content (Desktop Table & Mobile List) */}
      {(loading || employees.length > 0) && (
        <div className="space-y-4">
          <EmployeesTable
            employees={employees}
            loading={loading}
            canManage={canManage}
            onDelete={(emp) => setDeletingEmployee(emp)}
          />

          <EmployeesMobileList
            employees={employees}
            loading={loading}
            canManage={canManage}
            onDelete={(emp) => setDeletingEmployee(emp)}
          />

          {/* Pagination Footer */}
          <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 border-l-4 border-l-brandGreen-200 bg-white p-4 sm:px-6 sm:py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-xs font-semibold text-slate-600 text-center sm:text-left">
                {paginationLabel}
              </span>

              {/* Rows Per Page Selector */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
                <span>Tampilkan:</span>
                <select
                  value={params.per_page ?? 15}
                  onChange={(e) => handlePerPageChange(parseInt(e.target.value, 10))}
                  className="rounded-xl border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 focus:border-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brandGreen-400"
                >
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(Math.max(1, (params.page ?? 1) - 1))}
                disabled={loading || (params.page ?? 1) <= 1}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="text-[10px]" />
                <span>Sebelumnya</span>
              </button>

              <button
                type="button"
                onClick={() => handlePageChange(Math.min(meta.last_page, (params.page ?? 1) + 1))}
                disabled={loading || (params.page ?? 1) >= meta.last_page}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>Berikutnya</span>
                <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <EmployeeDeleteDialog
        employee={deletingEmployee}
        deleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingEmployee(null)}
      />
    </div>
  );
}

export default EmployeesPage;
