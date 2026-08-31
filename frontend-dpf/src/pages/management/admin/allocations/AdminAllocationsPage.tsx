import { useEffect, useState, useMemo } from "react";
import http from "@/lib/http";
import { useToast } from "@/components/ui/ToastProvider";
import { BulkActionsBar } from "@/components/ui/BulkActionsBar";
import { useBulkSelection } from "@/components/ui/useBulkSelection";

// Modular Components
import AdminAllocationHeader from "@/components/management/admin/allocations/AdminAllocationHeader";
import AdminAllocationFilters from "@/components/management/admin/allocations/AdminAllocationFilters";
import AdminAllocationTable from "@/components/management/admin/allocations/AdminAllocationTable";
import AdminAllocationList from "@/components/management/admin/allocations/AdminAllocationList";
import AdminAllocationPagination from "@/components/management/admin/allocations/AdminAllocationPagination";

// Types
import type { Allocation, AllocatableProgram } from "@/types/allocation";

const formatDate = (value: string | null | undefined) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value);
};

export function AdminAllocationsPage() {
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [allocations, setAllocations] = useState<Allocation[]>([]);
    const [q, setQ] = useState("");
    const [programId, setProgramId] = useState("");
    const [programs, setPrograms] = useState<AllocatableProgram[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const perPage = 25;

    // Bulk selection state
    const selection = useBulkSelection<number>();
    const pageIds = useMemo(() => allocations.map((a) => a.id), [allocations]);
    const [bulkDeleting, setBulkDeleting] = useState(false);

    // Fetch programs for filter dropdown
    useEffect(() => {
        http.get<{ data: AllocatableProgram[] }>("/admin/allocations/allocatable-programs")
            .then((res) => {
                const list = Array.isArray(res.data?.data) ? res.data.data : [];
                setPrograms(list);
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        selection.keepOnly(pageIds);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageIds.join(",")]);

    const fetchData = async (search = "", pageNum = 1, selectedProg = "") => {
        setLoading(true);
        try {
            const { data } = await http.get("/admin/allocations", {
                params: {
                    q: search,
                    page: pageNum,
                    per_page: perPage,
                    program_id: selectedProg || undefined,
                },
            });
            setAllocations(data.data.data);
            setTotal(data.data.total);
            setLastPage(data.data.last_page);
        } catch (err) {
            console.error(err);
            toast.error("Gagal memuat data penyaluran.", { title: "Gagal" });
        } finally {
            setLoading(false);
        }
    };

    const onDeleteSelected = async () => {
        if (selection.count === 0) return;
        setBulkDeleting(true);
        try {
            const ids = selection.selectedIds;
            await Promise.all(ids.map((id) => http.delete(`/admin/allocations/${id}`)));
            toast.success(`Berhasil menghapus ${ids.length} data penyaluran. Saldo program telah dikembalikan.`, {
                title: "Berhasil",
            });
            selection.clear();
            fetchData(q, page, programId);
        } catch (err: any) {
            console.error(err);
            toast.error("Gagal menghapus sebagian atau seluruh data penyaluran.", { title: "Gagal" });
        } finally {
            setBulkDeleting(false);
        }
    };

    const downloadFile = (data: Blob, filename: string) => {
        const url = window.URL.createObjectURL(data);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
    };

    const handleExport = async (format: "pdf" | "xlsx") => {
        setExporting(true);
        try {
            const res = await http.get("/admin/allocations/export", {
                params: {
                    q: q.trim() || undefined,
                    program_id: programId || undefined,
                    format,
                },
                responseType: "blob",
            });
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
            const filename = `laporan-penyaluran-dpf-${timestamp}.${format}`;
            downloadFile(res.data, filename);
            toast.success(`Laporan penyaluran berhasil diunduh (${format.toUpperCase()}).`, { title: "Berhasil" });
        } catch (err) {
            console.error(err);
            toast.error("Gagal mengekspor laporan penyaluran.", { title: "Export Gagal" });
        } finally {
            setExporting(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            void fetchData(q, page, programId);
        }, 300);
        return () => clearTimeout(timer);
    }, [q, page, programId]);

    // Reset page when search or program filter changes
    useEffect(() => {
        setPage(1);
    }, [q, programId]);

    const pageLabel = `Halaman ${page} dari ${lastPage} (Total ${total} Penyaluran)`;

    return (
        <div className="mx-auto w-full max-w-7xl animate-fade-in space-y-8 pb-10">
            <AdminAllocationHeader
                total={total}
                exporting={exporting}
                onExport={handleExport}
            />

            <AdminAllocationFilters
                q={q}
                setQ={setQ}
                programId={programId}
                setProgramId={setProgramId}
                programs={programs}
            />

            {/* Bulk Actions Bar */}
            <BulkActionsBar
                count={selection.count}
                itemLabel="penyaluran"
                onClear={selection.clear}
                onSelectAllPage={() => selection.toggleAll(pageIds)}
                onDeleteSelected={onDeleteSelected}
                disabled={loading || bulkDeleting}
            />

            <div className="rounded-[32px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
                <AdminAllocationTable
                    allocations={allocations}
                    loading={loading}
                    formatDate={formatDate}
                    formatCurrency={formatCurrency}
                    pageIds={pageIds}
                    selected={selection.selected}
                    onToggle={selection.toggle}
                    onToggleAll={() => selection.toggleAll(pageIds)}
                />

                <AdminAllocationList
                    allocations={allocations}
                    loading={loading}
                    formatDate={formatDate}
                    formatCurrency={formatCurrency}
                    selected={selection.selected}
                    onToggle={selection.toggle}
                />

                <AdminAllocationPagination
                    page={page}
                    lastPage={lastPage}
                    total={total}
                    perPage={perPage}
                    loading={loading}
                    pageLabel={pageLabel}
                    onPageChange={setPage}
                />
            </div>
        </div>
    );
}

export default AdminAllocationsPage;
