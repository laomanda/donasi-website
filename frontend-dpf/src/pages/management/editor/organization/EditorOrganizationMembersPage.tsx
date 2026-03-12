import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../../../../lib/http";
import { useToast } from "../../../../components/ui/ToastProvider";
import { runWithConcurrency } from "../../../../lib/bulk";
import { useBulkSelection } from "../../../../components/ui/useBulkSelection";
import { BulkActionsBar } from "../../../../components/ui/BulkActionsBar";
import type { OrganizationMember, PaginationPayload } from "../../../../components/management/editor/organization/EditorOrganizationMemberTypes";
import { GROUP_SUGGESTIONS } from "../../../../components/management/editor/organization/EditorOrganizationMemberTypes";

import EditorOrganizationMembersHeader from "../../../../components/management/editor/organization/list/EditorOrganizationMembersHeader";
import EditorOrganizationMembersFilter from "../../../../components/management/editor/organization/list/EditorOrganizationMembersFilter";
import EditorOrganizationMembersTable from "../../../../components/management/editor/organization/list/EditorOrganizationMembersTable";

export function EditorOrganizationMembersPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [items, setItems] = useState<OrganizationMember[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const [group, setGroup] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [bulkDeleting, setBulkDeleting] = useState(false);
  const selection = useBulkSelection<number>();
  const pageIds = useMemo(() => items.map((m) => m.id), [items]);

  const filterInitializedRef = useRef(false);
  const skipFilterRef = useRef(false);

  const fetchMembers = async (
    nextPage: number,
    overrides?: Partial<{ q: string; group: string; perPage: number }>
  ) => {
    const qValue = (overrides?.q ?? q).trim();
    const groupValue = (overrides?.group ?? group).trim();
    const perPageValue = overrides?.perPage ?? perPage;

    setLoading(true);
    setError(null);
    try {
      const res = await http.get<PaginationPayload<OrganizationMember>>("/editor/organization-members", {
        params: {
          page: nextPage,
          per_page: perPageValue,
          q: qValue || undefined,
          group: groupValue || undefined,
        },
      });
      setItems(res.data.data ?? []);
      setPage(res.data.current_page ?? nextPage);
      setPerPage(res.data.per_page ?? perPageValue);
      setLastPage(res.data.last_page ?? 1);
      setTotal(res.data.total ?? 0);
    } catch {
      setError("Gagal memuat data struktur.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMembers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perPage]);

  useEffect(() => {
    if (!filterInitializedRef.current) {
      filterInitializedRef.current = true;
      return;
    }
    if (skipFilterRef.current) {
      skipFilterRef.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      void fetchMembers(1, { q, group });
    }, 400);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, group]);

  useEffect(() => {
    selection.keepOnly(pageIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIds.join(",")]);

  const pageLabel = useMemo(() => {
    if (!total) return "Tidak ada data.";
    const start = (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, total);
    return `Menampilkan ${start}-${end} dari ${total}.`;
  }, [page, perPage, total]);

  const onResetFilters = () => {
    skipFilterRef.current = true;
    setQ("");
    setGroup("");
    void fetchMembers(1, { q: "", group: "" });
  };

  const goEdit = (id: number) => navigate(`/editor/organization-members/${id}/edit`);

  const onDeleteSelected = async () => {
    if (selection.count === 0) return;
    setBulkDeleting(true);
    try {
      const result = await runWithConcurrency(selection.selectedIds, 4, async (id) => {
        await http.delete(`/editor/organization-members/${id}`);
      });

      if (result.failed.length) {
        toast.error(`Berhasil menghapus ${result.succeeded.length}, gagal ${result.failed.length}.`, { title: "Sebagian gagal" });
        selection.setSelected(new Set(result.failed.map((f) => f.id)));
      } else {
        toast.success(`Berhasil menghapus ${result.succeeded.length} anggota.`, { title: "Berhasil" });
        selection.clear();
      }

      await fetchMembers(page);
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <EditorOrganizationMembersHeader
        total={total}
        onCreate={() => navigate("/editor/organization-members/create")}
      />

      <EditorOrganizationMembersFilter
        searchQuery={q}
        onSearchChange={setQ}
        group={group}
        onGroupChange={setGroup}
        groupSuggestions={GROUP_SUGGESTIONS}
        perPage={perPage}
        onPerPageChange={setPerPage}
        onReset={onResetFilters}
        loading={loading}
        pageLabel={pageLabel}
      />

      {error ? (
        <div className="rounded-2xl border border-rose-600 bg-rose-500 p-4 text-sm font-semibold text-white">{error}</div>
      ) : null}

      <BulkActionsBar
        count={selection.count}
        itemLabel="anggota struktur"
        onClear={selection.clear}
        onSelectAllPage={() => selection.toggleAll(pageIds)}
        onDeleteSelected={onDeleteSelected}
        disabled={loading || bulkDeleting}
      />

      <EditorOrganizationMembersTable
        items={items}
        loading={loading}
        selection={selection}
        pageIds={pageIds}
        onEdit={goEdit}
      />

      <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold text-slate-500">Halaman {page} dari {lastPage}</p>
        <div className="grid grid-cols-2 gap-3 w-full sm:flex sm:w-auto sm:items-center sm:gap-2">
          <button
            type="button"
            onClick={() => void fetchMembers(Math.max(1, page - 1))}
            disabled={loading || page <= 1}
            className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            Sebelumnya
          </button>
          <button
            type="button"
            onClick={() => void fetchMembers(Math.min(lastPage, page + 1))}
            disabled={loading || page >= lastPage}
            className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditorOrganizationMembersPage;




