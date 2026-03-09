import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../../../../lib/http";
import { useToast } from "../../../../components/ui/ToastProvider";
import { useBulkSelection } from "../../../../components/ui/useBulkSelection";
import { BulkActionsBar } from "../../../../components/ui/BulkActionsBar";
import { runWithConcurrency } from "../../../../lib/bulk";
import type { Tag } from "../../../../components/management/editor/tag/EditorTagTypes";

import EditorTagsHeader from "../../../../components/management/editor/tag/list/EditorTagsHeader";
import EditorTagsTable from "../../../../components/management/editor/tag/list/EditorTagsTable";

export default function EditorTagsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selection = useBulkSelection<number>();
  const pageIds = useMemo(() => tags.map((t) => t.id), [tags]);

  const fetchTags = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get<Tag[]>("/editor/tags");
      const list = Array.isArray(res.data) ? res.data : [];
      setTags(list);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data tag.");
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTags();
  }, []);

  useEffect(() => {
    selection.keepOnly(pageIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIds.join(",")]);

  const handleDelete = async (tag: Tag) => {
    setDeletingId(tag.id);
    setError(null);
    try {
      await http.delete(`/editor/tags/${tag.id}`);
      toast.success("Tag berhasil dihapus.");
      await fetchTags();
    } catch (err) {
      console.error(err);
      setError("Gagal menghapus tag.");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const onDeleteSelected = async () => {
    if (selection.count === 0) return;
    setBulkDeleting(true);
    setConfirmDeleteId(null);
    setError(null);
    try {
      const result = await runWithConcurrency(selection.selectedIds, 4, async (id) => {
        await http.delete(`/editor/tags/${id}`);
      });
      if (result.failed.length) {
        setError(`Berhasil menghapus ${result.succeeded.length}, gagal ${result.failed.length}.`);
        selection.setSelected(new Set(result.failed.map((f) => f.id)));
      } else {
        toast.success(`Berhasil menghapus ${result.succeeded.length} tag.`);
        selection.clear();
      }
      await fetchTags();
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <EditorTagsHeader 
        total={tags.length} 
        onCreate={() => navigate("/editor/tags/create")} 
      />

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700 animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}

      <BulkActionsBar
        count={selection.count}
        itemLabel="tag"
        onClear={selection.clear}
        onSelectAllPage={() => selection.toggleAll(pageIds)}
        onDeleteSelected={onDeleteSelected}
        disabled={loading || bulkDeleting}
      />

      <EditorTagsTable
        tags={tags}
        loading={loading}
        selection={selection}
        onEdit={(id) => navigate(`/editor/tags/${id}/edit`)}
        onDelete={handleDelete}
        confirmDeleteId={confirmDeleteId}
        setConfirmDeleteId={setConfirmDeleteId}
        deletingId={deletingId}
        bulkDeleting={bulkDeleting}
      />
    </div>
  );
}
