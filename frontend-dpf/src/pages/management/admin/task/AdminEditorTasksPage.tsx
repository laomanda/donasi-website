import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "@/lib/http";
import { useToast } from "@/components/ui/ToastProvider";
import { getAuthUser } from "@/lib/auth";
import { useBulkSelection } from "@/components/ui/useBulkSelection";
import { BulkActionsBar } from "@/components/ui/BulkActionsBar";
import { runWithConcurrency } from "@/lib/bulk";

// Modular Components
import AdminTaskHeader from "@/components/management/admin/tasks/AdminTaskHeader";
import AdminTaskFilters from "@/components/management/admin/tasks/AdminTaskFilters";
import AdminTaskList from "@/components/management/admin/tasks/AdminTaskList";
import AdminTaskPagination from "@/components/management/admin/tasks/AdminTaskPagination";

// Utilities
import type { EditorTaskStatus, EditorTaskPriority } from "@/utils/management/adminTaskUtils";

interface EditorTaskItem {
  id: number;
  title?: string | null;
  description?: string | null;
  status?: EditorTaskStatus | null;
  cancel_reason?: string | null;
  priority?: EditorTaskPriority | null;
  due_at?: string | null;
  created_at?: string | null;
  attachments?: any[] | null;
  assignee?: { id?: number; name?: string | null; email?: string | null } | null;
  creator?: { id?: number; name?: string | null; email?: string | null } | null;
}

interface EditorUserOption {
  id: number;
  name?: string | null;
  email?: string | null;
}

interface EditorTaskPayload {
  data: EditorTaskItem[];
  current_page?: number;
  per_page?: number;
  last_page?: number;
  total?: number;
}

