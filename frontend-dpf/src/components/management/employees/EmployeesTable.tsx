import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faMagnifyingGlass,
  faPenToSquare,
  faEnvelope,
  faPhone,
} from '@fortawesome/free-solid-svg-icons';
import type { Employee } from '@/types/employee';
import {
  EmployeePublicationBadge,
  EmployeeStatusBadge,
} from './EmployeeStatusBadge';

interface EmployeesTableProps {
  employees: Employee[];
  loading: boolean;
  canManage: boolean;
  selectedIds: Set<number>;
  allPageSelected: boolean;
  onToggle: (id: number) => void;
  onToggleAll: () => void;
}

export const EmployeesTable: React.FC<EmployeesTableProps> = ({
  employees,
  loading,
  canManage,
  selectedIds,
  allPageSelected,
  onToggle,
  onToggleAll,
}) => {
  const navigate = useNavigate();

  return (
    <div className="hidden overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm md:block">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-slate-200 bg-slate-100">
            <tr>
              {canManage && (
                <th scope="col" className="w-12 px-3 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={onToggleAll}
                    aria-label="Pilih semua karyawan di halaman ini"
                    className="h-4 w-4 rounded border-slate-300 text-primary-500 focus:ring-primary-400"
                  />
                </th>
              )}
              <th className="w-20 px-5 py-4 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Urutan
              </th>
              <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Karyawan
              </th>
              <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                ID Pegawai
              </th>
              <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Kontak
              </th>
              <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Jabatan
              </th>
              <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Status
              </th>
              <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Publikasi
              </th>
              <th className="w-28 px-5 py-4 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Aksi
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-sm">
            {/* Skeleton Loading State */}
            {loading && employees.length === 0 ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`skel-${idx}`} className="animate-pulse">
                  {canManage && (
                    <td className="px-3 py-4">
                      <div className="mx-auto h-4 w-4 rounded bg-slate-100" />
                    </td>
                  )}
                  <td className="px-5 py-4">
                    <div className="mx-auto h-4 w-6 rounded bg-slate-100" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 w-32 rounded bg-slate-100" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 w-20 rounded bg-slate-100" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 w-28 rounded bg-slate-100" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 w-28 rounded bg-slate-100" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-5 w-24 rounded-full bg-slate-100" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-5 w-24 rounded-full bg-slate-100" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="ml-auto h-9 w-20 rounded-xl bg-slate-100" />
                  </td>
                </tr>
              ))
            ) : employees.length === 0 ? (
              /* Empty State */
              <tr>
                <td
                  colSpan={canManage ? 9 : 8}
                  className="px-6 py-12 text-center text-sm font-semibold text-slate-500"
                >
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="mb-3 text-xl text-slate-400"
                  />
                  <p>Belum ada data karyawan yang ditemukan.</p>
                </td>
              </tr>
            ) : (
              /* Data Rows */
              employees.map((emp) => {
                const displayName = emp.name.trim().split(/\s+/)[0] || emp.name;

                return (
                  <tr
                    key={emp.id}
                    onClick={() => navigate(`/employees/${emp.id}`)}
                    className="group cursor-pointer transition hover:bg-slate-50"
                  >
                    {canManage && (
                      <td
                        className="px-3 py-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.has(emp.id)}
                          onChange={() => onToggle(emp.id)}
                          aria-label={`Pilih ${emp.name}`}
                          className="h-4 w-4 rounded border-slate-300 text-primary-500 focus:ring-primary-400"
                        />
                      </td>
                    )}

                    <td className="px-5 py-4 text-center font-mono font-bold text-slate-700">
                      {emp.display_order ?? '—'}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
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
                        <p
                          title={emp.name}
                          className="truncate text-sm font-bold text-slate-900"
                        >
                          {displayName}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-mono text-xs font-bold text-slate-600">
                      {emp.employee_code}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                        {emp.email ? (
                          <a
                            href={`mailto:${emp.email}`}
                            onClick={(e) => e.stopPropagation()}
                            title={emp.email}
                            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-brandGreen-600 transition"
                          >
                            <FontAwesomeIcon icon={faEnvelope} className="text-[10px] text-slate-400 shrink-0" />
                            <span className="truncate max-w-[140px]">{emp.email}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                        {emp.phone ? (
                          <a
                            href={`tel:${emp.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            title={emp.phone}
                            className="inline-flex items-center gap-1.5 font-mono text-slate-600 hover:text-brandGreen-600 transition"
                          >
                            <FontAwesomeIcon icon={faPhone} className="text-[10px] text-slate-400 shrink-0" />
                            <span>{emp.phone}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                      {emp.position}
                    </td>

                    <td className="px-5 py-4">
                      <EmployeeStatusBadge status={emp.employment_status} />
                    </td>

                    <td className="px-5 py-4">
                      <EmployeePublicationBadge isPublished={emp.is_published} />
                    </td>

                    <td
                      className="px-5 py-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-end gap-1.5">
                        <Link
                          to={`/employees/${emp.id}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brandBlueTeal-500 text-white shadow-sm hover:brightness-95"
                          title="Lihat Detail"
                        >
                          <FontAwesomeIcon icon={faEye} className="text-xs" />
                        </Link>
                        {canManage && (
                          <Link
                            to={`/employees/${emp.id}/edit`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brandGreen-600 text-white shadow-sm hover:bg-brandGreen-700"
                            title="Edit"
                          >
                            <FontAwesomeIcon
                              icon={faPenToSquare}
                              className="text-xs"
                            />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
