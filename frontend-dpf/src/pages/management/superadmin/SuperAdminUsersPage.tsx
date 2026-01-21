import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faCircleCheck,
  faFilter,
  faMagnifyingGlass,
  faPenToSquare,
  faPlus,
  faRotateRight,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import http from "../../../lib/http";
import { useToast } from "../../../components/ui/ToastProvider";
import { runWithConcurrency } from "../../../lib/bulk";
import { useBulkSelection } from "../../../components/ui/useBulkSelection";
import { BulkActionsBar } from "../../../components/ui/BulkActionsBar";

type Role = {
  id: number;
  name: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  is_active: boolean;
  role_label?: string | null;
  roles?: { id?: number; name: string }[];
  updated_at?: string | null;
  created_at?: string | null;
};

type PaginationPayload<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
};

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getStatusTone = (isActive: boolean) =>
  isActive
    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
    : "bg-red-500 text-white shadow-md shadow-red-500/20";

const getRoleLabel = (user: User) => {
  const roles = Array.isArray(user.roles) ? user.roles : [];
  const roleNames = roles
    .map((r) => String(r?.name ?? "").trim())
    .filter(Boolean);

  if (roleNames.length) {
    return roleNames.map(name => name.charAt(0).toUpperCase() + name.slice(1)).join(", ");
  }

  const label = String(user.role_label ?? "").trim();
  return label ? label.charAt(0).toUpperCase() + label.slice(1) : "-";
};

