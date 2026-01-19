import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faMagnifyingGlass,
  faPenToSquare,
  faPlus,
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
    ? "bg-brandGreen-50 text-brandGreen-700 ring-brandGreen-100"
    : "bg-red-100 text-red-700 ring-red-200";

const getRoleLabel = (user: User) => {
  const roles = Array.isArray(user.roles) ? user.roles : [];
  const roleNames = roles
    .map((r) => String(r?.name ?? "").trim())
    .filter(Boolean);
  if (roleNames.length) return roleNames.join(", ");
  const label = String(user.role_label ?? "").trim();
  return label || "-";
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
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="rounded-[28px] border border-primary-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-700 ring-1 ring-primary-100">
              Akses
            </span>
            <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">Pengguna</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Kelola akun, peran, dan status aktif pengguna. Gunakan fitur pilih untuk hapus banyak data tanpa pindah halaman.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="inline-flex items-center rounded-full bg-brandGreen-100 px-3 py-1 text-black ring-1 ring-brandGreen-100">
                Total: <span className="ml-1 font-bold text-slate-900">{total}</span>
              </span>
              <span className="inline-flex items-center rounded-full bg-brandGreen-100 px-3 py-1 text-slate-700 ring-1 ring-slate-200">
                {pageLabel}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/superadmin/users/create")}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700"
            >
              <FontAwesomeIcon icon={faPlus} />
              Tambah pengguna
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <label className="block">
              <span className="text-[11px] font-bold tracking-wide text-slate-400">Pencarian</span>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-200">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari nama atau email..."
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-[11px] font-bold tracking-wide text-slate-400">Peran</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="">Semua</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-[11px] font-bold tracking-wide text-slate-400">Per halaman</span>
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                {[10, 20, 30, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Atur ulang
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
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

      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left">
            <thead className="border-b border-primary-100 bg-primary-50">
              <tr className="text-xs font-bold tracking-wide text-slate-500">
                <th className="w-10 px-6 py-4">
                  <input
                    type="checkbox"
                    aria-label="Pilih semua pengguna"
                    checked={pageIds.length > 0 && pageIds.every((id) => selection.isSelected(id))}
                    onChange={() => selection.toggleAll(pageIds)}
                    className="h-4 w-4"
                  />
                </th>
                <th className="px-6 py-4">Pengguna</th>
                <th className="px-6 py-4">Peran</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Diperbarui</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-5">
                      <div className="h-4 w-4 rounded bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <div className="h-4 w-48 rounded bg-slate-100" />
                        <div className="h-3 w-56 rounded bg-slate-100" />
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-6 w-28 rounded-full bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-6 w-24 rounded-full bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-40 rounded bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="ml-auto h-10 w-10 rounded-2xl bg-slate-100" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                    Belum ada pengguna yang cocok.
                  </td>
                </tr>
              ) : (
                items.map((user) => {
                  const updated = user.updated_at ?? user.created_at;
                  return (
                    <tr key={user.id} className="hover:bg-primary-50">
                      <td className="px-6 py-5">
                        <input
                          type="checkbox"
                          checked={selection.isSelected(user.id)}
                          onChange={() => selection.toggle(user.id)}
                          aria-label={`Pilih pengguna ${user.name}`}
                          className="h-4 w-4"
                        />
                      </td>
                      <td className="px-6 py-5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">{user.name}</p>
                          <p className="mt-1 truncate text-xs font-semibold text-slate-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex max-w-[18rem] truncate rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                          {getRoleLabel(user)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${getStatusTone(Boolean(user.is_active))}`}>
                          {user.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-semibold text-slate-600">{formatDateTime(updated)}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => navigate(`/superadmin/users/${user.id}/edit`)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
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
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-5 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="h-4 w-4 rounded bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 rounded bg-slate-100" />
                    <div className="h-3 w-4/5 rounded bg-slate-100" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="h-6 w-28 rounded-full bg-slate-100" />
                  <div className="h-10 w-10 rounded-2xl bg-slate-100" />
                </div>
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-sm font-semibold text-slate-500">Belum ada pengguna yang cocok.</div>
          ) : (
            items.map((user) => {
              const updated = user.updated_at ?? user.created_at;
              return (
                <div key={user.id} className="p-5">
                  <div className="flex items-start gap-3">
                    <span onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selection.isSelected(user.id)}
                        onChange={() => selection.toggle(user.id)}
                        aria-label={`Pilih pengguna ${user.name}`}
                        className="mt-1 h-4 w-4"
                      />
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate(`/superadmin/users/${user.id}/edit`)}
                      className="block w-full text-left"
                    >
                      <p className="text-base font-bold text-slate-900">{user.name}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-600">{user.email}</p>
                      <p className="mt-3 text-xs font-semibold text-slate-500">Pembaruan: {formatDateTime(updated)}</p>
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex max-w-[18rem] truncate rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                        {getRoleLabel(user)}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${getStatusTone(Boolean(user.is_active))}`}>
                        {user.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/superadmin/users/${user.id}/edit`)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                      aria-label="Ubah"
                    >
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold text-slate-500">Halaman {page} dari {lastPage}</p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void fetchUsers(Math.max(1, page - 1))}
              disabled={loading || page <= 1}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Sebelumnya
            </button>
            <button
              type="button"
              onClick={() => void fetchUsers(Math.min(lastPage, page + 1))}
              disabled={loading || page >= lastPage}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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