export function AdminEditorTasksPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const apiBase = "/admin";
  const routeBase = "/admin";
  const storedUser = useMemo(() => getAuthUser(), []);

  const [items, setItems] = useState<EditorTaskItem[]>([]);
  const [editors, setEditors] = useState<EditorUserOption[]>([]);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<EditorTaskStatus>("");
  const [priority, setPriority] = useState<EditorTaskPriority>("");
  const [assignedTo, setAssignedTo] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selection = useBulkSelection<number>();
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const pageIds = useMemo(() => items.map((item) => item.id), [items]);

  const pageRef = useRef(page);
  const perPageRef = useRef(perPage);
  const appliedFiltersRef = useRef({
    q: "",
    status: "" as EditorTaskStatus,
    priority: "" as EditorTaskPriority,
    assignedTo: "",
  });
  const backgroundRefreshRef = useRef(false);

  const pageLabel = useMemo(() => {
    if (!total) return "Tidak ada data.";
    const start = (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, total);
    return `Menampilkan ${start}-${end} dari ${total}.`;
  }, [page, perPage, total]);

  const fetchEditors = async () => {
    try {
      const res = await http.get<EditorUserOption[]>(`${apiBase}/editor-tasks/editors`);
      setEditors(res.data ?? []);
    } catch {
      // ignore
    }
  };

  const fetchTasks = async (
    nextPage: number,
    overrides?: Partial<{
      q: string;
      status: EditorTaskStatus;
      priority: EditorTaskPriority;
      assignedTo: string;
      perPage: number;
    }>,
    options?: { silent?: boolean }
  ) => {
    const qValue = (overrides?.q ?? q).trim();
    const statusValue = overrides?.status ?? status;
    const priorityValue = overrides?.priority ?? priority;
    const assignedValue = overrides?.assignedTo ?? assignedTo;
    const perPageValue = overrides?.perPage ?? perPage;

    appliedFiltersRef.current = {
      q: qValue,
      status: statusValue,
      priority: priorityValue,
      assignedTo: assignedValue,
    };

    if (!options?.silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const res = await http.get<EditorTaskPayload>(`${apiBase}/editor-tasks`, {
        params: {
          page: nextPage,
          per_page: perPageValue,
          q: qValue || undefined,
          status: statusValue || undefined,
          priority: priorityValue || undefined,
          assigned_to: assignedValue || undefined,
        },
      });
      setItems(res.data.data ?? []);
      setPage(res.data.current_page ?? nextPage);
      setPerPage(res.data.per_page ?? perPageValue);
      setLastPage(res.data.last_page ?? 1);
      setTotal(res.data.total ?? 0);
    } catch {
      if (!options?.silent) {
        setError("Gagal memuat tugas editor.");
      }
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void fetchEditors();
  }, []);

  useEffect(() => {
    selection.keepOnly(pageIds);
  }, [pageIds]);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    perPageRef.current = perPage;
  }, [perPage]);

  useEffect(() => {
    const handler = setTimeout(() => {
      void fetchTasks(1, { q, status, priority, assignedTo, perPage });
    }, 500);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, priority, assignedTo, perPage]);

  useEffect(() => {
    let pollId: number | null = null;
    if (typeof window === "undefined") return () => {};

    const refreshTasks = () => {
      if (backgroundRefreshRef.current) return;
      backgroundRefreshRef.current = true;
      const applied = appliedFiltersRef.current;
      void fetchTasks(
        pageRef.current,
        {
          q: applied.q,
          status: applied.status,
          priority: applied.priority,
          assignedTo: applied.assignedTo,
          perPage: perPageRef.current,
        },
        { silent: true }
      ).finally(() => {
        backgroundRefreshRef.current = false;
      });
    };

    const fallbackInterval = 5_000;
    pollId = window.setInterval(refreshTasks, fallbackInterval);

    return () => {
      if (pollId) window.clearInterval(pollId);
    };
  }, [storedUser]);

  const onResetFilters = () => {
    setQ("");
    setStatus("");
    setPriority("");
    setAssignedTo("");
  };

  const onDeleteTask = async (taskId: number) => {
    try {
      await http.delete(`${apiBase}/editor-tasks/${taskId}`);
      setItems((prev) => prev.filter((item) => item.id !== taskId));
      selection.setSelected((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
      toast.success("Tugas dihapus.", { title: "Berhasil" });
    } catch {
      toast.error("Gagal menghapus tugas.", { title: "Error" });
    }
  };

  const onBulkDelete = async () => {
    if (selection.count === 0) return;
    setBulkDeleting(true);
    try {
      const result = await runWithConcurrency(selection.selectedIds, 4, async (id) => {
        await http.delete(`${apiBase}/editor-tasks/${id}`);
      });

      if (result.failed.length) {
        toast.error(`Berhasil menghapus ${result.succeeded.length}, gagal ${result.failed.length}.`, { title: "Sebagian gagal" });
        selection.setSelected(new Set(result.failed.map((f) => f.id)));
      } else {
        toast.success(`Berhasil menghapus ${result.succeeded.length} tugas.`, { title: "Berhasil" });
        selection.clear();
      }

      void fetchTasks(1);
    } catch {
      toast.error("Gagal menghapus beberapa tugas.", { title: "Bulk Delete Error" });
    } finally {
      setBulkDeleting(false);
    }
  };

  const onCancelTask = async (taskId: number, reason: string) => {
    try {
      await http.put(`${apiBase}/editor-tasks/${taskId}`, {
        status: "cancelled",
        cancel_reason: reason,
      });
      setItems((prev) =>
        prev.map((item) =>
          item.id === taskId ? { ...item, status: "cancelled", cancel_reason: reason } : item
        )
      );
      toast.success("Tugas dibatalkan.", { title: "Berhasil" });
    } catch {
      toast.error("Gagal membatalkan tugas.", { title: "Error" });
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-in space-y-8 pb-10">
      <AdminTaskHeader onAddClick={() => navigate(`${routeBase}/editor-tasks/create`)} />

      <AdminTaskFilters
        q={q}
        setQ={setQ}
        status={status}
        setStatus={setStatus}
        priority={priority}
        setPriority={setPriority}
        assignedTo={assignedTo}
        setAssignedTo={setAssignedTo}
        perPage={perPage}
        setPerPage={setPerPage}
        total={total}
        loading={loading}
        editors={editors}
        onReset={onResetFilters}
      />

      {error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 flex items-start gap-4 shadow-sm">
          <div>
            <h3 className="font-bold text-rose-700">Terjadi Kesalahan</h3>
            <p className="text-sm text-rose-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Bulk Action Bar */}
      <BulkActionsBar
        count={selection.count}
        itemLabel="tugas"
        onClear={selection.clear}
        onSelectAllPage={() => selection.toggleAll(pageIds)}
        onDeleteSelected={onBulkDelete}
        disabled={loading || bulkDeleting}
      />

      <AdminTaskList
        items={items}
        loading={loading}
        onDelete={onDeleteTask}
        onCancel={onCancelTask}
        selection={selection}
        pageIds={pageIds}
      />

      {total > 0 && (
        <AdminTaskPagination
          pageLabel={pageLabel}
          page={page}
          lastPage={lastPage}
          loading={loading}
          onPageChange={(nextPage) => void fetchTasks(nextPage)}
        />
      )}
    </div>
  );
}

export default AdminEditorTasksPage;