export function SuperAdminUsersPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [items, setItems] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const [role, setRole] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const selection = useBulkSelection<number>();
  const pageIds = useMemo(() => items.map((u) => u.id), [items]);

  const fetchRoles = async () => {
    try {
      const res = await http.get<Role[]>("/superadmin/roles");
      setRoles(Array.isArray(res.data) ? res.data : []);
    } catch {
      setRoles([]);
    }
  };

  const fetchUsers = async (
    nextPage: number,
    overrides?: Partial<{ q: string; role: string; perPage: number }>
  ) => {
    const qValue = (overrides?.q ?? q).trim();
    const roleValue = (overrides?.role ?? role).trim();
    const perPageValue = overrides?.perPage ?? perPage;

    setLoading(true);
    setError(null);
    try {
      const res = await http.get<PaginationPayload<User>>("/superadmin/users", {
        params: {
          page: nextPage,
          per_page: perPageValue,
          q: qValue || undefined,
          role: roleValue || undefined,
        },
      });

      setItems(res.data.data ?? []);
      setPage(res.data.current_page ?? nextPage);
      setPerPage(res.data.per_page ?? perPageValue);
      setLastPage(res.data.last_page ?? 1);
      setTotal(res.data.total ?? 0);
    } catch {
      setError("Gagal memuat data pengguna.");
      setItems([]);
      setTotal(0);
      setLastPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perPage]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void fetchUsers(1, { q, role });
    }, 350);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, role]);

  useEffect(() => {
    selection.keepOnly(pageIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIds.join(",")]);

  const onResetFilters = () => {
    setQ("");
    setRole("");
    void fetchUsers(1, { q: "", role: "" });
  };

  const pageLabel = useMemo(() => {
    if (!total) return "Tidak ada data.";
    const start = (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, total);
    return `Menampilkan ${start}-${end} dari ${total}.`;
  }, [page, perPage, total]);

  const onDeleteSelected = async () => {
    if (selection.count === 0) return;
    setBulkDeleting(true);
    try {
      const result = await runWithConcurrency(selection.selectedIds, 4, async (id) => {
        await http.delete(`/superadmin/users/${id}`);
      });

      if (result.failed.length) {
        toast.error(`Berhasil menghapus ${result.succeeded.length}, gagal ${result.failed.length}.`, {
          title: "Sebagian gagal",
        });
        selection.setSelected(new Set(result.failed.map((f) => f.id)));
      } else {
        toast.success(`Berhasil menghapus ${result.succeeded.length} pengguna.`, { title: "Berhasil" });
        selection.clear();
      }

      await fetchUsers(1);
    } finally {
      setBulkDeleting(false);
    }
  };

  return (

    <div className="mx-auto w-full max-w-7xl animate-fade-in space-y-8 pb-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-emerald-600 shadow-xl">
        <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10" />
        <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl" />

        <div className="relative z-10 p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white ring-1 ring-white/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-200 shadow-[0_0_8px_rgba(167,243,208,0.6)]" />
                  Manajemen Akses
                </span>
                <h1 className="mt-3 font-heading text-3xl font-bold text-white md:text-5xl text-shadow-sm">
                  Daftar Pengguna
                </h1>
                <p className="mt-2 max-w-2xl text-lg font-medium text-emerald-100/90">
                  Kelola akun, hak akses peran, dan status aktif pengguna dalam satu tampilan terpadu.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/superadmin/users/create")}
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-bold text-emerald-700 shadow-lg shadow-emerald-900/10 transition-all hover:bg-emerald-50 hover:scale-105 active:scale-95"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition group-hover:bg-emerald-200">
                  <FontAwesomeIcon icon={faPlus} className="text-xs" />
                </div>
                Tambah Pengguna
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-6">
          <h3 className="font-heading text-lg font-bold text-slate-800 flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <FontAwesomeIcon icon={faFilter} />
            </div>
            Filter & Pencarian
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
            >
              <FontAwesomeIcon icon={faRotateRight} />
              Reset
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <label className="block group">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-400 group-focus-within:text-emerald-600 transition">Pencarian</span>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition group-focus-within:text-emerald-500">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari nama atau email..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
          </label>

          <label className="block group">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-400 group-focus-within:text-emerald-600 transition">Peran</span>
            <div className="mt-2 relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition group-focus-within:text-emerald-500">
                <FontAwesomeIcon icon={faUserShield} />
              </div>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-10 text-sm font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              >
                <option value="">Semua Peran</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
              </div>
            </div>
          </label>

          <label className="block group">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-400 group-focus-within:text-emerald-600 transition">Per halaman</span>
            <div className="mt-2 relative">
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3.5 px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              >
                {[10, 20, 30, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} Baris
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
              </div>
            </div>
          </label>
        </div>
      </div>

      {error ? (
        <div className="rounded-[24px] border border-red-100 bg-red-50 p-6 flex items-center gap-4 text-red-700 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
            <FontAwesomeIcon icon={faCircleCheck} className="rotate-180" />
          </div>
          <p className="font-bold">{error}</p>
        </div>
      ) : null}

      <BulkActionsBar
        count={selection.count}
        itemLabel="pengguna"
        onClear={selection.clear}
        onSelectAllPage={() => selection.toggleAll(pageIds)}
        onDeleteSelected={onDeleteSelected}
        disabled={loading || bulkDeleting}
      />

      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="w-10 px-6 py-5">
                  <input
                    type="checkbox"
                    aria-label="Pilih semua pengguna"
                    checked={pageIds.length > 0 && pageIds.every((id) => selection.isSelected(id))}
                    onChange={() => selection.toggleAll(pageIds)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th className="px-6 py-5">Pengguna</th>
                <th className="px-6 py-5">Peran</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Diperbarui</th>
                <th className="px-6 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-5"><div className="h-4 w-4 rounded bg-slate-100" /></td>
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <div className="h-4 w-48 rounded bg-slate-100" />
                        <div className="h-3 w-56 rounded bg-slate-100" />
                      </div>
                    </td>
                    <td className="px-6 py-5"><div className="h-6 w-28 rounded-full bg-slate-100" /></td>
                    <td className="px-6 py-5"><div className="h-6 w-24 rounded-full bg-slate-100" /></td>
                    <td className="px-6 py-5"><div className="h-4 w-40 rounded bg-slate-100" /></td>
                    <td className="px-6 py-5"><div className="ml-auto h-10 w-10 rounded-2xl bg-slate-100" /></td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm font-semibold text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 mb-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-2xl">
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                      </div>
                      <p>Belum ada pengguna yang data.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((user) => {
                  const updated = user.updated_at ?? user.created_at;
                  return (
                    <tr
                      key={user.id}
                      onClick={() => navigate(`/superadmin/users/${user.id}/edit`)}
                      className="group cursor-pointer transition hover:bg-slate-50 border-l-4 border-transparent hover:border-emerald-500"
                    >
                      <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selection.isSelected(user.id)}
                          onChange={() => selection.toggle(user.id)}
                          aria-label={`Pilih pengguna ${user.name}`}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="px-6 py-5">
                        <div className="min-w-0">
                          <p className="truncate text-base font-bold text-slate-900 group-hover:text-emerald-700 transition">{user.name}</p>
                          <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex max-w-[18rem] truncate rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 group-hover:bg-white group-hover:shadow-sm group-hover:ring-1 group-hover:ring-slate-200 transition">
                          {getRoleLabel(user)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusTone(Boolean(user.is_active))}`}>
                          {user.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-semibold text-slate-600">{formatDateTime(updated)}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/superadmin/users/${user.id}/edit`);
                            }}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 transition hover:bg-emerald-50 hover:text-emerald-600 hover:ring-emerald-200"
                            aria-label="Ubah"
                          >
                            <FontAwesomeIcon icon={faPenToSquare} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-slate-100 md:hidden">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6 animate-pulse">
                <div className="h-6 w-1/3 bg-slate-100 rounded mb-4" />
                <div className="h-4 w-2/3 bg-slate-100 rounded" />
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-sm font-semibold text-slate-500">Belum ada data.</div>
          ) : (
            items.map((user) => {
              const updated = user.updated_at ?? user.created_at;
              return (
                <div
                  key={user.id}
                  className="p-6 transition active:bg-slate-50"
                  onClick={() => navigate(`/superadmin/users/${user.id}/edit`)}
                >
                  <div className="flex items-start gap-4">
                    <span onClick={(e) => e.stopPropagation()} className="pt-1">
                      <input
                        type="checkbox"
                        checked={selection.isSelected(user.id)}
                        onChange={() => selection.toggle(user.id)}
                        className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-base font-bold text-slate-900 line-clamp-1">{user.name}</p>
                          <p className="text-sm text-slate-500 line-clamp-1">{user.email}</p>
                        </div>
                        <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${getStatusTone(Boolean(user.is_active))}`}>
                          {user.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-2">
                        <span className="inline-flex max-w-[12rem] truncate rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                          {getRoleLabel(user)}
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                          {formatDateTime(updated)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-500 text-center sm:text-left">{pageLabel}</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => void fetchUsers(Math.max(1, page - 1))}
              disabled={loading || page <= 1}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-emerald-50 hover:text-emerald-700 hover:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Sebelumnya
            </button>
            <button
              type="button"
              onClick={() => void fetchUsers(Math.min(lastPage, page + 1))}
              disabled={loading || page >= lastPage}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-emerald-50 hover:text-emerald-700 hover:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Berikutnya
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminUsersPage;

