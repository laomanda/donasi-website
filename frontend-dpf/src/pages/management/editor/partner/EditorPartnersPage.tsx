import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../../../../lib/http";
import { useToast } from "../../../../components/ui/ToastProvider";
import { useBulkSelection } from "../../../../components/ui/useBulkSelection";
import { BulkActionsBar } from "../../../../components/ui/BulkActionsBar";
import { runWithConcurrency } from "../../../../lib/bulk";
import type { Partner } from "../../../../components/management/editor/partner/EditorPartnerTypes";

import EditorPartnersHeader from "../../../../components/management/editor/partner/list/EditorPartnersHeader";
import EditorPartnersFilter from "../../../../components/management/editor/partner/list/EditorPartnersFilter";
import EditorPartnersTable from "../../../../components/management/editor/partner/list/EditorPartnersTable";

export default function EditorPartnersPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [items, setItems] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [bulkDeleting, setBulkDeleting] = useState(false);
  
  const selection = useBulkSelection<number>();

  const fetchPartners = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get<Partner[]>("/editor/partners");
      const list = Array.isArray(res.data) ? res.data : [];
      setItems(list);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data mitra.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPartners();
  }, []);

  const filtered = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    const statusValue = status;

    const list = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return list.filter((p) => {
      const matchQuery =
        !term ||
        String(p.name ?? "").toLowerCase().includes(term) ||
        String(p.url ?? "").toLowerCase().includes(term);
      const matchStatus =
        statusValue === ""
          ? true
          : statusValue === "active"
            ? p.is_active === true
            : p.is_active === false;
      return matchQuery && matchStatus;
    });
  }, [items, searchQuery, status]);

  const total = filtered.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(page, lastPage);
  const paged = useMemo(
    () => filtered.slice((currentPage - 1) * perPage, currentPage * perPage),
    [filtered, currentPage, perPage]
  );
  const pageIds = useMemo(() => paged.map((p) => p.id), [paged]);

  useEffect(() => {
    selection.keepOnly(pageIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIds.join(",")]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, status, perPage]);

  useEffect(() => {
    if (page !== currentPage) setPage(currentPage);
  }, [currentPage, page]);

  const activeCount = useMemo(() => items.filter((p) => p.is_active).length, [items]);
  const pageLabel = useMemo(() => {
    if (!total) return "Tidak ada data.";
    const start = (currentPage - 1) * perPage + 1;
    const end = Math.min(currentPage * perPage, total);
    return `Menampilkan ${start}-${end} dari ${total}.`;
  }, [currentPage, perPage, total]);

  const onDeleteSelected = async () => {
    if (selection.count === 0) return;
    setBulkDeleting(true);
    setError(null);
    try {
      const result = await runWithConcurrency(selection.selectedIds, 4, async (id) => {
        await http.delete(`/editor/partners/${id}`);
      });
      if (result.failed.length) {
        setError(`Berhasil menghapus ${result.succeeded.length}, gagal ${result.failed.length}.`);
        selection.setSelected(new Set(result.failed.map((f) => f.id)));
      } else {
        toast.success(`Berhasil menghapus ${result.succeeded.length} mitra.`, { title: "Berhasil" });
        selection.clear();
      }
      await fetchPartners();
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-20">
      <EditorPartnersHeader
        total={items.length}
        activeCount={activeCount}
        pageLabel={pageLabel}
        onCreate={() => navigate("/editor/partners/create")}
      />

      <EditorPartnersFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        status={status}
        onStatusChange={setStatus}
        perPage={perPage}
        onPerPageChange={setPerPage}
        onReset={() => {
          setSearchQuery("");
          setStatus("");
        }}
      />

      {error ? (
        <div className="rounded-2xl border border-rose-600 bg-rose-500 p-4 text-sm font-semibold text-white">
          {error}
        </div>
      ) : null}

      <BulkActionsBar
        count={selection.count}
        itemLabel="mitra"
        onClear={selection.clear}
        onSelectAllPage={() => selection.toggleAll(pageIds)}
        onDeleteSelected={onDeleteSelected}
        disabled={loading || bulkDeleting}
      />

      <EditorPartnersTable
        partners={paged}
        loading={loading}
        selection={selection}
        pageIds={pageIds}
        onEdit={(id) => navigate(`/editor/partners/${id}/edit`)}
      />

      <Pagination
        currentPage={currentPage}
        lastPage={lastPage}
        onPageChange={setPage}
      />
    </div>
  );
}

function Pagination({
  currentPage,
  lastPage,
  onPageChange,
  className = "",
}: {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number | ((prev: number) => number)) => void;
  className?: string;
}) {
  return (
    <div className={[`flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between`, className].join(" ")}>
      <p className="text-xs font-semibold text-slate-500">Halaman {currentPage} dari {lastPage}</p>
      <div className="grid grid-cols-2 gap-3 w-full sm:flex sm:w-auto sm:items-center sm:gap-2">
        <button
          type="button"
          onClick={() => onPageChange((prev) => Math.max(1, prev - 1))}
          disabled={currentPage <= 1}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[100px]"
        >
          Sebelumnya
        </button>
        <button
          type="button"
          onClick={() => onPageChange((prev) => Math.min(lastPage, prev + 1))}
          disabled={currentPage >= lastPage}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[100px]"
        >
          Berikutnya
        </button>
      </div>
    </div>
  );
}
