import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPenToSquare, faTrashCan, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
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
  const navigate = useNavigate();

  return (
    <div className="hidden rounded-[28px] border border-slate-200 border-l-4 border-l-brandGreen-200 bg-white shadow-sm overflow-hidden md:block">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="border-b border-slate-200 bg-slate-100">
            <tr>
              <th scope="col" className="w-20 px-5 py-4 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Urutan
              </th>
              <th scope="col" className="px-5 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Karyawan
              </th>
              <th scope="col" className="px-5 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                ID Pegawai
              </th>
              <th scope="col" className="px-5 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Jabatan
              </th>
              <th scope="col" className="px-5 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Divisi
              </th>
              <th scope="col" className="px-5 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Status
              </th>
              <th scope="col" className="px-5 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Publikasi
              </th>
              <th scope="col" className="w-36 px-5 py-4 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading && employees.length === 0 ? (
              // Skeleton rows for initial load
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`skel-${idx}`} className="animate-pulse">
                  <td className="px-5 py-4 text-center">
                    <div className="mx-auto h-4 w-6 rounded bg-slate-100" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-9 rounded-xl bg-slate-100 shrink-0" />
                      <div className="h-4 w-32 rounded bg-slate-100" />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 w-20 rounded bg-slate-100" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 w-28 rounded bg-slate-100" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-5 w-24 rounded-full bg-slate-100" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-5 w-16 rounded-full bg-slate-100" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-5 w-24 rounded-full bg-slate-100" />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="ml-auto h-9 w-20 rounded-xl bg-slate-100" />
                  </td>
                </tr>
              ))
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-sm font-semibold text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-14 w-14 mb-3 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-xl">
                      <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </div>
                    <p>Belum ada data karyawan yang ditemukan.</p>
                  </div>
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr
                  key={emp.id}
                  onClick={() => navigate(`/employees/${emp.id}`)}
                  className="group cursor-pointer transition hover:bg-slate-50 border-l-4 border-transparent hover:border-brandGreen-500"
                >
                  {/* Urutan */}
                  <td className="px-5 py-4 text-center font-mono font-bold text-slate-700">
                    {emp.display_order ?? '—'}
                  </td>

                  {/* Karyawan with ID card thumbnail */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-xs">
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
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900 group-hover:text-brandGreen-700 transition">
                          {emp.name}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* ID Pegawai */}
                  <td className="px-5 py-4 font-mono text-xs font-bold text-slate-600">
                    {emp.employee_code}
                  </td>

                  {/* Jabatan */}
                  <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                    {emp.position}
                  </td>

                  {/* Divisi */}
                  <td className="px-5 py-4">
                    {emp.division ? (
                      <span className="inline-flex max-w-[14rem] truncate rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                        {emp.division}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <EmployeeStatusBadge status={emp.employment_status} />
                  </td>

                  {/* Publikasi */}
                  <td className="px-5 py-4">
                    <EmployeePublicationBadge isPublished={emp.is_published} />
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/employees/${emp.id}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-sky-400 hover:text-sky-600 hover:bg-sky-50"
                        title="Lihat Detail"
                        aria-label="Lihat Detail"
                      >
                        <FontAwesomeIcon icon={faEye} className="text-xs" />
                      </Link>

                      {canManage && (
                        <>
                          <Link
                            to={`/employees/${emp.id}/edit`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-brandGreen-500 hover:text-brandGreen-700 hover:bg-brandGreen-50"
                            title="Edit"
                            aria-label="Edit"
                          >
                            <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => onDelete(emp)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-red-400 hover:text-red-600 hover:bg-red-50"
                            title="Hapus"
                            aria-label="Hapus"
                          >
                            <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
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
