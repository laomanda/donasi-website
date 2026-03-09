import { useEffect, useMemo, useRef, useState } from "react";
import http from "../../../lib/http";
import { useToast } from "../../../components/ui/ToastProvider";
import { getAuthUser } from "../../../lib/auth";

// Tasks Components, Types, and Utils
import type { EditorTaskItem, EditorTaskPayload } from "../../../components/management/editor/tasks/EditorTasksTypes";
import { formatTaskStatus, isForwardStatus } from "../../../components/management/editor/tasks/EditorTasksUtils";
import { TaskError } from "../../../components/management/editor/tasks/EditorTasksUI";
import EditorTasksHeader from "../../../components/management/editor/tasks/EditorTasksHeader";
import EditorTasksFilters from "../../../components/management/editor/tasks/EditorTasksFilters";
import EditorTasksList from "../../../components/management/editor/tasks/EditorTasksList";
import EditorTasksPagination from "../../../components/management/editor/tasks/EditorTasksPagination";

export function EditorTasksPage() {
    const toast = useToast();
    const storedUser = useMemo(() => getAuthUser(), []);
    
    // -- State --
    const [items, setItems] = useState<EditorTaskItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [updatingIds, setUpdatingIds] = useState<number[]>([]);

    // -- Pagination State --
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);

    // -- Refs for polling --
    const pageRef = useRef(page);
    const perPageRef = useRef(perPage);
    const statusRef = useRef(statusFilter);
    const searchRef = useRef(searchQuery);
    const priorityRef = useRef(priorityFilter);
    const backgroundRefreshRef = useRef(false);

    const pageLabel = useMemo(() => {
        if (!total) return "Tidak ada data.";
        const start = (page - 1) * perPage + 1;
        const end = Math.min(page * perPage, total);
        return `Menampilkan ${start}-${end} dari ${total}.`;
    }, [page, perPage, total]);

    // -- Data Fetching --
    const fetchTasks = async (
        nextPage: number,
        overrides?: Partial<{
            status: string;
            priority: string;
            q: string;
            perPage: number;
        }>,
        options?: { silent?: boolean }
    ) => {
        const resolvedPerPage = overrides?.perPage ?? perPage;
        const resolvedStatus = overrides?.status ?? statusFilter;
        const resolvedPriority = overrides?.priority ?? priorityFilter;
        const resolvedQuery = overrides?.q ?? searchQuery;
        
        if (!options?.silent) {
            setLoading(true);
            setError(null);
        }

        try {
            const res = await http.get<EditorTaskPayload>("/editor/tasks", {
                params: {
                    page: nextPage,
                    per_page: resolvedPerPage,
                    status: resolvedStatus || undefined,
                    priority: resolvedPriority || undefined,
                    q: resolvedQuery || undefined,
                },
            });
            setItems(res.data.data ?? []);
            setPage(res.data.current_page ?? nextPage);
            setPerPage(res.data.per_page ?? resolvedPerPage);
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

    // -- Update Refs --
    useEffect(() => { pageRef.current = page; }, [page]);
    useEffect(() => { perPageRef.current = perPage; }, [perPage]);
    useEffect(() => { statusRef.current = statusFilter; }, [statusFilter]);
    useEffect(() => { searchRef.current = searchQuery; }, [searchQuery]);
    useEffect(() => { priorityRef.current = priorityFilter; }, [priorityFilter]);

    // -- Search Debounce --
    useEffect(() => {
        const handle = window.setTimeout(() => {
            setSearchQuery(searchInput.trim());
        }, 400);
        return () => window.clearTimeout(handle);
    }, [searchInput]);

    // -- Initial & Filter Fetch --
    useEffect(() => {
        void fetchTasks(1, {
            status: statusFilter,
            priority: priorityFilter,
            q: searchQuery,
            perPage,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, priorityFilter, searchQuery, perPage]);

    // -- Polling --
    useEffect(() => {
        if (typeof window === "undefined" || !storedUser) return;

        const refreshTasks = () => {
            if (backgroundRefreshRef.current) return;
            backgroundRefreshRef.current = true;
            void fetchTasks(
                pageRef.current,
                {
                    status: statusRef.current,
                    priority: priorityRef.current,
                    q: searchRef.current,
                    perPage: perPageRef.current,
                },
                { silent: true }
            ).finally(() => {
                backgroundRefreshRef.current = false;
            });
        };

        const pollId = window.setInterval(refreshTasks, 5_000);
        return () => window.clearInterval(pollId);
    }, [storedUser]);

    // -- Handlers --
    const onUpdateStatus = async (taskId: number, nextStatus: string) => {
        const current = items.find((item) => item.id === taskId);
        if (!current || current.status === nextStatus) return;
        
        if (!isForwardStatus(current.status, nextStatus)) {
            toast.error("Status tidak bisa kembali ke tahap sebelumnya.", { title: "Status tugas" });
            return;
        }

        setItems((state) =>
            state.map((item) => (item.id === taskId ? { ...item, status: nextStatus } : item))
        );
        setUpdatingIds((ids) => Array.from(new Set([...ids, taskId])));

        try {
            await http.patch(`/editor/tasks/${taskId}`, { status: nextStatus });
            toast.success(`Berhasil memperbarui status menjadi: ${formatTaskStatus(nextStatus)}`, { title: "Update tugas" });
            
            void fetchTasks(pageRef.current, {
                status: statusRef.current,
                priority: priorityRef.current,
                q: searchRef.current,
                perPage: perPageRef.current,
            }, { silent: true });
        } catch {
            setItems((state) =>
                state.map((item) => (item.id === taskId ? { ...item, status: current.status } : item))
            );
            toast.error("Gagal memperbarui status tugas.", { title: "Update tugas" });
        } finally {
            setUpdatingIds((ids) => ids.filter((id) => id !== taskId));
        }
    };

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
            <EditorTasksHeader 
                total={total}
                title="Tugas dari Admin"
                subtitle="Pantau dan selesaikan tugas yang dikirim admin atau superadmin."
                badgeLabel="Tugas Editor"
            />

            <EditorTasksFilters 
                search={searchInput}
                onSearchChange={setSearchInput}
                status={statusFilter}
                onStatusChange={setStatusFilter}
                priority={priorityFilter}
                onPriorityChange={setPriorityFilter}
                perPage={perPage}
                onPerPageChange={setPerPage}
                pageLabel={pageLabel}
            />

            {error && <TaskError message={error} />}

            <EditorTasksList 
                items={items}
                loading={loading}
                updatingIds={updatingIds}
                onStatusChange={onUpdateStatus}
                emptyMessage="Belum ada tugas yang perlu dikerjakan."
            />

            {items.length > 0 && (
                <EditorTasksPagination 
                    page={page}
                    lastPage={lastPage}
                    loading={loading}
                    onPageChange={(p) => void fetchTasks(p)}
                    pageLabel={pageLabel}
                />
            )}
        </div>
    );
}

export default EditorTasksPage;
