import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../../../../lib/http";
import { useToast } from "../../../../components/ui/ToastProvider";
import { runWithConcurrency } from "../../../../lib/bulk";
import { useBulkSelection } from "../../../../components/ui/useBulkSelection";
import { BulkActionsBar } from "../../../../components/ui/BulkActionsBar";

import { EditorBanksHeader } from "../../../../components/management/editor/bank/list/EditorBanksHeader";
import { EditorBanksFilter } from "../../../../components/management/editor/bank/list/EditorBanksFilter";
import { EditorBanksTable } from "../../../../components/management/editor/bank/list/EditorBanksTable";
import type { BankAccount } from "../../../../components/management/editor/bank/EditorBankTypes";

export function EditorBanksPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [items, setItems] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const selection = useBulkSelection<number>();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | "active" | "inactive">("");
  const [bankType, setBankType] = useState<"" | "domestic" | "international">("");

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get<BankAccount[]>("/editor/bank-accounts");
      const list = Array.isArray(res.data) ? res.data : [];
      setItems(list);
    } catch {
      setError("Gagal memuat data rekening.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return list.filter((acc) => {
      const matchQuery =
        !term ||
        String(acc.bank_name ?? "").toLowerCase().includes(term) ||
        String(acc.account_number ?? "").toLowerCase().includes(term) ||
        String(acc.account_name ?? "").toLowerCase().includes(term);
      const matchStatus =
        status === ""
          ? true
          : status === "active"
            ? acc.is_visible_public === true
            : acc.is_visible_public === false;
      const matchType =
        bankType === ""
          ? true
          : (acc.type || "domestic") === bankType;
      return matchQuery && matchStatus && matchType;
    });
  }, [items, q, status, bankType]);

  const filteredIds = useMemo(() => filtered.map((acc) => acc.id), [filtered]);

  useEffect(() => {
    selection.keepOnly(filteredIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredIds.join(",")]);

  const activeCount = useMemo(() => items.filter((acc) => acc.is_visible_public).length, [items]);

  const onDeleteSelected = async () => {
    if (selection.count === 0) return;
    setBulkDeleting(true);
    try {
      const result = await runWithConcurrency(selection.selectedIds, 4, async (id) => {
        await http.delete(`/editor/bank-accounts/${id}`);
      });

      if (result.failed.length) {
        toast.error(`Berhasil menghapus ${result.succeeded.length}, gagal ${result.failed.length}.`, { title: "Sebagian gagal" });
        selection.setSelected(new Set(result.failed.map((f) => f.id)));
      } else {
        toast.success(`Berhasil menghapus ${result.succeeded.length} rekening.`, { title: "Berhasil" });
        selection.clear();
      }

      await fetchAccounts();
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <EditorBanksHeader
        totalItems={items.length}
        activeCount={activeCount}
        onAdd={() => navigate("/editor/bank-accounts/create")}
      />

      <EditorBanksFilter
        q={q}
        setQ={setQ}
        status={status}
        setStatus={setStatus}
        bankType={bankType}
        setBankType={setBankType}
      />

      {error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>
      ) : null}

      <BulkActionsBar
        count={selection.count}
        itemLabel="rekening"
        onClear={selection.clear}
        onSelectAllPage={() => selection.toggleAll(filteredIds)}
        onDeleteSelected={onDeleteSelected}
        disabled={loading || bulkDeleting}
      />

      <EditorBanksTable
        items={filtered}
        loading={loading}
        isSelected={selection.isSelected}
        onToggle={selection.toggle}
        onToggleAll={() => selection.toggleAll(filteredIds)}
        allSelected={filteredIds.length > 0 && filteredIds.every((id) => selection.isSelected(id))}
        onEdit={(id) => navigate(`/editor/bank-accounts/${id}/edit`)}
      />
    </div>
  );
}

export default EditorBanksPage;



