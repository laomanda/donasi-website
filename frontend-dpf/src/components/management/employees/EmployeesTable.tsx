import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import type { Employee } from '@/types/employee';
import { EmployeePublicationBadge, EmployeeStatusBadge } from './EmployeeStatusBadge';

interface EmployeesTableProps {
  employees: Employee[];
  loading: boolean;
  canManage: boolean;
  onDelete: (employee: Employee) => void;
}

export const EmployeesTable: React.FC<EmployeesTableProps> = ({
  employees,
  loading,
  canManage,
  onDelete,
}) => {
  return (
    <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs md:block">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-xs font-semibold tracking-wider text-slate-200 uppercase">
              <th scope="col" className="w-16 px-4 py-3.5 text-center">
                Urutan
              </th>
              <th scope="col" className="px-4 py-3.5">
                Karyawan
              </th>
              <th scope="col" className="px-4 py-3.5">
                ID Pegawai
              </th>
              <th scope="col" className="px-4 py-3.5">
                Jabatan
              </th>
              <th scope="col" className="px-4 py-3.5">
                Divisi
              </th>
              <th scope="col" className="px-4 py-3.5">
                Status
              </th>
              <th scope="col" className="px-4 py-3.5">
                Publikasi
              </th>
              <th scope="col" className="w-32 px-4 py-3.5 text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading && employees.length === 0 ? (
              // Skeleton rows for initial load
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`skel-${idx}`} className="animate-pulse">
                  <td className="px-4 py-4 text-center">
                    <div className="mx-auto h-4 w-6 rounded bg-slate-200" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-9 rounded-md bg-slate-200 shrink-0" />
                      <div className="h-4 w-32 rounded bg-slate-200" />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-20 rounded bg-slate-200" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-28 rounded bg-slate-200" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-24 rounded bg-slate-200" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-5 w-16 rounded-full bg-slate-200" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-5 w-24 rounded-full bg-slate-200" />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="ml-auto h-8 w-20 rounded bg-slate-200" />
                  </td>
                </tr>
              ))
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                  Tidak ada data karyawan yang ditemukan.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr
                  key={emp.id}
                  className="transition-colors hover:bg-slate-50/80"
                >
                  {/* Urutan */}
                  <td className="px-4 py-3 text-center font-mono font-semibold text-slate-700">
                    {emp.display_order ?? '—'}
                  </td>

                  {/* Karyawan with ID card thumbnail */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100 shadow-2xs">
                        {emp.id_card_image_url ? (
                          <img
                            src={emp.id_card_image_url}
                            alt={`ID Card digital ${emp.name}`}
                            className="h-full w-full object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[9px] text-slate-400">
                            N/A
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 font-medium text-slate-900 truncate">
                        <Link
                          to={`/employees/${emp.id}`}
                          className="hover:text-brandGreen-700 hover:underline"
                        >
                          {emp.name}
                        </Link>
                      </div>
                    </div>
                  </td>

                  {/* ID Pegawai */}
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-600">
                    {emp.employee_code}
                  </td>

                  {/* Jabatan */}
                  <td className="px-4 py-3 text-slate-800">
                    {emp.position}
                  </td>

                  {/* Divisi */}
                  <td className="px-4 py-3 text-slate-600">
                    {emp.division || '—'}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <EmployeeStatusBadge status={emp.employment_status} />
                  </td>

                  {/* Publikasi */}
                  <td className="px-4 py-3">
                    <EmployeePublicationBadge isPublished={emp.is_published} />
                  </td>

                  {/* Aksi */}
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        to={`/employees/${emp.id}`}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                        title="Lihat Detail Karyawan"
                        aria-label={`Lihat detail ${emp.name}`}
                      >
                        <FontAwesomeIcon icon={faEye} className="text-sm" />
                      </Link>

                      {canManage && (
                        <>
                          <Link
                            to={`/employees/${emp.id}/edit`}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                            title="Edit Karyawan"
                            aria-label={`Edit ${emp.name}`}
                          >
                            <FontAwesomeIcon icon={faPenToSquare} className="text-sm" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => onDelete(emp)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                            title="Hapus Karyawan"
                            aria-label={`Hapus ${emp.name}`}
                          >
                            <FontAwesomeIcon icon={faTrashCan} className="text-sm" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
