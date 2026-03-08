import { useEffect, useMemo, useState } from "react";
import {
  faArrowLeft,
  faArrowRight,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import http from "../../../../lib/http";
import { useToast } from "../../../../components/ui/ToastProvider";
import { runWithConcurrency } from "../../../../lib/bulk";
import { useBulkSelection } from "../../../../components/ui/useBulkSelection";
import { BulkActionsBar } from "../../../../components/ui/BulkActionsBar";

// Modular Components
import { UsersHeader } from "../../../../components/management/superadmin/users/UsersHeader";
import { UsersFilter } from "../../../../components/management/superadmin/users/UsersFilter";
import { UsersTable } from "../../../../components/management/superadmin/users/UsersTable";
import { UsersMobileList } from "../../../../components/management/superadmin/users/UsersMobileList";

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

export function SuperAdminUsersPage() {
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
      <UsersHeader />

      <UsersFilter
        q={q}
        setQ={setQ}
        role={role}
        setRole={setRole}
        perPage={perPage}
        setPerPage={setPerPage}
        roles={roles}
        onReset={onResetFilters}
      />

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
        <UsersTable
          items={items}
          loading={loading}
          selection={selection}
          pageIds={pageIds}
        />

        <UsersMobileList
          items={items}
          loading={loading}
          selection={selection}
        />

        <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-500 text-center sm:text-left">{pageLabel}</p>
          <div className="grid grid-cols-2 gap-3 w-full sm:flex sm:w-auto sm:items-center sm:gap-2">
            <button
              type="button"
              onClick={() => void fetchUsers(Math.max(1, page - 1))}
              disabled={loading || page <= 1}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-emerald-50 hover:text-emerald-700 hover:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Sebelumnya
            </button>
            <button
              type="button"
              onClick={() => void fetchUsers(Math.min(lastPage, page + 1))}
              disabled={loading || page >= lastPage}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-emerald-50 hover:text-emerald-700 hover:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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

